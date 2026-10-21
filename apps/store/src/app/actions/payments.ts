"use server";

import { prisma } from "@uma/db";
import { getCurrentUser } from "@/lib/auth";
import { createRazorpayOrder, getRazorpayKeyId, razorpayConfigured } from "@/lib/razorpay";

export type RetryResult =
  | {
      ok: true;
      razorpay: { keyId: string; orderId: string; amountPaise: number; description: string };
    }
  | { ok: false; error: string };

export async function retryPaymentAction(formData: FormData): Promise<RetryResult> {
  const orderNumber = String(formData.get("orderNumber") ?? "");
  const token = String(formData.get("token") ?? "");

  if (!razorpayConfigured()) {
    return { ok: false, error: "Online payment is not configured. Please contact the store." };
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      id: true,
      orderNumber: true,
      totalPaise: true,
      paymentStatus: true,
      status: true,
      publicToken: true,
      userId: true,
      customerName: true,
      email: true,
      phone: true,
    },
  });

  if (!order) return { ok: false, error: "Order not found." };

  const user = await getCurrentUser();
  const ownsOrder =
    order.publicToken === token ||
    (user && (user.role === "OWNER" || user.role === "STAFF" || order.userId === user.id));

  if (!ownsOrder) return { ok: false, error: "You cannot pay for this order." };
  if (order.paymentStatus === "PAID") return { ok: false, error: "This order is already paid." };
  if (order.status !== "PENDING_PAYMENT") {
    return { ok: false, error: "This order is not awaiting payment." };
  }

  try {
    const razorpayOrder = await createRazorpayOrder({
      amountPaise: order.totalPaise,
      receipt: order.orderNumber,
      orderNumber: order.orderNumber,
    });

    await prisma.$transaction([
      prisma.payment.updateMany({
        where: { orderId: order.id, status: "PENDING" },
        data: { status: "FAILED" },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: {
          razorpayOrderId: razorpayOrder.id,
          payments: {
            create: {
              provider: "razorpay",
              providerOrderId: razorpayOrder.id,
              amountPaise: order.totalPaise,
              status: "PENDING",
              method: "RAZORPAY",
            },
          },
        },
      }),
    ]);

    const keyId = getRazorpayKeyId();
    if (!keyId) throw new Error("Missing Razorpay key");

    return {
      ok: true,
      razorpay: {
        keyId,
        orderId: razorpayOrder.id,
        amountPaise: order.totalPaise,
        description: `Retry payment · ${order.orderNumber}`,
      },
    };
  } catch (error) {
    console.error("[payments] Retry failed:", error);
    return { ok: false, error: "Could not restart the payment. Please contact the store." };
  }
}
