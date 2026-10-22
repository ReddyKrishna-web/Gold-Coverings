import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MessageCircle } from "lucide-react";
import {
  BRAND,
  STORE_URL,
  TRUST_POINTS,
  fullAddress,
  mapsSearchUrl,
  telHref,
  whatsappHref,
} from "@uma/brand";
import { Ornament, Reveal, SectionHeading } from "@uma/ui";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Krishna Jewellers is a family-run gold-covering jewellery and ladies' fancy store in Hyderabad, chosen for bridal, festive and everyday moments.",
  alternates: { canonical: "/about" },
  openGraph: { images: [{ url: "/images/jewel-4.jpg", alt: "Krishna Jewellers jewellery" }] },
};

export default function AboutPage() {
  return (
    <>
      <section className="section-dark pb-16 pt-36">
        <div className="lux-container">
          <p className="eyebrow text-[var(--gold-300)]">Our story</p>
          <h1 className="display-hero mt-4 max-w-4xl text-[var(--ivory)]">
            A store for the <span className="italic gold-text">moments that matter.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[0.98rem] font-light leading-relaxed text-[rgba(255,249,236,0.68)]">
            {BRAND.name} is a family-run jewellery and fancy store in {BRAND.contact.address.city}.
            We bring together gold-covering pieces for brides, festivals and the everyday — chosen
            with care, described honestly.
          </p>
        </div>
      </section>

      <section className="section-pad bg-[var(--ivory)]">
        <div className="lux-container grid items-start gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden border border-[rgba(212,175,55,0.3)]">
              <Image
                src="/images/jewel-1.jpg"
                alt="Gold-covering jewellery displayed at Krishna Jewellers"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
            </div>
            <div className="mt-5 border-l border-[rgba(212,175,55,0.45)] pl-5">
              <p className="font-display text-2xl italic text-[var(--gold-900)]">
                “{BRAND.tagline}”
              </p>
              <p className="mt-2 text-[0.6rem] uppercase tracking-[0.24em] text-[rgba(14,11,7,0.5)]">
                {BRAND.name}
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <p className="eyebrow">How we began</p>
            <h2 className="display-lg mt-4 text-[var(--ink)]">
              Less pressure. <span className="italic gold-text">More joy.</span>
            </h2>
            <div className="mt-6 space-y-4 text-[0.95rem] font-light leading-[1.9] text-[rgba(14,11,7,0.68)]">
              <p>
                The idea was simple: a wedding, a festival or a first day at work should not need
                a solid-gold budget to feel special. Gold-covering jewellery offers the warmth and
                finish people love, at a price that leaves room for the rest of the celebration.
              </p>
              <p>
                We choose each piece ourselves — looking at the finish, the weight, the clasp, how
                it sits for hours. If it does not feel comfortable or photograph well, it does not
                make it into the collection.
              </p>
              <p>
                Bridal sets are our favourite. Tell us the outfit, the colours and the date, and we
                will help you put together the necklace, earrings and finishing touches so the whole
                look feels considered — not borrowed.
              </p>
            </div>
            <Ornament className="mt-7" />

            <div className="mt-7 grid gap-5 sm:grid-cols-3">
              <div>
                <p className="font-display text-3xl text-[var(--gold-900)]">8</p>
                <p className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-[rgba(14,11,7,0.5)]">
                  Curated collections
                </p>
              </div>
              <div>
                <p className="font-display text-3xl text-[var(--gold-900)]">Gold</p>
                <p className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-[rgba(14,11,7,0.5)]">
                  Covering finish
                </p>
              </div>
              <div>
                <p className="font-display text-3xl text-[var(--gold-900)]">Bridal</p>
                <p className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-[rgba(14,11,7,0.5)]">
                  &amp; custom orders
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-outline-ink">
                Plan a visit <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-2 py-4 text-[0.65rem] uppercase tracking-[0.2em] text-[var(--gold-900)]"
              >
                <MessageCircle size={15} aria-hidden="true" /> WhatsApp us
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-dark section-pad">
        <div className="lux-container">
          <SectionHeading
            tone="dark"
            eyebrow="What we stand for"
            title={
              <>
                Small store, <span className="italic gold-text">clear standards.</span>
              </>
            }
            description="The things we will always be honest about, because trust is the whole point."
          />
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {TRUST_POINTS.map((point, index) => (
              <Reveal key={point.title} delay={index * 50}>
                <div className="border-t border-[rgba(212,175,55,0.3)] pt-5">
                  <h3 className="font-display text-2xl text-[var(--ivory)]">{point.title}</h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-[rgba(255,249,236,0.62)]">
                    {point.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={100}>
            <div className="mt-14 grid gap-6 border border-[rgba(212,175,55,0.28)] p-7 sm:grid-cols-2 sm:p-9">
              <div>
                <p className="eyebrow text-[var(--gold-300)]">What our jewellery is</p>
                <p className="mt-3 text-sm font-light leading-relaxed text-[rgba(255,249,236,0.72)]">
                  Gold covering / gold plating over a base metal, with stones and beads where
                  described. Colours and finishes can vary slightly from screen to screen.
                </p>
              </div>
              <div>
                <p className="eyebrow text-[var(--gold-300)]">What it is not</p>
                <p className="mt-3 text-sm font-light leading-relaxed text-[rgba(255,249,236,0.72)]">
                  It is not solid gold, and we do not claim purity, hallmarking or certification.
                  If a piece is described otherwise in store, ask us for the written details.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-pad bg-[var(--blush)]">
        <div className="lux-container grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="relative aspect-square overflow-hidden border border-[rgba(122,90,18,0.25)]">
              <Image
                src="/images/jewel-3.jpg"
                alt="Stacked gold-tone bangles from the Krishna Jewellers collection"
                fill
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <p className="eyebrow">Meet the owner</p>
            <h2 className="display-lg mt-4 text-[var(--ink)]">{BRAND.owner.name}</h2>
            <p className="mt-2 text-[0.65rem] uppercase tracking-[0.22em] text-[rgba(14,11,7,0.55)]">
              {BRAND.owner.role}, {BRAND.name}
            </p>
            <p className="mt-5 text-[0.95rem] font-light leading-[1.9] text-[rgba(14,11,7,0.68)]">
              “I want every customer to feel comfortable asking questions — about the finish,
              the price, how to care for a piece, or whether it will match an outfit. That
              conversation is the reason to visit a store instead of scrolling.”
            </p>
            <div className="mt-7 space-y-2 text-sm text-[rgba(14,11,7,0.66)]">
              <p>{fullAddress()}</p>
              <p>
                <a href={telHref()} className="underline decoration-[var(--gold-500)] underline-offset-4">
                  {BRAND.contact.phone}
                </a>{" "}
                ·{" "}
                <a href={mapsSearchUrl()} target="_blank" rel="noopener noreferrer" className="underline decoration-[var(--gold-500)] underline-offset-4">
                  Directions
                </a>
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-outline-ink">
                Send an enquiry
              </Link>
              <a href={STORE_URL} className="btn-gold">
                Shop online <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
