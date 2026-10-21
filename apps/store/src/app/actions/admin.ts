"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma, Prisma, type OrderStatus, type ReviewStatus } from "@uma/db";
import { assertOwner, assertStaff } from "@/lib/auth";
import { canTransition, restoreOrderStock, writeAuditLog } from "@/lib/orders";

function backTo(path: string, message: string): never {
  redirect(`${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`);
  // redirect() throws; the return keeps TypeScript satisfied.
  throw new Error(message);
}

function paiseFrom(value: FormDataEntryValue | null): number {
  const parsed = Number(String(value ?? "0").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

function intFrom(value: FormDataEntryValue | null, fallback = 0): number {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 70);
}

const IMAGE_PATTERN = /^\/(images|uploads)\/[A-Za-z0-9._/-]+$/;

function parseImages(raw: FormDataEntryValue | null): { url: string; alt: string }[] | null {
  const text = String(raw ?? "").trim();
  if (!text) return null;

  const lines = text
    .split(/[\n,]+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.some((line) => !IMAGE_PATTERN.test(line))) return null;

  return lines.slice(0, 8).map((url, index) => ({
    url,
    alt: `Product image ${index + 1}`,
  }));
}

const productSchema = z.object({
  name: z.string().trim().min(2, "Enter a product name.").max(120),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug can use lowercase letters, numbers and hyphens only."),
  categoryId: z.string().min(1, "Choose a collection."),
  description: z.string().trim().min(20, "Write at least a short description.").max(4000),
  careInfo: z.string().trim().max(1000).optional(),
  pricePaise: z.number().int().positive("Enter a price."),
  mrpPaise: z.number().int().nonnegative(),
  sku: z.string().trim().max(60).optional(),
  stock: z.number().int().min(0, "Stock cannot be negative.").max(100000),
  size: z.string().trim().max(40).optional(),
  finish: z.string().trim().max(40).optional(),
  images: z.string().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  isBestseller: z.boolean(),
});

export async function createProductAction(formData: FormData) {
  const admin = await assertStaff();

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const images = parseImages(formData.get("images"));

  const parsed = productSchema.safeParse({
    name,
    slug: slugInput || slugify(name),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    careInfo: formData.get("careInfo") || undefined,
    pricePaise: paiseFrom(formData.get("price")),
    mrpPaise: paiseFrom(formData.get("mrp")),
    sku: formData.get("sku") || undefined,
    stock: intFrom(formData.get("stock"), 0),
    size: formData.get("size") || undefined,
    finish: formData.get("finish") || undefined,
    images: formData.get("images")?.toString(),
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    isBestseller: formData.get("isBestseller") === "on",
  });

  if (!parsed.success) backTo("/admin/products/new", parsed.error.issues[0]?.message ?? "Check the form.");
  if (!images) {
    backTo(
      "/admin/products/new",
      "Add at least one image path like /images/jewel-1.jpg (files live in public/images)."
    );
  }
  if (parsed.data.mrpPaise > 0 && parsed.data.mrpPaise < parsed.data.pricePaise) {
    backTo("/admin/products/new", "MRP cannot be lower than the selling price.");
  }

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) backTo("/admin/products/new", "That collection does not exist.");

  const variantSku = parsed.data.sku || `${slugify(parsed.data.slug).toUpperCase()}-01`;

  try {
    const product = await prisma.product.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        categoryId: parsed.data.categoryId,
        description: parsed.data.description,
        careInfo: parsed.data.careInfo ?? null,
        sku: variantSku,
        pricePaise: parsed.data.pricePaise,
        mrpPaise: parsed.data.mrpPaise > 0 ? parsed.data.mrpPaise : null,
        isActive: parsed.data.isActive,
        isFeatured: parsed.data.isFeatured,
        isBestseller: parsed.data.isBestseller,
        searchTerms: `${parsed.data.name} ${category.name}`,
        images: { create: images.map((image, index) => ({ ...image, sortOrder: index })) },
        variants: {
          create: {
            sku: variantSku,
            size: parsed.data.size ?? null,
            finish: parsed.data.finish ?? "Gold tone",
            pricePaise: parsed.data.pricePaise,
            stock: parsed.data.stock,
          },
        },
      },
      include: { variants: true },
    });

    if (parsed.data.stock > 0) {
      await prisma.inventoryMovement.create({
        data: {
          variantId: product.variants[0].id,
          delta: parsed.data.stock,
          reason: "RESTOCK",
          note: "Initial stock",
          actorId: admin.id,
        },
      });
    }

    await writeAuditLog(admin.id, "product.created", "Product", product.id, {
      name: product.name,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      backTo("/admin/products/new", "That slug or SKU is already in use.");
    }
    console.error("[admin] Could not create product:", error);
    backTo("/admin/products/new", "Could not create the product.");
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products?created=1");
}

export async function updateProductAction(formData: FormData) {
  const admin = await assertStaff();
  const id = String(formData.get("id") ?? "");
  if (!id) backTo("/admin/products", "Missing product id.");

  const existing = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });
  if (!existing) backTo("/admin/products", "Product not found.");

  const name = String(formData.get("name") ?? "").trim();
  const images = parseImages(formData.get("images"));

  const parsed = productSchema.safeParse({
    name,
    slug: String(formData.get("slug") ?? "").trim() || slugify(name),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    careInfo: formData.get("careInfo") || undefined,
    pricePaise: paiseFrom(formData.get("price")),
    mrpPaise: paiseFrom(formData.get("mrp")),
    sku: formData.get("sku") || undefined,
    stock: 0,
    size: formData.get("size") || undefined,
    finish: formData.get("finish") || undefined,
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    isBestseller: formData.get("isBestseller") === "on",
  });

  if (!parsed.success) backTo(`/admin/products/${id}`, parsed.error.issues[0]?.message ?? "Check the form.");
  if (!images) backTo(`/admin/products/${id}`, "Keep at least one valid image path.");
  if (parsed.data.mrpPaise > 0 && parsed.data.mrpPaise < parsed.data.pricePaise) {
    backTo(`/admin/products/${id}`, "MRP cannot be lower than the selling price.");
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: parsed.data.name,
          slug: parsed.data.slug,
          categoryId: parsed.data.categoryId,
          description: parsed.data.description,
          careInfo: parsed.data.careInfo ?? null,
          pricePaise: parsed.data.pricePaise,
          mrpPaise: parsed.data.mrpPaise > 0 ? parsed.data.mrpPaise : null,
          isActive: parsed.data.isActive,
          isFeatured: parsed.data.isFeatured,
          isBestseller: parsed.data.isBestseller,
          images: {
            deleteMany: {},
            create: images.map((image, index) => ({ ...image, sortOrder: index })),
          },
        },
      });

      for (const variant of existing.variants) {
        const nextStock = intFrom(formData.get(`stock_${variant.id}`), variant.stock);
        const nextPrice = paiseFrom(formData.get(`price_${variant.id}`)) || variant.pricePaise;
        const delta = Math.max(0, nextStock) - variant.stock;

        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: Math.max(0, nextStock), pricePaise: nextPrice },
        });

        if (delta !== 0) {
          await tx.inventoryMovement.create({
            data: {
              variantId: variant.id,
              delta,
              reason: "ADJUSTMENT",
              note: "Stock adjusted in admin",
              actorId: admin.id,
            },
          });
        }
      }
    });

    await writeAuditLog(admin.id, "product.updated", "Product", id, { name: parsed.data.name });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      backTo(`/admin/products/${id}`, "That slug is already used by another product.");
    }
    console.error("[admin] Could not update product:", error);
    backTo(`/admin/products/${id}`, "Could not save the product.");
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/shop");
  revalidatePath(`/product/${parsed.data.slug}`);
  redirect(`/admin/products/${id}?saved=1`);
}

export async function toggleProductAction(formData: FormData) {
  const admin = await assertStaff();
  const id = String(formData.get("id") ?? "");
  const product = await prisma.product.findUnique({ where: { id }, select: { isActive: true, name: true } });
  if (!product) backTo("/admin/products", "Product not found.");

  await prisma.product.update({ where: { id }, data: { isActive: !product.isActive } });
  await writeAuditLog(admin.id, product.isActive ? "product.hidden" : "product.published", "Product", id, {
    name: product.name,
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, "Coupon codes need at least 3 characters.")
    .max(30)
    .regex(/^[A-Z0-9_-]+$/, "Use letters, numbers, hyphen or underscore only."),
  description: z.string().trim().max(160).optional(),
  type: z.enum(["PERCENT", "FLAT"]),
  value: z.number().int().positive("Enter a discount value."),
  minOrderPaise: z.number().int().nonnegative(),
  maxUses: z.number().int().nonnegative().optional(),
  endsAt: z.string().optional(),
});

export async function createCouponAction(formData: FormData) {
  const admin = await assertOwner();

  const type = String(formData.get("type") ?? "PERCENT") === "FLAT" ? "FLAT" : "PERCENT";
  const rawValue = type === "PERCENT" ? intFrom(formData.get("value"), 0) : paiseFrom(formData.get("value"));
  const endsAtRaw = String(formData.get("endsAt") ?? "").trim();

  const parsed = couponSchema.safeParse({
    code: formData.get("code"),
    description: formData.get("description") || undefined,
    type,
    value: rawValue,
    minOrderPaise: paiseFrom(formData.get("minOrder")),
    maxUses: formData.get("maxUses") ? intFrom(formData.get("maxUses"), 0) : undefined,
    endsAt: endsAtRaw || undefined,
  });

  if (!parsed.success) backTo("/admin/coupons", parsed.error.issues[0]?.message ?? "Check the coupon.");
  if (parsed.data.type === "PERCENT" && parsed.data.value > 90) {
    backTo("/admin/coupons", "Percentage discounts above 90% are not allowed.");
  }

  try {
    await prisma.coupon.create({
      data: {
        code: parsed.data.code,
        description: parsed.data.description ?? null,
        type: parsed.data.type,
        value: parsed.data.value,
        minOrderPaise: parsed.data.minOrderPaise,
        maxUses: parsed.data.maxUses && parsed.data.maxUses > 0 ? parsed.data.maxUses : null,
        endsAt: endsAtRaw ? new Date(`${endsAtRaw}T23:59:59`) : null,
        isActive: true,
      },
    });
    await writeAuditLog(admin.id, "coupon.created", "Coupon", parsed.data.code);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      backTo("/admin/coupons", "That coupon code already exists.");
    }
    console.error("[admin] Could not create coupon:", error);
    backTo("/admin/coupons", "Could not create the coupon.");
  }

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons?created=1");
}

export async function toggleCouponAction(formData: FormData) {
  const admin = await assertOwner();
  const id = String(formData.get("id") ?? "");
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) backTo("/admin/coupons", "Coupon not found.");

  await prisma.coupon.update({ where: { id }, data: { isActive: !coupon.isActive } });
  await writeAuditLog(admin.id, coupon.isActive ? "coupon.disabled" : "coupon.enabled", "Coupon", id, {
    code: coupon.code,
  });
  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

export async function updateOrderStatusAction(formData: FormData) {
  const admin = await assertStaff();
  const orderId = String(formData.get("orderId") ?? "");
  const nextStatus = String(formData.get("status") ?? "") as OrderStatus;
  const note = String(formData.get("note") ?? "").trim().slice(0, 300);
  const courier = String(formData.get("courier") ?? "").trim().slice(0, 80);
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim().slice(0, 80);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) backTo("/admin/orders", "Order not found.");

  const validStatuses: OrderStatus[] = [
    "PENDING_PAYMENT",
    "CONFIRMED",
    "PROCESSING",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "RETURN_REQUESTED",
    "RETURNED",
    "REFUNDED",
  ];

  if (!validStatuses.includes(nextStatus)) backTo(`/admin/orders/${orderId}`, "Invalid status.");

  const changingStatus = nextStatus !== order.status;
  if (changingStatus && !canTransition(order.status, nextStatus)) {
    backTo(
      `/admin/orders/${orderId}`,
      `Cannot move an order from ${order.status} to ${nextStatus}.`
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (changingStatus && nextStatus === "CANCELLED") {
        await restoreOrderStock(tx, order.id, admin.id, `Order ${order.orderNumber} cancelled`);
      }

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: nextStatus,
          courier: courier || order.courier,
          trackingNumber: trackingNumber || order.trackingNumber,
          paymentStatus:
            nextStatus === "DELIVERED" && order.paymentMethod === "COD"
              ? "PAID"
              : order.paymentStatus,
          history: changingStatus
            ? {
                create: {
                  status: nextStatus,
                  note: note || `Status changed by ${admin.name}`,
                  actorId: admin.id,
                },
              }
            : undefined,
        },
      });
    });

    await writeAuditLog(admin.id, "order.status", "Order", order.id, {
      from: order.status,
      to: nextStatus,
    });
  } catch (error) {
    console.error("[admin] Could not update order:", error);
    backTo(`/admin/orders/${orderId}`, "Could not update the order.");
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?saved=1`);
}

export async function markEnquiryAction(formData: FormData) {
  const admin = await assertStaff();
  const id = String(formData.get("id") ?? "");
  const markHandled = String(formData.get("action") ?? "") === "handled";

  await prisma.enquiry.update({
    where: { id },
    data: {
      status: markHandled ? "HANDLED" : "NEW",
      handledAt: markHandled ? new Date() : null,
    },
  });

  await writeAuditLog(admin.id, markHandled ? "enquiry.handled" : "enquiry.reopened", "Enquiry", id);
  revalidatePath("/admin/enquiries");
  redirect("/admin/enquiries");
}

export async function setReviewStatusAction(formData: FormData) {
  const admin = await assertStaff();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as ReviewStatus;
  if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
    backTo("/admin/reviews", "Invalid review status.");
  }

  await prisma.review.update({ where: { id }, data: { status } });
  await writeAuditLog(admin.id, `review.${status.toLowerCase()}`, "Review", id);
  revalidatePath("/admin/reviews");
  redirect("/admin/reviews");
}

export async function updateSettingsAction(formData: FormData) {
  const admin = await assertOwner();

  const codMax = paiseFrom(formData.get("codMax"));
  const shipping = paiseFrom(formData.get("shipping"));
  const freeAbove = paiseFrom(formData.get("freeAbove"));
  const gst = intFrom(formData.get("gst"), 0);

  if (gst < 0 || gst > 28) backTo("/admin/settings", "GST percent must be between 0 and 28.");
  if (freeAbove > 0 && freeAbove < shipping) {
    backTo("/admin/settings", "Free-shipping threshold should not be below the shipping fee.");
  }

  await prisma.storeSetting.upsert({
    where: { id: 1 },
    update: {
      codEnabled: formData.get("codEnabled") === "on",
      codMaxPaise: codMax,
      shippingPaise: shipping,
      freeShippingAbovePaise: freeAbove,
      gstPercent: gst,
      returnWindowDays: Math.max(0, Math.min(60, intFrom(formData.get("returnWindow"), 7))),
      announcement: String(formData.get("announcement") ?? "").trim().slice(0, 160) || null,
    },
    create: {
      id: 1,
      codEnabled: formData.get("codEnabled") === "on",
      codMaxPaise: codMax,
      shippingPaise: shipping,
      freeShippingAbovePaise: freeAbove,
      gstPercent: gst,
      returnWindowDays: Math.max(0, Math.min(60, intFrom(formData.get("returnWindow"), 7))),
      announcement: String(formData.get("announcement") ?? "").trim().slice(0, 160) || null,
    },
  });

  await writeAuditLog(admin.id, "settings.updated", "StoreSetting", "1");
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  redirect("/admin/settings?saved=1");
}
