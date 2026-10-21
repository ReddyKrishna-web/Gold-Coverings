import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Lock, ShieldCheck } from "lucide-react";
import { BRAND, formatINR, formatVariantLabel } from "@uma/brand";
import { CheckoutForm } from "@/components/checkout-form";
import { getCurrentUser } from "@/lib/auth";
import { cartIssues, cartSubtotal, findCart, loadCoupon } from "@/lib/cart";
import { computeTotals } from "@/lib/pricing";
import { razorpayConfigured } from "@/lib/razorpay";
import { getStoreSettings } from "@/lib/settings";
import { prisma } from "@uma/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [cart, user, settings, coupon] = await Promise.all([
    findCart(),
    getCurrentUser(),
    getStoreSettings(),
    loadCoupon(),
  ]);

  if (!cart || cart.items.length === 0) redirect("/cart");
  if (cartIssues(cart).length > 0) redirect("/cart");

  const addresses = user
    ? await prisma.address.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      })
    : [];

  const totals = computeTotals(cartSubtotal(cart), coupon, settings);
  const razorpayEnabled = razorpayConfigured();

  return (
    <section className="lux-container py-10">
      <nav aria-label="Checkout steps" className="flex items-center gap-2 text-[0.58rem] uppercase tracking-[0.14em] text-[rgba(14,11,7,0.4)]">
        <Link href="/cart" className="hover:text-[var(--gold-900)]">
          Bag
        </Link>
        <ChevronRight size={11} aria-hidden="true" />
        <span className="text-[var(--gold-900)]">Checkout</span>
        <ChevronRight size={11} aria-hidden="true" />
        <span>Confirmation</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display-lg text-[var(--ink)]">Checkout</h1>
          <p className="mt-1 text-sm font-light text-[rgba(14,11,7,0.55)]">
            Step 2 of 3 · {cart.items.length} {cart.items.length === 1 ? "piece" : "pieces"} · totals
            confirmed on the server
          </p>
        </div>
        {user ? (
          <p className="text-xs text-[rgba(14,11,7,0.5)]">
            Signed in as {user.name}
          </p>
        ) : (
          <p className="text-xs text-[rgba(14,11,7,0.5)]">
            Guest checkout ·{" "}
            <Link href="/login?next=/checkout" className="text-[var(--gold-900)] underline underline-offset-2">
              sign in
            </Link>
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_23rem]">
        <CheckoutForm
          defaultName={user?.name ?? ""}
          defaultEmail={user?.email ?? ""}
          defaultPhone={user?.phone ?? ""}
          addresses={addresses.map((address) => ({
            id: address.id,
            label: address.label,
            fullName: address.fullName,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            isDefault: address.isDefault,
          }))}
          totalPaise={totals.totalPaise}
          codEnabled={settings.codEnabled}
          codMaxPaise={settings.codMaxPaise}
          razorpayEnabled={razorpayEnabled}
          isSignedIn={Boolean(user)}
        />

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-[rgba(122,90,18,0.2)] bg-[#fffdf7] p-6">
            <h2 className="font-accent text-[0.65rem] uppercase tracking-[0.22em] text-[var(--gold-900)]">
              Your order
            </h2>
            <ul className="mt-4 space-y-3">
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden border border-[rgba(122,90,18,0.12)] bg-[var(--blush)]">
                    {item.variant.product.images[0] ? (
                      <Image
                        src={item.variant.product.images[0].url}
                        alt={item.variant.product.images[0].alt}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : null}
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--ink)] px-1 text-[0.55rem] text-[var(--gold-100)]">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm text-[var(--ink)]">
                      {item.variant.product.name}
                    </p>
                    <p className="text-[0.65rem] text-[rgba(14,11,7,0.45)]">
                      {formatVariantLabel(item.variant)}
                    </p>
                  </div>
                  <p className="text-xs">{formatINR(item.variant.pricePaise * item.quantity)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2.5 border-t border-[rgba(122,90,18,0.14)] pt-4 text-xs">
              <div className="flex justify-between">
                <dt className="font-light text-[rgba(14,11,7,0.6)]">Subtotal</dt>
                <dd>{formatINR(totals.subtotalPaise)}</dd>
              </div>
              {totals.discountPaise > 0 ? (
                <div className="flex justify-between text-[var(--success)]">
                  <dt className="font-light">Discount {coupon ? `(${coupon.code})` : ""}</dt>
                  <dd>− {formatINR(totals.discountPaise)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="font-light text-[rgba(14,11,7,0.6)]">Shipping</dt>
                <dd>{totals.freeShipping ? "Free" : formatINR(totals.shippingPaise)}</dd>
              </div>
              {totals.taxPaise > 0 ? (
                <div className="flex justify-between">
                  <dt className="font-light text-[rgba(14,11,7,0.6)]">GST</dt>
                  <dd>{formatINR(totals.taxPaise)}</dd>
                </div>
              ) : null}
              <div className="flex items-baseline justify-between border-t border-[rgba(122,90,18,0.14)] pt-3">
                <dt className="text-sm font-medium">Total</dt>
                <dd className="font-display text-2xl">{formatINR(totals.totalPaise)}</dd>
              </div>
            </dl>

            {coupon ? (
              <p className="mt-3 text-[0.65rem] text-[var(--success)]">
                Coupon {coupon.code} applied
              </p>
            ) : null}

            <div className="mt-5 space-y-2 border-t border-[rgba(122,90,18,0.14)] pt-4 text-[0.65rem] leading-relaxed text-[rgba(14,11,7,0.48)]">
              <p className="flex items-start gap-2">
                <ShieldCheck size={13} className="mt-0.5 shrink-0 text-[var(--gold-700)]" aria-hidden="true" />
                Payments are server-verified. We never store card details.
              </p>
              <p className="flex items-start gap-2">
                <Lock size={13} className="mt-0.5 shrink-0 text-[var(--gold-700)]" aria-hidden="true" />
                Need help? Call {BRAND.contact.phone} during store hours.
              </p>
            </div>
          </div>

          <p className="mt-3 text-center text-[0.62rem] text-[rgba(14,11,7,0.4)]">
            Gold-covering jewellery, honestly described.{" "}
            <Link href="/cart" className="underline underline-offset-2">
              Edit bag
            </Link>
          </p>
        </aside>
      </div>
    </section>
  );
}
