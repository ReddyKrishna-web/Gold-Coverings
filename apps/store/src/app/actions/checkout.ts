"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma, Prisma } from "@uma/db";
import { cartIssues, cartSubtotal, clearCoupon, findCart, loadCoupon } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { computeTotals, couponProblem } from "@/lib/pricing";
import { getStoreSettings } from "@/lib/settings";
import { generateOrderNumber, restoreOrderStock } from "@/lib/orders";
import {
  createRazorpayOrder,
  getRazorpayKeyId,
  razorpayConfigured,
} from "@/lib/razorpay";
import { sendOrderConfirmation, sendOwnerOrderAlert } from "@/lib/notify";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { BRAND } from "@uma/brand";

export type CheckoutResult =
  | { ok: true; method: "COD"; orderNumber: string; token: string }
  | {
      ok: true;
      method: "RAZORPAY";
      orderNumber: string;
      token: string;
      razorpay: {
        keyId: string;
        orderId: string;
        amountPaise: number;
        name: string;
        description: string;
        prefill: { name: string; email: string; contact: string };
      };
    }
  | { ok: false; error: string };

const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter the recipient's full name.").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s()-]{10,16}$/, "Enter a valid phone number."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  line1: z.string().trim().min(5, "Enter the house / flat and street.").max(120),
  line2: z.string().trim().max(120).optional(),
  city: z.string().trim().min(2, "Enter the city.").max(60),
  state: z.string().trim().min(2, "Enter the state.").max(60),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode."),
  notes: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  saveAddress: z.string().optional(),
});

class StockError extends Error {}

export async function createOrderAction(formData: FormData): Promise<CheckoutResult> {
  const limit = rateLimit(`checkout:${requestIp()}`, 8, 10 * 60_000);
  if (!limit.allowed) {
    return { ok: false, error: "Too many checkout attempts. Please wait a few minutes." };
  }

  const parsed = addressSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    line1: formData.get("line1"),
    line2: formData.get("line2") || undefined,
    city: formData.get("city"),
    state: formData.get("state"),
    pincode: formData.get("pincode"),
    notes: formData.get("notes") || undefined,
    paymentMethod: formData.get("paymentMethod"),
    saveAddress: formData.get("saveAddress") ?? undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const data = parsed.data;
  const user = await getCurrentUser();
  const cart = await findCart();

  if (!cart || cart.items.length === 0) {
    return { ok: false, error: "Your bag is empty. Add a piece before checking out." };
  }

  const issues = cartIssues(cart);
  if (issues.length > 0) return { ok: false, error: issues[0] };

  const settings = await getStoreSettings();
  const coupon = await loadCoupon();
  const subtotal = cartSubtotal(cart);

  if (coupon && couponProblem(coupon, subtotal)) {
    return { ok: false, error: couponProblem(coupon, subtotal) ?? "Coupon is not valid." };
  }

  const totals = computeTotals(subtotal, coupon, settings);

  if (data.paymentMethod === "RAZORPAY" && !razorpayConfigured()) {
    return { ok: false, error: "Online payment is not configured. Please choose cash on delivery." };
  }

  if (data.paymentMethod === "COD") {
    if (!settings.codEnabled) {
      return { ok: false, error: "Cash on delivery is not available right now." };
    }
    if (totals.totalPaise > settings.codMaxPaise) {
      return {
        ok: false,
        error: "This order is above the cash-on-delivery limit. Please pay online.",
      };
    }
  }

  const address = {
    fullName: data.fullName,
    phone: data.phone,
    line1: data.line1,
    line2: data.line2 ?? "",
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    country: "India",
  };

  const orderNumber = generateOrderNumber();

  type CreatedOrder = Prisma.OrderGetPayload<{ include: { items: true } }>;
  let order: CreatedOrder;
  try {
    order = await prisma.$transaction(async (tx) => {
      // Re-read stock inside the transaction and decrement conditionally.
      for (const item of cart.items) {
        const variant = await tx.productVariant.findFirst({
          where: { id: item.variantId, isActive: true, product: { isActive: true } },
          include: { product: { select: { name: true } } },
        });

        if (!variant) throw new StockError("A piece in your bag is no longer available.");
        if (variant.stock < item.quantity) {
          throw new StockError(
            `Only ${variant.stock} left of ${variant.product.name}. Please update your bag.`
          );
        }

        const updated = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count !== 1) {
          throw new StockError(`${variant.product.name} was just purchased by someone else.`);
        }

        await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            delta: -item.quantity,
            reason: "SALE",
            note: `Order ${orderNumber}`,
            actorId: user?.id ?? null,
          },
        });
      }

      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: user?.id ?? null,
          customerName: data.fullName,
          email: data.email,
          phone: data.phone,
          shippingAddress: address,
          subtotalPaise: totals.subtotalPaise,
          discountPaise: totals.discountPaise,
          shippingPaise: totals.shippingPaise,
          taxPaise: totals.taxPaise,
          totalPaise: totals.totalPaise,
          couponId: coupon?.id ?? null,
          couponCode: coupon?.code ?? null,
          status: data.paymentMethod === "COD" ? "CONFIRMED" : "PENDING_PAYMENT",
          paymentStatus: data.paymentMethod === "COD" ? "COD_PENDING" : "PENDING",
          paymentMethod: data.paymentMethod,
          notes: data.notes ?? null,
          items: {
            create: cart.items.map((item) => ({
              productId: item.variant.productId,
              variantId: item.variantId,
              name: item.variant.product.name,
              sku: item.variant.sku,
              variantLabel:
                [item.variant.size, item.variant.finish].filter(Boolean).join(" · ") || "One size",
              imageUrl: item.variant.product.images[0]?.url ?? null,
              unitPricePaise: item.variant.pricePaise,
              quantity: item.quantity,
              lineTotalPaise: item.variant.pricePaise * item.quantity,
            })),
          },
          history: {
            create: {
              status: data.paymentMethod === "COD" ? "CONFIRMED" : "PENDING_PAYMENT",
              note:
                data.paymentMethod === "COD"
                  ? "Cash on delivery order placed"
                  : "Order created, awaiting payment",
            },
          },
          payments: {
            create: {
              provider: data.paymentMethod === "COD" ? "cod" : "razorpay",
              amountPaise: totals.totalPaise,
              status: data.paymentMethod === "COD" ? "COD_PENDING" : "PENDING",
              method: data.paymentMethod,
            },
          },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      if (user && data.saveAddress === "on") {
        const existingCount = await tx.address.count({ where: { userId: user.id } });
        await tx.address.create({
          data: {
            userId: user.id,
            label: existingCount === 0 ? "Home" : "Saved address",
            fullName: data.fullName,
            phone: data.phone,
            line1: data.line1,
            line2: data.line2 ?? null,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            isDefault: existingCount === 0,
          },
        });
      }

      return created;
    });
  } catch (error) {
    if (error instanceof StockError) return { ok: false, error: error.message };

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "Could not place the order. Please try again." };
    }

    console.error("[checkout] Order transaction failed:", error);
    return { ok: false, error: "Could not place the order. Please try again or contact the store." };
  }

  const emailInput = {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    email: order.email,
    totalPaise: order.totalPaise,
    paymentMethod:
      order.paymentMethod === "COD" ? "Cash on delivery" : "Razorpay (online)",
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      lineTotalPaise: item.lineTotalPaise,
    })),
  };

  clearCoupon();
  revalidatePath("/cart");
  revalidatePath("/", "layout");

  if (data.paymentMethod === "COD") {
    await Promise.allSettled([sendOrderConfirmation(emailInput), sendOwnerOrderAlert(emailInput)]);
    return { ok: true, method: "COD", orderNumber: order.orderNumber, token: order.publicToken };
  }

  // Online payment: create the Razorpay order only after our order exists.
  try {
    const razorpayOrder = await createRazorpayOrder({
      amountPaise: totals.totalPaise,
      receipt: order.orderNumber,
      orderNumber: order.orderNumber,
    });

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: razorpayOrder.id },
      }),
      prisma.payment.updateMany({
        where: { orderId: order.id, status: "PENDING" },
        data: { providerOrderId: razorpayOrder.id },
      }),
    ]);

    const keyId = getRazorpayKeyId();
    if (!keyId) throw new Error("Razorpay key missing");

    return {
      ok: true,
      method: "RAZORPAY",
      orderNumber: order.orderNumber,
      token: order.publicToken,
      razorpay: {
        keyId,
        orderId: razorpayOrder.id,
        amountPaise: totals.totalPaise,
        name: BRAND.name,
        description: `${order.orderNumber} · ${BRAND.name}`,
        prefill: { name: order.customerName, email: order.email, contact: order.phone },
      },
    };
  } catch (error) {
    console.error("[checkout] Could not start Razorpay payment:", error);

    // Release the reserved stock — the order never reached the payment step.
    await prisma.$transaction(async (tx) => {
      await restoreOrderStock(tx, order.id, null, "Payment could not be started");
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          paymentStatus: "FAILED",
          history: {
            create: {
              status: "CANCELLED",
              note: "Payment provider unavailable; stock released",
            },
          },
        },
      });
      await tx.payment.updateMany({
        where: { orderId: order.id },
        data: { status: "FAILED" },
      });
    });

    return {
      ok: false,
      error: "We could not start the online payment. No money was taken — please try again or use COD.",
    };
  }
}
