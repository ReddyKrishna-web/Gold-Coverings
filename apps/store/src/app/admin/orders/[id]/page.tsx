import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { formatINR } from "@uma/brand";
import { prisma } from "@uma/db";
import { STATUS_LABELS, STATUS_TRANSITIONS, orderStatusTone } from "@/lib/orders";
import { updateOrderStatusAction } from "@/app/actions/admin";
import { AdminNotice, AdminPageHeader } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Order detail" };

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

function paymentTone(status: string) {
  if (status === "PAID") return "badge-paid";
  if (status === "PENDING" || status === "COD_PENDING") return "badge-pending";
  if (status === "FAILED") return "badge-failed";
  return "badge-neutral";
}

export default async function AdminOrderDetail({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { saved?: string; error?: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      history: { orderBy: { createdAt: "desc" } },
      payments: { orderBy: { createdAt: "desc" } },
      user: { select: { id: true, email: true, name: true } },
      coupon: { select: { code: true } },
    },
  });

  if (!order) notFound();

  const address = order.shippingAddress as AddressShape;
  const transitions = STATUS_TRANSITIONS[order.status];
  const canCancel = transitions.includes("CANCELLED");

  return (
    <div>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.12em] text-[rgba(14,11,7,0.5)] hover:text-[var(--gold-900)]"
      >
        <ArrowLeft size={12} aria-hidden="true" /> All orders
      </Link>

      <div className="mt-3">
        <AdminPageHeader
          eyebrow={`Placed ${order.createdAt.toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}`}
          title={order.orderNumber}
          description={`${order.customerName} · ${order.email} · ${order.phone}`}
          action={
            <>
              <span className={`badge ${orderStatusTone(order.status)}`}>{STATUS_LABELS[order.status]}</span>
              <span className={`badge ${paymentTone(order.paymentStatus)}`}>
                {order.paymentStatus === "COD_PENDING" ? "COD pending" : order.paymentStatus.toLowerCase()}
              </span>
            </>
          }
        />
      </div>

      {searchParams.saved ? <AdminNotice tone="success">Order updated.</AdminNotice> : null}
      {searchParams.error ? <AdminNotice tone="error">{searchParams.error}</AdminNotice> : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <section className="admin-card">
            <h2 className="border-b border-[rgba(122,90,18,0.12)] px-4 py-3 text-sm font-medium">
              Items ({order.items.length})
            </h2>
            <ul className="divide-y divide-[rgba(122,90,18,0.08)]">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-3 px-4 py-3">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden border border-[rgba(122,90,18,0.12)] bg-[var(--blush)]">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill sizes="56px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm text-[var(--ink)]">{item.name}</p>
                      <p className="text-[0.6rem] text-[rgba(14,11,7,0.45)]">
                        {item.variantLabel} · SKU {item.sku}
                      </p>
                      <p className="text-[0.6rem] text-[rgba(14,11,7,0.45)]">
                        {item.quantity} × {formatINR(item.unitPricePaise)}
                      </p>
                    </div>
                    <p className="text-xs">{formatINR(item.lineTotalPaise)}</p>
                  </div>
                </li>
              ))}
            </ul>

            <dl className="space-y-1.5 border-t border-[rgba(122,90,18,0.12)] px-4 py-3 text-xs">
              <div className="flex justify-between">
                <dt className="text-[rgba(14,11,7,0.55)]">Subtotal</dt>
                <dd>{formatINR(order.subtotalPaise)}</dd>
              </div>
              {order.discountPaise > 0 ? (
                <div className="flex justify-between text-[var(--success)]">
                  <dt>Discount {order.couponCode ? `(${order.couponCode})` : ""}</dt>
                  <dd>− {formatINR(order.discountPaise)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-[rgba(14,11,7,0.55)]">Shipping</dt>
                <dd>{formatINR(order.shippingPaise)}</dd>
              </div>
              {order.taxPaise > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-[rgba(14,11,7,0.55)]">GST</dt>
                  <dd>{formatINR(order.taxPaise)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-[rgba(122,90,18,0.12)] pt-1.5 text-sm">
                <dt className="font-medium">Total</dt>
                <dd className="font-display text-xl">{formatINR(order.totalPaise)}</dd>
              </div>
            </dl>
          </section>

          <section className="admin-card">
            <h2 className="border-b border-[rgba(122,90,18,0.12)] px-4 py-3 text-sm font-medium">
              Payment records
            </h2>
            {order.payments.length === 0 ? (
              <p className="px-4 py-4 text-xs text-[rgba(14,11,7,0.45)]">No payment records.</p>
            ) : (
              <ul className="divide-y divide-[rgba(122,90,18,0.08)] text-xs">
                {order.payments.map((payment) => (
                  <li key={payment.id} className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium uppercase tracking-[0.08em] text-[rgba(14,11,7,0.65)]">
                        {payment.provider} · {payment.method ?? "—"}
                      </p>
                      <span className={`badge ${paymentTone(payment.status)}`}>
                        {payment.status.toLowerCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-[0.6rem] text-[rgba(14,11,7,0.45)]">
                      {formatINR(payment.amountPaise)} ·{" "}
                      {payment.createdAt.toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                    {payment.providerOrderId ? (
                      <p className="mt-0.5 break-all text-[0.58rem] text-[rgba(14,11,7,0.4)]">
                        Provider order: {payment.providerOrderId}
                      </p>
                    ) : null}
                    {payment.providerPaymentId ? (
                      <p className="break-all text-[0.58rem] text-[rgba(14,11,7,0.4)]">
                        Payment: {payment.providerPaymentId}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="admin-card">
            <h2 className="border-b border-[rgba(122,90,18,0.12)] px-4 py-3 text-sm font-medium">
              Status history
            </h2>
            <ol className="space-y-3 px-4 py-3">
              {order.history.map((entry) => (
                <li key={entry.id} className="flex gap-3 text-xs">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold-500)]" aria-hidden="true" />
                  <div>
                    <p className="text-[var(--ink)]">{STATUS_LABELS[entry.status]}</p>
                    {entry.note ? (
                      <p className="text-[0.65rem] font-light text-[rgba(14,11,7,0.55)]">{entry.note}</p>
                    ) : null}
                    <p className="text-[0.55rem] uppercase tracking-[0.08em] text-[rgba(14,11,7,0.35)]">
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
          </section>
        </div>

        <div className="space-y-4">
          <section className="admin-card p-4">
            <h2 className="text-sm font-medium">Update fulfilment</h2>
            <p className="mt-1 text-[0.62rem] leading-relaxed text-[rgba(14,11,7,0.45)]">
              Choose the current status to update tracking only. Illegal jumps are rejected on the
              server.
            </p>
            <form action={updateOrderStatusAction} className="mt-3 space-y-3">
              <input type="hidden" name="orderId" value={order.id} />
              <div>
                <label htmlFor="order-status" className="admin-label">
                  Status
                </label>
                <select id="order-status" name="status" defaultValue={order.status} className="admin-input">
                  <option value={order.status}>{STATUS_LABELS[order.status]} (keep)</option>
                  {transitions.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="order-courier" className="admin-label">
                    Courier
                  </label>
                  <input
                    id="order-courier"
                    name="courier"
                    defaultValue={order.courier ?? ""}
                    maxLength={80}
                    className="admin-input"
                    placeholder="Delhivery, India Post…"
                  />
                </div>
                <div>
                  <label htmlFor="order-tracking" className="admin-label">
                    Tracking number
                  </label>
                  <input
                    id="order-tracking"
                    name="trackingNumber"
                    defaultValue={order.trackingNumber ?? ""}
                    maxLength={80}
                    className="admin-input"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="order-note" className="admin-label">
                  Note (shown to customer)
                </label>
                <textarea
                  id="order-note"
                  name="note"
                  rows={2}
                  maxLength={300}
                  className="admin-input resize-none"
                  placeholder="Optional"
                />
              </div>
              <button type="submit" className="btn-dark w-full py-2.5">
                Save order
              </button>
              {canCancel ? (
                <p className="text-[0.6rem] leading-relaxed text-[rgba(14,11,7,0.45)]">
                  Selecting Cancelled restores stock automatically. Refunds for online payments
                  must be issued in the Razorpay dashboard.
                </p>
              ) : null}
            </form>
          </section>

          <section className="admin-card p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-medium">
              <MapPin size={14} className="text-[var(--gold-700)]" aria-hidden="true" /> Shipping address
            </h2>
            <address className="mt-2 text-xs not-italic leading-relaxed text-[rgba(14,11,7,0.65)]">
              <span className="font-medium text-[var(--ink)]">{address.fullName}</span>
              <br />
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
              <br />
              {address.city}, {address.state} {address.pincode}
              <br />
              {address.country ?? "India"}
            </address>
            <div className="mt-2 space-y-1 text-xs">
              <a href={`tel:${order.phone}`} className="flex items-center gap-1.5 text-[rgba(14,11,7,0.6)]">
                <Phone size={11} aria-hidden="true" /> {order.phone}
              </a>
              <a href={`mailto:${order.email}`} className="flex items-center gap-1.5 break-all text-[rgba(14,11,7,0.6)]">
                <Mail size={11} aria-hidden="true" /> {order.email}
              </a>
            </div>
            {order.notes ? (
              <div className="mt-3 border-t border-[rgba(122,90,18,0.12)] pt-2">
                <p className="text-[0.58rem] uppercase tracking-[0.12em] text-[rgba(14,11,7,0.4)]">
                  Customer note
                </p>
                <p className="mt-1 whitespace-pre-wrap text-xs font-light text-[rgba(14,11,7,0.65)]">
                  {order.notes}
                </p>
              </div>
            ) : null}
            {order.user ? (
              <p className="mt-3 border-t border-[rgba(122,90,18,0.12)] pt-2 text-[0.6rem] text-[rgba(14,11,7,0.45)]">
                Account: {order.user.email}
              </p>
            ) : (
              <p className="mt-3 border-t border-[rgba(122,90,18,0.12)] pt-2 text-[0.6rem] text-[rgba(14,11,7,0.45)]">
                Guest checkout
              </p>
            )}
          </section>

          {order.courier || order.trackingNumber ? (
            <section className="admin-card p-4 text-xs">
              <h2 className="text-sm font-medium">Tracking</h2>
              <p className="mt-1 text-[rgba(14,11,7,0.6)]">
                {order.courier ?? "Courier"} · {order.trackingNumber ?? "—"}
              </p>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
