import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, MapPin, Truck } from "lucide-react";
import { BRAND, WEBSITE_URL, formatINR, whatsappHref } from "@uma/brand";
import { prisma } from "@uma/db";
import { getCurrentUser } from "@/lib/auth";
import { STATUS_LABELS, orderStatusTone } from "@/lib/orders";
import { RetryPayment } from "@/components/retry-payment";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Order",
  robots: { index: false, follow: false },
};

type Props = {
  params: { orderNumber: string };
  searchParams: { t?: string; paid?: string };
};

type AddressShape = {
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
};

export default async function OrderPage({ params, searchParams }: Props) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: {
      items: true,
      history: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!order) notFound();

  const user = await getCurrentUser();
  const tokenOk = Boolean(searchParams.t) && order.publicToken === searchParams.t;
  const staff = user && (user.role === "OWNER" || user.role === "STAFF");
  const owner = user && order.userId === user.id;

  if (!tokenOk && !staff && !owner) notFound();

  const address = order.shippingAddress as AddressShape;
  const isPaid = order.paymentStatus === "PAID";
  const isCod = order.paymentMethod === "COD";
  const pendingPayment = order.paymentStatus === "PENDING" && order.status === "PENDING_PAYMENT";
  const cancelled = order.status === "CANCELLED";

  const heading = cancelled
    ? "This order was cancelled"
    : pendingPayment
      ? "Order saved — payment pending"
      : "Thank you — your order is confirmed.";

  return (
    <section className="lux-container py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="eyebrow">Order {order.orderNumber}</p>
          <span className={`badge ${orderStatusTone(order.status)}`}>{STATUS_LABELS[order.status]}</span>
        </div>

        <div className="mt-3 flex items-start gap-4">
          <span
            className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              cancelled
                ? "bg-[#fdecea] text-[var(--error)]"
                : pendingPayment
                  ? "bg-[#fff7e0] text-[var(--gold-900)]"
                  : "bg-[#e8f5e9] text-[var(--success)]"
            }`}
          >
            {pendingPayment || cancelled ? <Clock size={20} aria-hidden="true" /> : <CheckCircle2 size={22} aria-hidden="true" />}
          </span>
          <div>
            <h1 className="font-display text-3xl leading-tight text-[var(--ink)] sm:text-4xl">
              {heading}
            </h1>
            <p className="mt-2 max-w-xl text-sm font-light leading-relaxed text-[rgba(14,11,7,0.62)]">
              {cancelled
                ? "No further action is needed. If you were charged, contact the store and we will reconcile it."
                : pendingPayment
                  ? "Your pieces are held for this order. Complete the payment below to confirm it. If you have just paid, refresh in a moment."
                  : isCod
                    ? "We will call to confirm before dispatch. Please keep the exact amount ready for the courier."
                    : "A confirmation has been prepared for your email. We will update you as the order moves."}
            </p>
          </div>
        </div>

        {pendingPayment ? (
          <div className="mt-6 border border-[rgba(122,90,18,0.25)] bg-[#fffdf7] p-5">
            <p className="text-sm text-[rgba(14,11,7,0.7)]">
              Total due: <strong>{formatINR(order.totalPaise)}</strong>
            </p>
            <div className="mt-3">
              <RetryPayment
                orderNumber={order.orderNumber}
                token={order.publicToken}
                amountPaise={order.totalPaise}
              />
            </div>
          </div>
        ) : null}

        {order.trackingNumber ? (
          <div className="mt-6 flex flex-wrap items-center gap-3 border border-[rgba(122,90,18,0.2)] bg-[#fffdf7] p-4 text-sm">
            <Truck size={16} className="text-[var(--gold-700)]" aria-hidden="true" />
            <span className="font-medium">{order.courier ?? "Courier"}</span>
            <span className="text-[rgba(14,11,7,0.55)]">{order.trackingNumber}</span>
          </div>
        ) : null}

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
          <div>
            <h2 className="font-accent text-[0.65rem] uppercase tracking-[0.22em] text-[var(--gold-900)]">
              Items
            </h2>
            <ul className="mt-4 divide-y divide-[rgba(122,90,18,0.14)] border-y border-[rgba(122,90,18,0.14)]">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden border border-[rgba(122,90,18,0.14)] bg-[var(--blush)]">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-lg leading-snug text-[var(--ink)]">{item.name}</p>
                      <p className="text-xs text-[rgba(14,11,7,0.5)]">
                        {item.variantLabel} · SKU {item.sku}
                      </p>
                      <p className="mt-1 text-xs text-[rgba(14,11,7,0.55)]">
                        Qty {item.quantity} · {formatINR(item.unitPricePaise)} each
                      </p>
                    </div>
                    <p className="text-sm">{formatINR(item.lineTotalPaise)}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <h2 className="font-accent text-[0.65rem] uppercase tracking-[0.22em] text-[var(--gold-900)]">
                Status history
              </h2>
              <ol className="mt-4 space-y-4">
                {order.history.map((entry) => (
                  <li key={entry.id} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--gold-500)]" aria-hidden="true" />
                    <div>
                      <p className="text-sm text-[var(--ink)]">{STATUS_LABELS[entry.status]}</p>
                      {entry.note ? (
                        <p className="text-xs font-light text-[rgba(14,11,7,0.55)]">{entry.note}</p>
                      ) : null}
                      <p className="mt-0.5 text-[0.6rem] uppercase tracking-[0.1em] text-[rgba(14,11,7,0.35)]">
                        {entry.createdAt.toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="border border-[rgba(122,90,18,0.2)] bg-[#fffdf7] p-5">
              <h2 className="field-label">Summary</h2>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <dt className="font-light text-[rgba(14,11,7,0.6)]">Subtotal</dt>
                  <dd>{formatINR(order.subtotalPaise)}</dd>
                </div>
                {order.discountPaise > 0 ? (
                  <div className="flex justify-between text-[var(--success)]">
                    <dt className="font-light">Discount {order.couponCode ? `(${order.couponCode})` : ""}</dt>
                    <dd>− {formatINR(order.discountPaise)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <dt className="font-light text-[rgba(14,11,7,0.6)]">Shipping</dt>
                  <dd>{order.shippingPaise === 0 ? "Free" : formatINR(order.shippingPaise)}</dd>
                </div>
                {order.taxPaise > 0 ? (
                  <div className="flex justify-between">
                    <dt className="font-light text-[rgba(14,11,7,0.6)]">GST</dt>
                    <dd>{formatINR(order.taxPaise)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-[rgba(122,90,18,0.14)] pt-2 text-sm">
                  <dt className="font-medium">Total</dt>
                  <dd className="font-display text-xl">{formatINR(order.totalPaise)}</dd>
                </div>
              </dl>
              <p className="mt-3 border-t border-[rgba(122,90,18,0.12)] pt-3 text-[0.65rem] uppercase tracking-[0.1em] text-[rgba(14,11,7,0.45)]">
                {isPaid ? "Paid online" : isCod ? "Cash on delivery" : "Payment pending"}
              </p>
            </div>

            <div className="border border-[rgba(122,90,18,0.2)] bg-[#fffdf7] p-5">
              <h2 className="field-label flex items-center gap-1.5">
                <MapPin size={12} aria-hidden="true" /> Delivery address
              </h2>
              <address className="text-xs not-italic leading-relaxed text-[rgba(14,11,7,0.65)]">
                <span className="block font-medium text-[var(--ink)]">{address.fullName}</span>
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
                <br />
                {address.city}, {address.state} {address.pincode}
                <br />
                {address.country ?? "India"}
                <br />
                {address.phone}
              </address>
            </div>

            <div className="border border-[rgba(122,90,18,0.2)] bg-[#fffdf7] p-5 text-xs font-light leading-relaxed text-[rgba(14,11,7,0.6)]">
              <p className="font-accent text-[0.62rem] uppercase tracking-[0.18em] text-[var(--gold-900)]">
                Need help?
              </p>
              <p className="mt-2">
                Call{" "}
                <a href={`tel:${BRAND.contact.phone.replace(/[^\d+]/g, "")}`} className="underline underline-offset-2">
                  {BRAND.contact.phone}
                </a>{" "}
                or{" "}
                <a
                  href={whatsappHref(`Hello Uma Fashions, I need help with order ${order.orderNumber}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  WhatsApp us
                </a>{" "}
                with your order number.
              </p>
              <a
                href={`${WEBSITE_URL}/policies/returns`}
                className="mt-3 inline-block text-[0.62rem] uppercase tracking-[0.12em] text-[var(--gold-900)] underline underline-offset-4"
              >
                Returns policy ↗
              </a>
            </div>

            <Link href="/shop" className="btn-outline-ink w-full">
              Continue shopping
            </Link>
          </aside>
        </div>

        {order.userId ? (
          <p className="mt-8 text-center text-xs text-[rgba(14,11,7,0.45)]">
            <Link href="/account" className="underline underline-offset-2">
              View all your orders
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
