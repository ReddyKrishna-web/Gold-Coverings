import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { formatINR, formatVariantLabel } from "@uma/brand";
import { CartLineControls } from "@/components/cart-line-controls";
import { CouponForm } from "@/components/coupon-form";
import { cartIssues, cartSubtotal, findCart, loadCoupon } from "@/lib/cart";
import { computeTotals, couponProblem } from "@/lib/pricing";
import { getStoreSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Bag",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const [cart, coupon, settings] = await Promise.all([findCart(), loadCoupon(), getStoreSettings()]);
  const items = cart?.items ?? [];
  const subtotal = cartSubtotal(cart);
  const totals = computeTotals(subtotal, coupon, settings);
  const issues = cart ? cartIssues(cart) : [];
  const couponMessage = coupon ? couponProblem(coupon, subtotal) : null;
  const remainingForFreeShipping = settings.freeShippingAbovePaise - subtotal;
  const progress =
    settings.freeShippingAbovePaise > 0
      ? Math.min(100, Math.round((subtotal / settings.freeShippingAbovePaise) * 100))
      : 100;

  if (items.length === 0) {
    return (
      <section className="lux-container flex min-h-[55vh] flex-col items-center justify-center py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(122,90,18,0.2)] text-[var(--gold-700)]">
          <ShoppingBag size={26} aria-hidden="true" />
        </span>
        <h1 className="display-md mt-6 text-[var(--ink)]">Your bag is empty</h1>
        <p className="mt-2 max-w-sm text-sm font-light leading-relaxed text-[rgba(14,11,7,0.6)]">
          Start with the bridal edit, a pair of everyday jhumkas, or browse everything in the
          collection.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn-gold">
            Shop the collection <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <Link href="/shop?category=bridal-sets" className="btn-outline-ink">
            Bridal sets
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="lux-container py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Step 1 of 3</p>
          <h1 className="display-lg mt-2 text-[var(--ink)]">Your bag</h1>
          <p className="mt-1 text-sm font-light text-[rgba(14,11,7,0.55)]">
            {items.length} {items.length === 1 ? "piece" : "pieces"} · prices and stock confirmed
            on the server
          </p>
        </div>
        <Link
          href="/shop"
          className="text-[0.62rem] uppercase tracking-[0.16em] text-[var(--gold-900)] hover:underline"
        >
          Continue shopping
        </Link>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div>
          {settings.freeShippingAbovePaise > 0 ? (
            <div className="mb-6 border border-[rgba(122,90,18,0.16)] bg-[#fffdf7] p-4">
              <p className="flex items-center gap-2 text-xs text-[rgba(14,11,7,0.7)]">
                <Truck size={14} className="text-[var(--gold-700)]" aria-hidden="true" />
                {remainingForFreeShipping > 0 ? (
                  <>
                    Add {formatINR(remainingForFreeShipping)} more for free shipping.
                  </>
                ) : (
                  <>You have free shipping on this order.</>
                )}
              </p>
              <div className="mt-2 h-1 w-full bg-[rgba(122,90,18,0.14)]">
                <div
                  className="h-full bg-[var(--gold-500)] transition-all"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Progress towards free shipping"
                />
              </div>
            </div>
          ) : null}

          {issues.length > 0 ? (
            <div role="alert" className="mb-6 border border-[rgba(179,38,30,0.3)] bg-[#fdf2f1] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--error)]">
                Please fix these before checkout
              </p>
              <ul className="mt-2 space-y-1 text-xs font-light leading-relaxed text-[var(--error)]">
                {issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <ul className="divide-y divide-[rgba(122,90,18,0.14)] border-y border-[rgba(122,90,18,0.14)]">
            {items.map((item) => {
              const product = item.variant.product;
              const image = product.images[0];
              const label = formatVariantLabel(item.variant);
              return (
                <li key={item.id} className="flex gap-4 py-5">
                  <Link
                    href={`/product/${product.slug}`}
                    className="relative h-28 w-24 shrink-0 overflow-hidden border border-[rgba(122,90,18,0.12)] bg-[var(--blush)] sm:h-32 sm:w-28"
                  >
                    {image ? (
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    ) : null}
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-[0.52rem] uppercase tracking-[0.16em] text-[var(--gold-700)]">
                          {product.category.name}
                        </p>
                        <Link
                          href={`/product/${product.slug}`}
                          className="mt-0.5 block font-display text-lg leading-snug text-[var(--ink)] hover:text-[var(--gold-900)]"
                        >
                          {product.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-[rgba(14,11,7,0.5)]">{label}</p>
                      </div>
                      <p className="text-sm font-medium text-[var(--ink)]">
                        {formatINR(item.variant.pricePaise * item.quantity)}
                      </p>
                    </div>

                    <p className="mt-1 text-[0.68rem] text-[rgba(14,11,7,0.45)]">
                      {formatINR(item.variant.pricePaise)} each
                      {item.variant.stock <= 5 ? ` · only ${item.variant.stock} left` : ""}
                    </p>

                    <div className="mt-auto pt-3">
                      <CartLineControls
                        itemId={item.id}
                        quantity={item.quantity}
                        stock={item.variant.stock}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 max-w-sm">
            <CouponForm appliedCode={coupon?.code ?? null} />
            {coupon && couponMessage ? (
              <p className="mt-2 text-[0.68rem] text-[var(--error)]">{couponMessage}</p>
            ) : null}
            <p className="mt-2 text-[0.62rem] text-[rgba(14,11,7,0.4)]">
              One coupon per order. Codes are checked again at checkout.
            </p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-[rgba(122,90,18,0.2)] bg-[#fffdf7] p-6">
            <h2 className="font-accent text-[0.65rem] uppercase tracking-[0.22em] text-[var(--gold-900)]">
              Order summary
            </h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="font-light text-[rgba(14,11,7,0.65)]">Subtotal</dt>
                <dd>{formatINR(totals.subtotalPaise)}</dd>
              </div>
              {totals.discountPaise > 0 ? (
                <div className="flex justify-between gap-3 text-[var(--success)]">
                  <dt className="font-light">Coupon discount</dt>
                  <dd>− {formatINR(totals.discountPaise)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <dt className="font-light text-[rgba(14,11,7,0.65)]">Shipping</dt>
                <dd>{totals.freeShipping ? "Free" : formatINR(totals.shippingPaise)}</dd>
              </div>
              {totals.taxPaise > 0 ? (
                <div className="flex justify-between gap-3">
                  <dt className="font-light text-[rgba(14,11,7,0.65)]">GST ({settings.gstPercent}%)</dt>
                  <dd>{formatINR(totals.taxPaise)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3 border-t border-[rgba(122,90,18,0.16)] pt-3 text-base">
                <dt className="font-medium">Total</dt>
                <dd className="font-display text-2xl">{formatINR(totals.totalPaise)}</dd>
              </div>
            </dl>

            {issues.length === 0 ? (
              <Link href="/checkout" className="btn-gold mt-6 w-full py-4">
                Proceed to checkout <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="mt-6 block w-full cursor-not-allowed bg-[rgba(14,11,7,0.18)] px-4 py-4 text-center text-[0.68rem] uppercase tracking-[0.2em] text-[rgba(255,249,236,0.8)]"
              >
                Fix your bag to continue
              </span>
            )}

            <p className="mt-4 flex items-start gap-2 text-[0.66rem] leading-relaxed text-[rgba(14,11,7,0.45)]">
              <ShieldCheck size={13} className="mt-0.5 shrink-0 text-[var(--gold-700)]" aria-hidden="true" />
              Secure checkout. Guest checkout available; sign in to save your details and track
              orders.
            </p>
          </div>

          <p className="mt-3 text-center text-[0.62rem] text-[rgba(14,11,7,0.4)]">
            {settings.gstPercent > 0
              ? `GST (${settings.gstPercent}%) is shown separately.`
              : "Tax is not configured by the store; no GST has been added."}
          </p>
        </aside>
      </div>
    </section>
  );
}
