import type { Metadata } from "next";
import { requireOwner } from "@/lib/auth";
import { getStoreSettings } from "@/lib/settings";
import { updateSettingsAction } from "@/app/actions/admin";
import { AdminNotice, AdminPageHeader } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: { saved?: string; error?: string };
}) {
  await requireOwner();
  const settings = await getStoreSettings();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Owner controls"
        title="Store settings"
        description="These values drive checkout rules and the announcement bar. Prices are stored in paise; enter rupees here."
      />

      {searchParams.saved ? <AdminNotice tone="success">Settings saved.</AdminNotice> : null}
      {searchParams.error ? <AdminNotice tone="error">{searchParams.error}</AdminNotice> : null}

      <form action={updateSettingsAction} className="mt-5 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <section className="admin-card p-4">
            <h2 className="text-sm font-medium">Payments &amp; delivery</h2>
            <div className="mt-3 space-y-3">
              <label className="flex items-start gap-2 text-xs">
                <input
                  type="checkbox"
                  name="codEnabled"
                  defaultChecked={settings.codEnabled}
                  className="mt-0.5 accent-[var(--gold-700)]"
                />
                <span>
                  <span className="block text-[var(--ink)]">Cash on delivery</span>
                  <span className="block text-[0.58rem] text-[rgba(14,11,7,0.45)]">
                    When off, COD is hidden and rejected on the server.
                  </span>
                </span>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="settings-codmax" className="admin-label">
                    COD maximum order (₹)
                  </label>
                  <input
                    id="settings-codmax"
                    name="codMax"
                    type="number"
                    min={0}
                    defaultValue={settings.codMaxPaise / 100}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label htmlFor="settings-shipping" className="admin-label">
                    Shipping fee (₹)
                  </label>
                  <input
                    id="settings-shipping"
                    name="shipping"
                    type="number"
                    min={0}
                    defaultValue={settings.shippingPaise / 100}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label htmlFor="settings-freeabove" className="admin-label">
                    Free shipping above (₹)
                  </label>
                  <input
                    id="settings-freeabove"
                    name="freeAbove"
                    type="number"
                    min={0}
                    defaultValue={settings.freeShippingAbovePaise / 100}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label htmlFor="settings-return" className="admin-label">
                    Exchange window (days)
                  </label>
                  <input
                    id="settings-return"
                    name="returnWindow"
                    type="number"
                    min={0}
                    max={60}
                    defaultValue={settings.returnWindowDays}
                    className="admin-input"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="admin-card p-4">
            <h2 className="text-sm font-medium">Tax display</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="settings-gst" className="admin-label">
                  GST percent
                </label>
                <input
                  id="settings-gst"
                  name="gst"
                  type="number"
                  min={0}
                  max={28}
                  defaultValue={settings.gstPercent}
                  className="admin-input"
                />
              </div>
              <p className="self-end text-[0.6rem] leading-relaxed text-[rgba(14,11,7,0.45)]">
                Leave at 0 until the owner and a tax professional confirm the correct treatment.
                Enabling GST adds it to totals at checkout.
              </p>
            </div>
          </section>

          <section className="admin-card p-4">
            <label htmlFor="settings-announcement" className="admin-label">
              Announcement bar
            </label>
            <input
              id="settings-announcement"
              name="announcement"
              maxLength={160}
              defaultValue={settings.announcement ?? ""}
              className="admin-input"
              placeholder="Festive edit is here · Free shipping above ₹1,499"
            />
            <p className="mt-1 text-[0.58rem] text-[rgba(14,11,7,0.4)]">
              Shown above the store header. Keep it short and accurate.
            </p>
          </section>
        </div>

        <section className="admin-card h-fit p-4">
          <button type="submit" className="btn-dark w-full py-3">
            Save settings
          </button>
          <div className="mt-4 space-y-2 border-t border-[rgba(122,90,18,0.12)] pt-3 text-[0.6rem] leading-relaxed text-[rgba(14,11,7,0.45)]">
            <p>Changes apply to new checkouts immediately.</p>
            <p>
              Razorpay keys, email and database credentials are environment variables — not editable
              here, by design.
            </p>
            <p>Every settings change is written to the audit log with the owner&rsquo;s account.</p>
          </div>
        </section>
      </form>
    </div>
  );
}
