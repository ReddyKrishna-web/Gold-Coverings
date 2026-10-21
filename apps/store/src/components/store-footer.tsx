import Link from "next/link";
import {
  BRAND,
  CATEGORIES,
  STORE_NAV,
  WEBSITE_URL,
  formatINR,
  fullAddress,
  mailHref,
  telHref,
} from "@uma/brand";
import { MapPin, Phone, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { getStoreSettings } from "@/lib/settings";

export async function StoreFooter() {
  const year = new Date().getFullYear();
  const settings = await getStoreSettings();

  return (
    <footer className="mt-20 bg-[var(--ink)] text-[rgba(255,249,236,0.68)]">
      <div className="border-b border-[rgba(212,175,55,0.16)]">
        <div className="lux-container grid gap-5 py-8 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <Truck size={18} className="mt-0.5 text-[var(--gold-500)]" aria-hidden="true" />
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[var(--gold-300)]">
                Delivery across India
              </p>
              <p className="mt-1 text-xs font-light">
                Free shipping above {formatINR(settings.freeShippingAbovePaise)} · packed with care
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Undo2 size={18} className="mt-0.5 text-[var(--gold-500)]" aria-hidden="true" />
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[var(--gold-300)]">
                7-day exchange window
              </p>
              <p className="mt-1 text-xs font-light">
                {settings.returnWindowDays}-day exchange window on unworn pieces, per our returns policy
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 text-[var(--gold-500)]" aria-hidden="true" />
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[var(--gold-300)]">
                Secure payments
              </p>
              <p className="mt-1 text-xs font-light">UPI, cards &amp; netbanking via Razorpay · COD available</p>
            </div>
          </div>
        </div>
      </div>

      <div className="lux-container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center border border-[rgba(212,175,55,0.5)] font-display text-lg gold-text">
              {BRAND.monogram}
            </span>
            <span className="font-display text-2xl text-[var(--ivory)]">{BRAND.name}</span>
          </Link>
          <p className="mt-4 font-display text-lg italic text-[var(--gold-300)]">
            “{BRAND.tagline}”
          </p>
          <p className="mt-4 text-sm font-light leading-relaxed">
            Gold-covering jewellery and ladies&rsquo; fancy accessories, delivered across India
            from our store in {BRAND.contact.address.city}.
          </p>
          <a
            href={WEBSITE_URL}
            className="mt-5 inline-flex text-[0.62rem] uppercase tracking-[0.2em] text-[var(--gold-300)] underline decoration-[rgba(212,175,55,0.4)] underline-offset-4"
          >
            Visit the brand website ↗
          </a>
        </div>

        <div>
          <h2 className="font-accent text-[0.65rem] uppercase tracking-[0.26em] text-[var(--gold-300)]">
            Shop
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {STORE_NAV.slice(0, 3).map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="hover:text-[var(--gold-100)]">
                  {item.label}
                </Link>
              </li>
            ))}
            {CATEGORIES.slice(0, 4).map((category) => (
              <li key={category.slug}>
                <Link href={`/shop?category=${category.slug}`} className="hover:text-[var(--gold-100)]">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-accent text-[0.65rem] uppercase tracking-[0.26em] text-[var(--gold-300)]">
            Help
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a href={`${WEBSITE_URL}/contact`} className="hover:text-[var(--gold-100)]">
                Contact &amp; visit
              </a>
            </li>
            <li>
              <a href={`${WEBSITE_URL}/policies/shipping`} className="hover:text-[var(--gold-100)]">
                Shipping &amp; delivery
              </a>
            </li>
            <li>
              <a href={`${WEBSITE_URL}/policies/returns`} className="hover:text-[var(--gold-100)]">
                Returns &amp; exchanges
              </a>
            </li>
            <li>
              <a href={`${WEBSITE_URL}/policies/privacy`} className="hover:text-[var(--gold-100)]">
                Privacy policy
              </a>
            </li>
            <li>
              <a href={`${WEBSITE_URL}/policies/terms`} className="hover:text-[var(--gold-100)]">
                Terms of use
              </a>
            </li>
            <li>
              <Link href="/account" className="hover:text-[var(--gold-100)]">
                Your orders
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-accent text-[0.65rem] uppercase tracking-[0.26em] text-[var(--gold-300)]">
            Visit the store
          </h2>
          <address className="mt-4 space-y-3 text-sm not-italic">
            <p className="flex gap-3">
              <MapPin size={15} className="mt-1 shrink-0 text-[var(--gold-500)]" aria-hidden="true" />
              {fullAddress()}
            </p>
            <a href={telHref()} className="flex items-center gap-3 hover:text-[var(--gold-100)]">
              <Phone size={15} className="shrink-0 text-[var(--gold-500)]" aria-hidden="true" />
              {BRAND.contact.phone}
            </a>
            <a href={mailHref()} className="break-all text-xs hover:text-[var(--gold-100)]">
              {BRAND.contact.email}
            </a>
          </address>
          <div className="mt-4 space-y-1 text-xs">
            {BRAND.contact.hours.map((entry) => (
              <p key={entry.days}>
                <span className="text-[var(--gold-300)]">{entry.days}</span> · {entry.time}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(212,175,55,0.14)]">
        <div className="lux-container flex flex-col gap-2 py-5 text-[0.65rem] text-[rgba(255,249,236,0.45)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {BRAND.name}. {BRAND.owner.name}, {BRAND.owner.role}.
          </p>
          <p>
            Gold covering / gold plated jewellery. Never sold or described as solid gold.
          </p>
        </div>
      </div>
    </footer>
  );
}
