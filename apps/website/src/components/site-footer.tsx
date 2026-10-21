import Link from "next/link";
import {
  BRAND,
  CATEGORIES,
  POLICIES,
  STORE_URL,
  WEBSITE_NAV,
  fullAddress,
  mailHref,
  mapsSearchUrl,
  telHref,
} from "@uma/brand";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { NewsletterForm } from "./newsletter-form";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const socials = [
    { label: "Instagram", href: BRAND.contact.socials.instagram, Icon: Instagram },
    { label: "Facebook", href: BRAND.contact.socials.facebook, Icon: Facebook },
    { label: "YouTube", href: BRAND.contact.socials.youtube, Icon: Youtube },
  ];

  return (
    <footer className="section-dark text-[rgba(255,249,236,0.72)]">
      <div className="lux-container grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center border border-[rgba(212,175,55,0.5)] font-display text-lg gold-text">
              {BRAND.monogram}
            </span>
            <span className="font-display text-2xl text-[var(--ivory)]">{BRAND.name}</span>
          </Link>
          <p className="mt-4 font-display text-lg italic text-[var(--gold-300)]">“{BRAND.tagline}”</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Gold-covering (gold-plated) jewellery and ladies&rsquo; fancy accessories, chosen for
            celebrations big and small.
          </p>
          <div className="mt-6 flex gap-3">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${BRAND.name} on ${label}`}
                className="flex h-10 w-10 items-center justify-center border border-[rgba(212,175,55,0.3)] text-[var(--gold-300)] transition-colors hover:border-[var(--gold-300)] hover:bg-[rgba(212,175,55,0.1)]"
              >
                <Icon size={16} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-accent text-[0.68rem] uppercase tracking-[0.28em] text-[var(--gold-300)]">
            Collections
          </h3>
          <ul className="mt-5 space-y-2.5 text-sm">
            {CATEGORIES.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/collections/${category.slug}`}
                  className="transition-colors hover:text-[var(--gold-100)]"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-accent text-[0.68rem] uppercase tracking-[0.28em] text-[var(--gold-300)]">
            The House
          </h3>
          <ul className="mt-5 space-y-2.5 text-sm">
            {WEBSITE_NAV.filter((item) => item.href !== "/").map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-[var(--gold-100)]">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={STORE_URL} className="text-[var(--gold-300)] hover:text-[var(--gold-100)]">
                Shop online ↗
              </a>
            </li>
          </ul>
          <h3 className="mt-7 font-accent text-[0.68rem] uppercase tracking-[0.28em] text-[var(--gold-300)]">
            Policies
          </h3>
          <ul className="mt-5 space-y-2.5 text-sm">
            {POLICIES.map((policy) => (
              <li key={policy.slug}>
                <Link href={`/policies/${policy.slug}`} className="hover:text-[var(--gold-100)]">
                  {policy.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-accent text-[0.68rem] uppercase tracking-[0.28em] text-[var(--gold-300)]">
            Visit &amp; Contact
          </h3>
          <address className="mt-5 space-y-3 text-sm not-italic">
            <a
              href={mapsSearchUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 hover:text-[var(--gold-100)]"
            >
              <MapPin size={15} className="mt-1 shrink-0 text-[var(--gold-500)]" aria-hidden="true" />
              <span>{fullAddress()}</span>
            </a>
            <a href={telHref()} className="flex items-center gap-3 hover:text-[var(--gold-100)]">
              <Phone size={15} className="shrink-0 text-[var(--gold-500)]" aria-hidden="true" />
              {BRAND.contact.phone}
            </a>
            <a href={mailHref()} className="flex items-center gap-3 hover:text-[var(--gold-100)]">
              <Mail size={15} className="shrink-0 text-[var(--gold-500)]" aria-hidden="true" />
              {BRAND.contact.email}
            </a>
          </address>
          <div className="mt-5 space-y-1 text-sm">
            {BRAND.contact.hours.map((entry) => (
              <p key={entry.days}>
                <span className="text-[var(--gold-300)]">{entry.days}:</span> {entry.time}
              </p>
            ))}
          </div>
          {BRAND.contact.gstin ? (
            <p className="mt-4 text-xs uppercase tracking-[0.15em] text-[rgba(255,249,236,0.5)]">
              GSTIN: {BRAND.contact.gstin}
            </p>
          ) : null}
          <div className="mt-7">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(212,175,55,0.16)]">
        <div className="lux-container flex flex-col gap-3 py-6 text-xs text-[rgba(255,249,236,0.5)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {BRAND.name}. {BRAND.owner.name}, {BRAND.owner.role}.
          </p>
          <p>
            Gold-covering jewellery — described honestly, never claimed as solid gold.
          </p>
        </div>
      </div>
    </footer>
  );
}
