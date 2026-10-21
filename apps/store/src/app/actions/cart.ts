"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@uma/db";
import { clearCoupon, findCart, getOrCreateCart, loadCoupon, setCoupon } from "@/lib/cart";
import { couponProblem } from "@/lib/pricing";

export type CartActionResult = { ok: boolean; message: string };

function refreshCartSurfaces() {
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function addToCartAction(formData: FormData): Promise<CartActionResult> {
  const variantId = typeof formData.get("variantId") === "string" ? String(formData.get("variantId")) : "";
  const quantityRaw = Number(formData.get("quantity"));
  const quantity = Number.isFinite(quantityRaw) ? Math.min(10, Math.max(1, Math.floor(quantityRaw))) : 1;

  if (!variantId) return { ok: false, message: "Please choose a size first." };

  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, isActive: true, product: { isActive: true } },
    include: { product: { select: { name: true, slug: true } } },
  });

  if (!variant) return { ok: false, message: "That piece is no longer available." };
  if (variant.stock <= 0) return { ok: false, message: "This piece is sold out." };

  const cart = await getOrCreateCart();
  const existing = cart.items.find((item) => item.variantId === variantId);
  const desired = (existing?.quantity ?? 0) + quantity;

  if (desired > variant.stock) {
    return {
      ok: false,
      message: `Only ${variant.stock} left in this size. Please adjust the quantity.`,
    };
  }

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
    update: { quantity: desired },
    create: { cartId: cart.id, variantId, quantity },
  });

  refreshCartSurfaces();
  revalidatePath(`/product/${variant.product.slug}`);
  return { ok: true, message: `${variant.product.name} added to your bag.` };
}

export async function updateCartItemAction(formData: FormData): Promise<CartActionResult> {
  const itemId = String(formData.get("itemId") ?? "");
  const quantityRaw = Number(formData.get("quantity"));
  const quantity = Number.isFinite(quantityRaw) ? Math.floor(quantityRaw) : 1;

  const cart = await findCart();
  if (!cart) return { ok: false, message: "Your bag is empty." };

  const item = cart.items.find((line) => line.id === itemId);
  if (!item) return { ok: false, message: "That item is not in your bag." };

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
    refreshCartSurfaces();
    return { ok: true, message: "Item removed." };
  }

  if (quantity > item.variant.stock) {
    return { ok: false, message: `Only ${item.variant.stock} left in stock.` };
  }

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: Math.min(quantity, 10) },
  });

  refreshCartSurfaces();
  return { ok: true, message: "Bag updated." };
}

export async function removeCartItemAction(formData: FormData): Promise<CartActionResult> {
  const itemId = String(formData.get("itemId") ?? "");
  const cart = await findCart();
  if (!cart) return { ok: false, message: "Your bag is empty." };

  const item = cart.items.find((line) => line.id === itemId);
  if (!item) return { ok: false, message: "That item is not in your bag." };

  await prisma.cartItem.delete({ where: { id: item.id } });
  refreshCartSurfaces();
  return { ok: true, message: "Item removed." };
}

export async function applyCouponAction(formData: FormData): Promise<CartActionResult> {
  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase()
    .slice(0, 40);

  if (!code) return { ok: false, message: "Enter a coupon code." };

  const cart = await findCart();
  if (!cart || cart.items.length === 0) {
    return { ok: false, message: "Add something to your bag first." };
  }

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon) return { ok: false, message: "That coupon code is not valid." };

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.variant.pricePaise * item.quantity,
    0
  );
  const problem = couponProblem(coupon, subtotal);
  if (problem) return { ok: false, message: problem };

  setCoupon(coupon.code);
  refreshCartSurfaces();
  return { ok: true, message: `${coupon.code} applied.` };
}

export async function removeCouponAction(): Promise<CartActionResult> {
  clearCoupon();
  refreshCartSurfaces();
  return { ok: true, message: "Coupon removed." };
}

export async function currentCouponCode(): Promise<string | null> {
  const coupon = await loadCoupon();
  return coupon?.code ?? null;
}
