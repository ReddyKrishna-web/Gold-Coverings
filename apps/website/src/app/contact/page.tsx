import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone, Sparkles } from "lucide-react";
import {
  BRAND,
  fullAddress,
  mailHref,
  mapsEmbedUrl,
  mapsSearchUrl,
  telHref,
  whatsappHref,
} from "@uma/brand";
import { Reveal } from "@uma/ui";
import { EnquiryForm } from "@/components/enquiry-form";

export const metadata: Metadata = {
  title: "Visit Us",
  description: `Visit ${BRAND.name} in ${BRAND.contact.address.city} for gold-covering jewellery, bridal sets and ladies' fancy accessories. Phone, hours, directions and enquiry form.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <section className="section-dark pb-14 pt-36">
        <div className="lux-container">
          <p className="eyebrow text-[var(--gold-300)]">Visit &amp; contact</p>
          <h1 className="display-hero mt-4 max-w-3xl text-[var(--ivory)]">
            Two taps to <span className="italic gold-text">say hello.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[0.98rem] font-light leading-relaxed text-[rgba(255,249,236,0.68)]">
            Call, message or come in. If you are planning a bridal look, a quick call ahead helps
            us keep the right pieces aside for you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="btn-gold">
              <MessageCircle size={15} aria-hidden="true" /> WhatsApp the store
            </a>
            <a href={telHref()} className="btn-outline">
              <Phone size={15} aria-hidden="true" /> Call {BRAND.contact.phone}
            </a>
          </div>
        </div>
      </section>

      <section className="section-pad bg-[var(--ivory)]">
        <div className="lux-container grid gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <div className="space-y-8">
              <div>
                <p className="eyebrow flex items-center gap-2">
                  <MapPin size={13} aria-hidden="true" /> The store
                </p>
                <address className="mt-3 not-italic">
                  <p className="font-display text-2xl leading-snug text-[var(--ink)]">
                    {BRAND.name}
                  </p>
                  <p className="mt-1 text-sm font-light leading-relaxed text-[rgba(14,11,7,0.68)]">
                    {fullAddress()}
                  </p>
                  <a
                    href={mapsSearchUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.2em] text-[var(--gold-900)] underline decoration-[var(--gold-500)] underline-offset-4"
                  >
                    Open in Google Maps ↗
                  </a>
                </address>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="eyebrow flex items-center gap-2">
                    <Phone size={13} aria-hidden="true" /> Phone
                  </p>
                  <a
                    href={telHref()}
                    className="mt-2 block text-sm font-light text-[rgba(14,11,7,0.75)] hover:text-[var(--gold-900)]"
                  >
                    {BRAND.contact.phone}
                  </a>
                  <a
                    href={whatsappHref()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-xs text-[rgba(14,11,7,0.5)] hover:text-[var(--gold-900)]"
                  >
                    WhatsApp: {BRAND.contact.whatsapp}
                  </a>
                </div>
                <div>
                  <p className="eyebrow flex items-center gap-2">
                    <Mail size={13} aria-hidden="true" /> Email
                  </p>
                  <a
                    href={mailHref()}
                    className="mt-2 block break-all text-sm font-light text-[rgba(14,11,7,0.75)] hover:text-[var(--gold-900)]"
                  >
                    {BRAND.contact.email}
                  </a>
                </div>
              </div>

              <div>
                <p className="eyebrow flex items-center gap-2">
                  <Clock size={13} aria-hidden="true" /> Opening hours
                </p>
                <dl className="mt-3 divide-y divide-[rgba(122,90,18,0.15)] border-y border-[rgba(122,90,18,0.15)]">
                  {BRAND.contact.hours.map((entry) => (
                    <div key={entry.days} className="flex justify-between gap-4 py-2.5 text-sm">
                      <dt className="font-light text-[rgba(14,11,7,0.68)]">{entry.days}</dt>
                      <dd className="text-[rgba(14,11,7,0.85)]">{entry.time}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-2 text-[0.68rem] text-[rgba(14,11,7,0.45)]">
                  Festival hours may vary — a quick call before travelling is always a good idea.
                </p>
              </div>

              <div className="border border-[rgba(212,175,55,0.3)] bg-[#fffdf7] p-6">
                <p className="eyebrow flex items-center gap-2">
                  <Sparkles size={13} aria-hidden="true" /> Before you visit
                </p>
                <ul className="mt-3 space-y-2 text-sm font-light leading-relaxed text-[rgba(14,11,7,0.65)]">
                  <li>Bring the outfit or a photo if you are matching a bridal or festive look.</li>
                  <li>Know your bangle size — or come in and we will measure it.</li>
                  <li>Custom and bridal orders may need extra time; talk to us early.</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 overflow-hidden border border-[rgba(212,175,55,0.3)]">
              <iframe
                title={`Map showing ${BRAND.name}`}
                src={mapsEmbedUrl()}
                width="100%"
                height="320"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale-[30%]"
              />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="border border-[rgba(212,175,55,0.35)] bg-[#fffdf7] p-6 sm:p-9">
              <p className="eyebrow">Send a note</p>
              <h2 className="mt-3 font-display text-3xl text-[var(--ink)]">
                What are you looking for?
              </h2>
              <p className="mt-2 mb-7 text-sm font-light leading-relaxed text-[rgba(14,11,7,0.6)]">
                Share an occasion, date or budget. We will reply with a few options and let you
                know what is in store.
              </p>
              <EnquiryForm />
            </div>
            <p className="mt-4 text-center text-[0.68rem] text-[rgba(14,11,7,0.45)]">
              Prefer Instagram?{" "}
              <a
                href={BRAND.contact.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[var(--gold-500)] underline-offset-2"
              >
                Send us a DM
              </a>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
