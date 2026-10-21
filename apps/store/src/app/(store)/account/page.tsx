import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, LogOut, MapPin, Package } from "lucide-react";
import { formatINR } from "@uma/brand";
import { prisma } from "@uma/db";
import { requireUser } from "@/lib/auth";
import { STATUS_LABELS, orderStatusTone } from "@/lib/orders";
import { addAddressAction, deleteAddressAction } from "@/app/actions/account";
import { signOutAction } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { address?: string };
}) {
  const user = await requireUser();

  const [orders, addresses] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { items: { take: 3 } },
      take: 20,
    }),
    prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <section className="lux-container py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your account</p>
          <h1 className="display-lg mt-2 text-[var(--ink)]">Hello, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm font-light text-[rgba(14,11,7,0.55)]">
            {user.email} · member since{" "}
            {user.createdAt.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(user.role === "OWNER" || user.role === "STAFF") ? (
            <Link href="/admin" className="btn-outline-ink px-4 py-2.5">
              Admin dashboard
            </Link>
          ) : null}
          <form action={signOutAction}>
            <button type="submit" className="flex items-center gap-1.5 border border-[rgba(122,90,18,0.24)] px-4 py-2.5 text-[0.6rem] uppercase tracking-[0.16em] text-[rgba(14,11,7,0.65)] hover:bg-[rgba(212,175,55,0.1)]">
              <LogOut size={13} aria-hidden="true" /> Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div>
          <h2 className="flex items-center gap-2 font-accent text-[0.65rem] uppercase tracking-[0.22em] text-[var(--gold-900)]">
            <Package size={14} aria-hidden="true" /> Your orders
          </h2>

          {orders.length === 0 ? (
            <div className="mt-4 border border-[rgba(122,90,18,0.16)] bg-[#fffdf7] p-8 text-center">
              <p className="font-display text-2xl text-[var(--ink)]">No orders yet</p>
              <p className="mt-1 text-sm font-light text-[rgba(14,11,7,0.55)]">
                When you place an order it will appear here with live status.
              </p>
              <Link href="/shop" className="btn-gold mt-5">
                Start shopping
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-[rgba(122,90,18,0.14)] border-y border-[rgba(122,90,18,0.14)]">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/orders/${order.orderNumber}`}
                    className="flex flex-wrap items-center justify-between gap-3 py-4 transition-colors hover:bg-[rgba(212,175,55,0.06)]"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-[var(--ink)]">{order.orderNumber}</p>
                        <span className={`badge ${orderStatusTone(order.status)}`}>
                          {STATUS_LABELS[order.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-light text-[rgba(14,11,7,0.5)]">
                        {order.createdAt.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        · {order.items.length} {order.items.length === 1 ? "piece" : "pieces"} ·{" "}
                        {order.paymentMethod === "COD" ? "Cash on delivery" : "Paid online"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm">{formatINR(order.totalPaise)}</p>
                      <ChevronRight size={15} className="text-[rgba(14,11,7,0.35)]" aria-hidden="true" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div id="addresses">
          <h2 className="flex items-center gap-2 font-accent text-[0.65rem] uppercase tracking-[0.22em] text-[var(--gold-900)]">
            <MapPin size={14} aria-hidden="true" /> Saved addresses
          </h2>

          {searchParams.address === "added" ? (
            <p role="status" className="mt-3 border border-[rgba(46,125,50,0.3)] bg-[#eef7ee] px-3 py-2 text-xs text-[var(--success)]">
              Address saved.
            </p>
          ) : searchParams.address === "invalid" ? (
            <p role="alert" className="mt-3 border border-[rgba(179,38,30,0.3)] bg-[#fdf2f1] px-3 py-2 text-xs text-[var(--error)]">
              Please check the address details and try again.
            </p>
          ) : null}

          <ul className="mt-4 space-y-3">
            {addresses.map((address) => (
              <li key={address.id} className="border border-[rgba(122,90,18,0.18)] bg-[#fffdf7] p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[0.6rem] uppercase tracking-[0.14em] text-[var(--gold-900)]">
                    {address.label}
                    {address.isDefault ? " · default" : ""}
                  </p>
                  <form action={deleteAddressAction}>
                    <input type="hidden" name="addressId" value={address.id} />
                    <button
                      type="submit"
                      className="text-[0.58rem] uppercase tracking-[0.1em] text-[rgba(14,11,7,0.4)] hover:text-[var(--error)]"
                      aria-label={`Delete address ${address.label}`}
                    >
                      Delete
                    </button>
                  </form>
                </div>
                <p className="mt-1 text-sm font-medium text-[var(--ink)]">{address.fullName}</p>
                <address className="mt-1 text-xs not-italic leading-relaxed text-[rgba(14,11,7,0.6)]">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}
                  <br />
                  {address.city}, {address.state} {address.pincode}
                  <br />
                  {address.phone}
                </address>
              </li>
            ))}
            {addresses.length === 0 ? (
              <li className="border border-dashed border-[rgba(122,90,18,0.25)] p-4 text-xs font-light text-[rgba(14,11,7,0.5)]">
                No saved addresses yet. Add one below for faster checkout.
              </li>
            ) : null}
          </ul>

          <details className="mt-4 border border-[rgba(122,90,18,0.18)] bg-[#fffdf7]">
            <summary className="cursor-pointer px-4 py-3 text-[0.62rem] uppercase tracking-[0.14em] text-[var(--gold-900)]">
              Add a new address
            </summary>
            <form action={addAddressAction} className="space-y-3 border-t border-[rgba(122,90,18,0.12)] p-4">
              <div>
                <label htmlFor="address-label" className="field-label">
                  Label
                </label>
                <input id="address-label" name="label" maxLength={30} placeholder="Home, Work…" className="field py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="address-name" className="field-label">
                  Full name
                </label>
                <input id="address-name" name="fullName" required minLength={2} className="field py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="address-phone" className="field-label">
                  Phone
                </label>
                <input id="address-phone" name="phone" required type="tel" className="field py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="address-line1" className="field-label">
                  Address line 1
                </label>
                <input id="address-line1" name="line1" required minLength={5} className="field py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="address-line2" className="field-label">
                  Address line 2
                </label>
                <input id="address-line2" name="line2" className="field py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="address-city" className="field-label">
                    City
                  </label>
                  <input id="address-city" name="city" required className="field py-2 text-sm" />
                </div>
                <div>
                  <label htmlFor="address-state" className="field-label">
                    State
                  </label>
                  <input id="address-state" name="state" required className="field py-2 text-sm" />
                </div>
              </div>
              <div>
                <label htmlFor="address-pincode" className="field-label">
                  Pincode
                </label>
                <input
                  id="address-pincode"
                  name="pincode"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  className="field py-2 text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-light text-[rgba(14,11,7,0.6)]">
                <input type="checkbox" name="isDefault" className="accent-[var(--gold-700)]" /> Make
                this my default address
              </label>
              <button type="submit" className="btn-outline-ink w-full py-2.5">
                Save address
              </button>
            </form>
          </details>
        </div>
      </div>
    </section>
  );
}
