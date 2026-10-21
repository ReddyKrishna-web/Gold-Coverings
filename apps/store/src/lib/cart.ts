import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { prisma, type Prisma } from "@uma/db";
import { getCurrentUser } from "./auth";

export const CART_COOKIE = "uma_cart";
export const COUPON_COOKIE = "uma_coupon";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 30 * 24 * 60 * 60,
};

export const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" },
    include: {
      variant: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
              category: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CartInclude;

export type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;
export type CartLine = CartWithItems["items"][number];

/**
 * Read-only cart lookup, safe to call while rendering pages.
 * Cart creation only happens inside server actions.
 */
export async function findCart(): Promise<CartWithItems | null> {
  const user = await getCurrentUser();

  if (user) {
    return prisma.cart.findUnique({ where: { userId: user.id }, include: cartInclude });
  }

  const token = cookies().get(CART_COOKIE)?.value;
  if (!token) return null;

  return prisma.cart.findUnique({ where: { guestToken: token }, include: cartInclude });
}

/** Creates a cart (and guest cookie) when needed. Server actions / routes only. */
export async function getOrCreateCart(): Promise<CartWithItems> {
  const user = await getCurrentUser();

  if (user) {
    const existing = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: cartInclude,
    });
    if (existing) return existing;
    return prisma.cart.create({ data: { userId: user.id }, include: cartInclude });
  }

  const token = cookies().get(CART_COOKIE)?.value;
  if (token) {
    const existing = await prisma.cart.findUnique({
      where: { guestToken: token },
      include: cartInclude,
    });
    if (existing) return existing;
  }

  const guestToken = randomUUID();
  cookies().set(CART_COOKIE, guestToken, cookieOptions);
  return prisma.cart.create({ data: { guestToken }, include: cartInclude });
}

export function cartCount(cart: CartWithItems | null): number {
  if (!cart) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartSubtotal(cart: CartWithItems | null): number {
  if (!cart) return 0;
  return cart.items.reduce((sum, item) => sum + item.variant.pricePaise * item.quantity, 0);
}

/** Problems that must block checkout (removed products, low stock, inactive variants). */
export function cartIssues(cart: CartWithItems): string[] {
  const issues: string[] = [];
  for (const item of cart.items) {
    const { product, ...variant } = item.variant;
    if (!product.isActive || !variant.isActive) {
      issues.push(`${product.name} is no longer available. Please remove it to continue.`);
    } else if (item.quantity > variant.stock) {
      issues.push(
        `Only ${variant.stock} left of ${product.name}. Please reduce the quantity to continue.`
      );
    }
  }
  return issues;
}

export async function loadCoupon() {
  const code = cookies().get(COUPON_COOKIE)?.value;
  if (!code) return null;
  return prisma.coupon.findUnique({ where: { code } });
}

export function setCoupon(code: string) {
  cookies().set(COUPON_COOKIE, code, {
    ...cookieOptions,
    maxAge: 60 * 60 * 6,
  });
}

export function clearCoupon() {
  cookies().set(COUPON_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}

export async function clearCart(cartId: string) {
  await prisma.cartItem.deleteMany({ where: { cartId } });
}

/**
 * On sign-in, fold the guest cart into the customer cart so nothing is lost.
 * Quantities are capped by live stock later at checkout.
 */
export async function mergeGuestCart(userId: string) {
  const token = cookies().get(CART_COOKIE)?.value;
  if (!token) return;

  const guestCart = await prisma.cart.findUnique({
    where: { guestToken: token },
    include: { items: true },
  });

  if (!guestCart) {
    cookies().set(CART_COOKIE, "", { ...cookieOptions, maxAge: 0 });
    return;
  }

  await prisma.$transaction(async (tx) => {
    const userCart =
      (await tx.cart.findUnique({ where: { userId } })) ??
      (await tx.cart.create({ data: { userId } }));

    for (const item of guestCart.items) {
      const existing = await tx.cartItem.findUnique({
        where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
      });
      if (existing) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
      } else {
        await tx.cartItem.create({
          data: { cartId: userCart.id, variantId: item.variantId, quantity: item.quantity },
        });
      }
    }

    await tx.cart.delete({ where: { id: guestCart.id } });
  });

  cookies().set(CART_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}
