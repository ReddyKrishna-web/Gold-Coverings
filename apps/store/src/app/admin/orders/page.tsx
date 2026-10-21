import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatINR } from "@uma/brand";
import { prisma, type OrderStatus, type PaymentStatus } from "@uma/db";
import { STATUS_LABELS, orderStatusTone } from "@/lib/orders";
import { AdminEmpty, AdminPageHeader } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Orders" };

const FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Pending payment", value: "PENDING_PAYMENT" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Packed", value: "PACKED" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const PAGE_SIZE = 25;

function paymentTone(status: PaymentStatus) {
  if (status === "PAID") return "badge-paid";
  if (status === "PENDING" || status === "COD_PENDING") return "badge-pending";
  if (status === "FAILED") return "badge-failed";
  return "badge-neutral";
}

function paymentLabel(status: PaymentStatus) {
  return status === "COD_PENDING" ? "COD pending" : status.toLowerCase();
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string; page?: string };
}) {
  const status = searchParams.status && searchParams.status in STATUS_LABELS
    ? (searchParams.status as OrderStatus)
    : undefined;
  const q = searchParams.q?.trim().slice(0, 80) ?? "";
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);

  const where = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" as const } },
            { customerName: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { items: { select: { quantity: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const hrefWith = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { status: status ?? "", q, page: String(page), ...overrides };
    Object.entries(merged).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const qs = params.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="Fulfilment"
        title="Orders"
        description="Search, review and move orders through packing and delivery. Stock is restored automatically when an order is cancelled."
      />

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((filter) => {
          const active = (status ?? "") === filter.value;
          return (
            <Link
              key={filter.label}
              href={hrefWith({ status: filter.value, page: undefined })}
              className={`border px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.1em] ${
                active
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--gold-100)]"
                  : "border-[rgba(122,90,18,0.2)] bg-[#fffdf7] text-[rgba(14,11,7,0.6)] hover:border-[var(--gold-500)]"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <form action="/admin/orders" method="get" className="mt-3 flex max-w-md">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Order number, name, email or phone"
          className="admin-input"
          aria-label="Search orders"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 border border-l-0 border-[rgba(122,90,18,0.24)] bg-[var(--ink)] px-3 text-[0.6rem] uppercase tracking-[0.1em] text-[var(--gold-100)]"
        >
          <Search size={13} aria-hidden="true" /> Find
        </button>
      </form>

      <p className="mt-3 text-[0.62rem] uppercase tracking-[0.12em] text-[rgba(14,11,7,0.4)]">
        {total} {total === 1 ? "order" : "orders"}
        {q ? ` matching “${q}”` : ""}
      </p>

      {orders.length === 0 ? (
        <div className="mt-4">
          <AdminEmpty
            title="No orders here"
            body="Try a different filter or search term. New orders will appear automatically."
          />
        </div>
      ) : (
        <div className="admin-card mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[rgba(122,90,18,0.12)] text-[0.55rem] uppercase tracking-[0.12em] text-[rgba(14,11,7,0.4)]">
              <tr>
                <th className="px-4 py-2.5 font-normal">Order</th>
                <th className="px-4 py-2.5 font-normal">Customer</th>
                <th className="px-4 py-2.5 font-normal">Placed</th>
                <th className="px-4 py-2.5 font-normal">Payment</th>
                <th className="px-4 py-2.5 font-normal">Status</th>
                <th className="px-4 py-2.5 text-right font-normal">Total</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(122,90,18,0.08)]">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[rgba(212,175,55,0.05)]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-medium text-[var(--ink)]">
                      {order.orderNumber}
                    </Link>
                    <span className="block text-[0.55rem] text-[rgba(14,11,7,0.4)]">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block text-[var(--ink)]">{order.customerName}</span>
                    <span className="block text-[0.55rem] text-[rgba(14,11,7,0.4)]">{order.phone}</span>
                  </td>
                  <td className="px-4 py-3 text-[rgba(14,11,7,0.6)]">
                    {order.createdAt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${paymentTone(order.paymentStatus)}`}>
                      {paymentLabel(order.paymentStatus)}
                    </span>
                    <span className="mt-1 block text-[0.55rem] uppercase tracking-[0.08em] text-[rgba(14,11,7,0.4)]">
                      {order.paymentMethod === "COD" ? "Cash on delivery" : "Razorpay"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${orderStatusTone(order.status)}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{formatINR(order.totalPaise)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-[0.6rem] uppercase tracking-[0.1em] text-[var(--gold-900)] underline underline-offset-4"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageCount > 1 ? (
        <div className="mt-4 flex items-center justify-between text-xs">
          <p className="text-[rgba(14,11,7,0.5)]">
            Page {page} of {pageCount}
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link href={hrefWith({ page: String(page - 1) })} className="border border-[rgba(122,90,18,0.24)] px-3 py-1.5">
                Previous
              </Link>
            ) : null}
            {page < pageCount ? (
              <Link href={hrefWith({ page: String(page + 1) })} className="border border-[rgba(122,90,18,0.24)] px-3 py-1.5">
                Next
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
