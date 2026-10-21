import Link from "next/link";
import { ArrowUpRight, PackageSearch, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import { formatINR } from "@uma/brand";
import { prisma } from "@uma/db";
import { STATUS_LABELS, orderStatusTone } from "@/lib/orders";
import { AdminEmpty, AdminPageHeader, AdminStat } from "@/components/admin-ui";
import { requireStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default async function AdminDashboard() {
  const user = await requireStaff();
  const now = new Date();
  const today = startOfDay(now);
  const thirtyDaysAgo = new Date(today.getTime() - 29 * 86400000);
  const sevenDaysAgo = new Date(today.getTime() - 6 * 86400000);

  const [todaysOrders, paid30, awaitingAction, codToCollect, recentOrders, lowStockProducts, topProducts, recentForChart] =
    await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({
        where: { paymentStatus: "PAID", createdAt: { gte: thirtyDaysAgo } },
        _sum: { totalPaise: true },
        _count: true,
      }),
      prisma.order.count({
        where: { status: { in: ["PENDING_PAYMENT", "CONFIRMED", "PROCESSING", "PACKED"] } },
      }),
      prisma.order.aggregate({
        where: {
          paymentStatus: "COD_PENDING",
          status: { notIn: ["CANCELLED", "RETURNED", "REFUNDED"] },
        },
        _sum: { totalPaise: true },
        _count: true,
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          totalPaise: true,
          status: true,
          paymentMethod: true,
          createdAt: true,
        },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          variants: { select: { id: true, size: true, finish: true, stock: true } },
        },
        take: 100,
      }),
      prisma.orderItem.groupBy({
        by: ["name"],
        _sum: { quantity: true, lineTotalPaise: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, totalPaise: true, paymentStatus: true },
      }),
    ]);

  const lowStock = lowStockProducts
    .filter((product) => product.variants.some((variant) => variant.stock <= product.lowStockThreshold))
    .slice(0, 6);

  const chartDays = Array.from({ length: 7 }).map((_, index) => {
    const day = startOfDay(new Date(today.getTime() - (6 - index) * 86400000));
    const next = new Date(day.getTime() + 86400000);
    const revenue = recentForChart
      .filter((order) => order.createdAt >= day && order.createdAt < next && order.paymentStatus === "PAID")
      .reduce((sum, order) => sum + order.totalPaise, 0);
    return {
      label: day.toLocaleDateString("en-IN", { weekday: "short" }),
      revenue,
    };
  });
  const chartMax = Math.max(1, ...chartDays.map((entry) => entry.revenue));

  const paidRevenue = paid30._sum.totalPaise ?? 0;
  const averageOrder = paid30._count > 0 ? Math.round(paidRevenue / paid30._count) : 0;

  return (
    <div>
      <AdminPageHeader
        eyebrow={`Good to see you, ${user.name.split(" ")[0]}`}
        title="Dashboard"
        description="Live view of orders, money collected and stock that needs attention."
        action={
          <>
            <Link href="/admin/products/new" className="btn-dark px-4 py-2.5">
              Add product
            </Link>
            <Link href="/admin/orders" className="btn-outline-ink px-4 py-2.5">
              All orders
            </Link>
          </>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStat
          label="Paid revenue · 30 days"
          value={formatINR(paidRevenue)}
          hint={`${paid30._count} paid ${paid30._count === 1 ? "order" : "orders"} · excludes COD pending`}
          href="/admin/orders"
        />
        <AdminStat
          label="Orders today"
          value={String(todaysOrders)}
          hint="Orders placed since midnight"
          href="/admin/orders"
        />
        <AdminStat
          label="Needs action"
          value={String(awaitingAction)}
          hint="Paid, confirmed, packing or awaiting payment"
          href="/admin/orders"
        />
        <AdminStat
          label="COD to collect"
          value={formatINR(codToCollect._sum.totalPaise ?? 0)}
          hint={`${codToCollect._count} undelivered COD ${codToCollect._count === 1 ? "order" : "orders"}`}
          href="/admin/orders"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="admin-card p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-medium text-[var(--ink)]">
                <TrendingUp size={15} className="text-[var(--gold-700)]" aria-hidden="true" />
                Paid revenue · last 7 days
              </h2>
              <p className="mt-0.5 text-[0.62rem] text-[rgba(14,11,7,0.45)]">
                Confirmed online payments and collected COD only.
              </p>
            </div>
            <p className="font-display text-xl">{formatINR(chartDays.reduce((sum, d) => sum + d.revenue, 0))}</p>
          </div>

          <div className="mt-5 flex h-32 items-end gap-2">
            {chartDays.map((day) => (
              <div key={day.label} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full bg-[linear-gradient(180deg,var(--gold-500),var(--gold-700))]"
                  style={{ height: `${Math.max(4, Math.round((day.revenue / chartMax) * 100))}%` }}
                  title={`${day.label}: ${formatINR(day.revenue)}`}
                />
                <span className="text-[0.55rem] uppercase tracking-[0.1em] text-[rgba(14,11,7,0.4)]">
                  {day.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[rgba(122,90,18,0.12)] pt-3 text-[0.65rem] text-[rgba(14,11,7,0.5)]">
            <span>Average paid order (30 days)</span>
            <span className="font-medium text-[var(--ink)]">{formatINR(averageOrder)}</span>
          </div>
        </section>

        <section className="admin-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-medium text-[var(--ink)]">
            <PackageSearch size={15} className="text-[var(--gold-700)]" aria-hidden="true" />
            Low stock
          </h2>
          <p className="mt-0.5 text-[0.62rem] text-[rgba(14,11,7,0.45)]">
            At or below each product&rsquo;s threshold.
          </p>
          <ul className="mt-3 divide-y divide-[rgba(122,90,18,0.1)]">
            {lowStock.length === 0 ? (
              <li className="py-4 text-xs text-[rgba(14,11,7,0.45)]">Nothing needs restocking.</li>
            ) : (
              lowStock.map((product) => {
                const variant = product.variants.reduce((min, current) =>
                  current.stock < min.stock ? current : min
                );
                return (
                  <li key={product.id}>
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="flex items-center justify-between gap-3 py-2.5 hover:text-[var(--gold-900)]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-xs text-[var(--ink)]">{product.name}</span>
                        <span className="block text-[0.58rem] text-[rgba(14,11,7,0.45)]">
                          {[variant.size, variant.finish].filter(Boolean).join(" · ") || "One size"}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 text-xs font-medium ${
                          variant.stock === 0 ? "text-[var(--error)]" : "text-[var(--gold-900)]"
                        }`}
                      >
                        {variant.stock} left
                      </span>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
          <Link
            href="/admin/products"
            className="mt-3 flex items-center gap-1 text-[0.6rem] uppercase tracking-[0.12em] text-[var(--gold-900)]"
          >
            Manage products <ArrowUpRight size={12} aria-hidden="true" />
          </Link>
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="admin-card">
          <div className="flex items-center justify-between border-b border-[rgba(122,90,18,0.12)] px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-medium text-[var(--ink)]">
              <ShoppingCart size={15} className="text-[var(--gold-700)]" aria-hidden="true" />
              Recent orders
            </h2>
            <Link href="/admin/orders" className="text-[0.6rem] uppercase tracking-[0.12em] text-[var(--gold-900)]">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-4">
              <AdminEmpty title="No orders yet" body="Orders will appear here as soon as customers check out." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[0.55rem] uppercase tracking-[0.12em] text-[rgba(14,11,7,0.4)]">
                  <tr>
                    <th className="px-4 py-2 font-normal">Order</th>
                    <th className="px-4 py-2 font-normal">Customer</th>
                    <th className="px-4 py-2 font-normal">Status</th>
                    <th className="px-4 py-2 text-right font-normal">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(122,90,18,0.08)]">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[rgba(212,175,55,0.05)]">
                      <td className="px-4 py-2.5">
                        <Link href={`/admin/orders/${order.id}`} className="font-medium text-[var(--ink)]">
                          {order.orderNumber}
                        </Link>
                        <span className="block text-[0.55rem] text-[rgba(14,11,7,0.4)]">
                          {order.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[rgba(14,11,7,0.65)]">{order.customerName}</td>
                      <td className="px-4 py-2.5">
                        <span className={`badge ${orderStatusTone(order.status)}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">{formatINR(order.totalPaise)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-card p-4">
          <h2 className="flex items-center gap-2 text-sm font-medium text-[var(--ink)]">
            <Wallet size={15} className="text-[var(--gold-700)]" aria-hidden="true" />
            Top sellers
          </h2>
          <p className="mt-0.5 text-[0.62rem] text-[rgba(14,11,7,0.45)]">By quantity across all orders.</p>
          <ol className="mt-3 space-y-2.5">
            {topProducts.length === 0 ? (
              <li className="text-xs text-[rgba(14,11,7,0.45)]">No sales recorded yet.</li>
            ) : (
              topProducts.map((item, index) => (
                <li key={item.name} className="flex items-start gap-2.5">
                  <span className="mt-0.5 font-display text-base text-[var(--gold-700)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-[var(--ink)]">{item.name}</p>
                    <p className="text-[0.58rem] text-[rgba(14,11,7,0.45)]">
                      {item._sum.quantity ?? 0} sold · {formatINR(item._sum.lineTotalPaise ?? 0)}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ol>
        </section>
      </div>

      <p className="mt-6 text-[0.62rem] leading-relaxed text-[rgba(14,11,7,0.4)]">
        Revenue is counted only when a payment is verified or COD is collected on delivery. Pending,
        failed and cancelled orders are excluded. This is an operations view, not a tax report.
      </p>
    </div>
  );
}
