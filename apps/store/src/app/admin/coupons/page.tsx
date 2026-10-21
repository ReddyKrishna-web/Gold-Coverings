import type { Metadata } from "next";
import { formatINR } from "@uma/brand";
import { prisma } from "@uma/db";
import { requireOwner } from "@/lib/auth";
import { createCouponAction, toggleCouponAction } from "@/app/actions/admin";
import { AdminEmpty, AdminNotice, AdminPageHeader } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Coupons" };

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: { error?: string; created?: string };
}) {
  await requireOwner();

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  const now = new Date();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Promotions"
        title="Coupons"
        description="Codes are validated again at checkout. Limits, minimum order and expiry are enforced on the server."
      />

      {searchParams.created ? <AdminNotice tone="success">Coupon created.</AdminNotice> : null}
      {searchParams.error ? <AdminNotice tone="error">{searchParams.error}</AdminNotice> : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div>
          {coupons.length === 0 ? (
            <AdminEmpty
              title="No coupons yet"
              body="Create a welcome offer or a festive discount to get started."
            />
          ) : (
            <div className="admin-card overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[rgba(122,90,18,0.12)] text-[0.55rem] uppercase tracking-[0.12em] text-[rgba(14,11,7,0.4)]">
                  <tr>
                    <th className="px-4 py-2.5 font-normal">Code</th>
                    <th className="px-4 py-2.5 font-normal">Offer</th>
                    <th className="px-4 py-2.5 font-normal">Minimum</th>
                    <th className="px-4 py-2.5 font-normal">Used</th>
                    <th className="px-4 py-2.5 font-normal">Expiry</th>
                    <th className="px-4 py-2.5 font-normal">State</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(122,90,18,0.08)]">
                  {coupons.map((coupon) => {
                    const expired = coupon.endsAt && coupon.endsAt < now;
                    const exhausted = coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses;
                    const live = coupon.isActive && !expired && !exhausted;
                    return (
                      <tr key={coupon.id}>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[0.72rem] font-medium">{coupon.code}</span>
                          {coupon.description ? (
                            <span className="mt-0.5 block text-[0.58rem] text-[rgba(14,11,7,0.45)]">
                              {coupon.description}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          {coupon.type === "PERCENT" ? `${coupon.value}%` : formatINR(coupon.value)}
                        </td>
                        <td className="px-4 py-3">{formatINR(coupon.minOrderPaise)}</td>
                        <td className="px-4 py-3">
                          {coupon.usedCount}
                          {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                        </td>
                        <td className="px-4 py-3 text-[rgba(14,11,7,0.55)]">
                          {coupon.endsAt
                            ? coupon.endsAt.toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "2-digit",
                              })
                            : "None"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${live ? "badge-paid" : "badge-neutral"}`}>
                            {live ? "Live" : expired ? "Expired" : exhausted ? "Used up" : "Paused"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <form action={toggleCouponAction}>
                            <input type="hidden" name="id" value={coupon.id} />
                            <button
                              type="submit"
                              className="border border-[rgba(122,90,18,0.22)] px-2.5 py-1.5 text-[0.56rem] uppercase tracking-[0.08em] hover:bg-[rgba(212,175,55,0.1)]"
                            >
                              {coupon.isActive ? "Pause" : "Activate"}
                            </button>
                          </form>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <section className="admin-card h-fit p-4">
          <h2 className="text-sm font-medium">Create a coupon</h2>
          <form action={createCouponAction} className="mt-3 space-y-3">
            <div>
              <label htmlFor="coupon-code" className="admin-label">
                Code *
              </label>
              <input
                id="coupon-code"
                name="code"
                required
                maxLength={30}
                className="admin-input uppercase"
                placeholder="WELCOME10"
              />
            </div>
            <div>
              <label htmlFor="coupon-description" className="admin-label">
                Description
              </label>
              <input
                id="coupon-description"
                name="description"
                maxLength={160}
                className="admin-input"
                placeholder="10% off your first order"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="coupon-type" className="admin-label">
                  Type
                </label>
                <select id="coupon-type" name="type" className="admin-input" defaultValue="PERCENT">
                  <option value="PERCENT">Percent (%)</option>
                  <option value="FLAT">Flat (₹)</option>
                </select>
              </div>
              <div>
                <label htmlFor="coupon-value" className="admin-label">
                  Value *
                </label>
                <input
                  id="coupon-value"
                  name="value"
                  type="number"
                  min={1}
                  required
                  className="admin-input"
                  placeholder="10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="coupon-min" className="admin-label">
                  Minimum order (₹)
                </label>
                <input
                  id="coupon-min"
                  name="minOrder"
                  type="number"
                  min={0}
                  defaultValue={0}
                  className="admin-input"
                />
              </div>
              <div>
                <label htmlFor="coupon-uses" className="admin-label">
                  Max uses
                </label>
                <input
                  id="coupon-uses"
                  name="maxUses"
                  type="number"
                  min={0}
                  className="admin-input"
                  placeholder="Unlimited"
                />
              </div>
            </div>
            <div>
              <label htmlFor="coupon-expiry" className="admin-label">
                Expires on
              </label>
              <input id="coupon-expiry" name="endsAt" type="date" className="admin-input" />
            </div>
            <button type="submit" className="btn-dark w-full py-2.5">
              Create coupon
            </button>
            <p className="text-[0.58rem] leading-relaxed text-[rgba(14,11,7,0.4)]">
              One coupon per order. Coupons cannot be combined, and are re-checked server-side
              before an order is created.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}
