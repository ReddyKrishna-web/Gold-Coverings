import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";
import { BRAND, STORE_URL } from "@uma/brand";
import { Ornament } from "@uma/ui";

const sparkles = [
  { top: "22%", left: "58%", size: 4, delay: "0s" },
  { top: "34%", left: "72%", size: 3, delay: "1.4s" },
  { top: "62%", left: "64%", size: 5, delay: "2.6s" },
  { top: "48%", left: "86%", size: 3, delay: "0.8s" },
  { top: "74%", left: "82%", size: 4, delay: "3.4s" },
];

export function Hero() {
  return (
    <section className="section-dark relative flex min-h-[100svh] items-center overflow-hidden">
      <Image
        src="/images/jewel-5.jpg"
        alt="An ornate gold-covering bridal necklace set arranged on a warm surface"
        fill
        priority
        sizes="100vw"
        className="hero-image object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,11,7,0.96)_0%,rgba(14,11,7,0.78)_42%,rgba(14,11,7,0.28)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_80%_30%,rgba(212,175,55,0.22),transparent_70%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--ink)] to-transparent" />

      {sparkles.map((spark, index) => (
        <span
          key={index}
          aria-hidden="true"
          className="hero-spark"
          style={{
            top: spark.top,
            left: spark.left,
            width: spark.size,
            height: spark.size,
            animationDelay: spark.delay,
          }}
        />
      ))}

      <div className="lux-container relative z-10 grid w-full gap-12 pb-20 pt-32 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
        <div>
          <p
            className="fade-up flex items-center gap-3 font-accent text-[0.62rem] uppercase tracking-[0.34em] text-[var(--gold-300)]"
            style={{ animationDelay: "80ms" }}
          >
            <Sparkles size={12} aria-hidden="true" />
            Gold covering ·{" "}
            {BRAND.contact.address.city}, {BRAND.contact.address.state}
          </p>

          <h1 className="mt-7 font-display font-semibold leading-[0.92] tracking-[-0.02em] text-[var(--ivory)]">
            <span className="fade-up block text-[clamp(3.2rem,9vw,7.5rem)]" style={{ animationDelay: "180ms" }}>
              Every shine
            </span>
            <span
              className="fade-up mt-1 block text-[clamp(3.2rem,9vw,7.5rem)] italic gold-text"
              style={{ animationDelay: "320ms" }}
            >
              tells a story.
            </span>
          </h1>

          <p
            className="fade-up mt-7 max-w-md text-[0.98rem] font-light leading-relaxed text-[rgba(255,249,236,0.74)] sm:text-base"
            style={{ animationDelay: "460ms" }}
          >
            Gold-covering jewellery and ladies&rsquo; fancy accessories, chosen for the
            celebrations you&rsquo;ll remember — and the ordinary days that deserve a little gold too.
          </p>

          <div
            className="fade-up mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "580ms" }}
          >
            <Link href="/collections" className="btn-gold">
              Explore Collections <ArrowDownRight size={15} aria-hidden="true" />
            </Link>
            <a href={STORE_URL} className="btn-outline">
              Shop Online <ArrowUpRight size={15} aria-hidden="true" />
            </a>
            <Link
              href="/contact"
              className="group mt-2 inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.22em] text-[rgba(255,249,236,0.7)] transition-colors hover:text-[var(--gold-300)] sm:mt-0 sm:ml-3"
            >
              Visit the store
              <span className="h-px w-6 bg-[rgba(212,175,55,0.6)] transition-all group-hover:w-10" />
            </Link>
          </div>

          <div
            className="fade-up mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.6rem] uppercase tracking-[0.2em] text-[rgba(255,249,236,0.46)]"
            style={{ animationDelay: "700ms" }}
          >
            <span>Gold-covering finish</span>
            <span aria-hidden="true">✦</span>
            <span>Bridal &amp; custom orders</span>
            <span aria-hidden="true">✦</span>
            <span>Gift-ready packing</span>
          </div>
        </div>

        <div
          className="fade-up hidden lg:block"
          style={{ animationDelay: "820ms" }}
        >
          <div className="ml-auto max-w-[17rem] border-l border-[rgba(212,175,55,0.32)] pl-6">
            <p className="font-accent text-[0.58rem] uppercase tracking-[0.3em] text-[var(--gold-300)]">
              The house of
            </p>
            <p className="mt-3 font-display text-3xl leading-tight text-[var(--ivory)]">
              {BRAND.name}
            </p>
            <p className="mt-3 text-sm font-light italic leading-relaxed text-[rgba(255,249,236,0.6)]">
              “{BRAND.tagline}”
            </p>
            <Ornament className="mt-6 opacity-80" />
            <p className="mt-5 text-[0.65rem] uppercase tracking-[0.2em] text-[rgba(255,249,236,0.45)]">
              {BRAND.contact.address.line2}
              <br />
              {BRAND.contact.address.city} · {BRAND.contact.address.pincode}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex">
        <span className="text-[0.55rem] uppercase tracking-[0.35em] text-[rgba(255,249,236,0.4)]">
          Scroll
        </span>
        <span className="h-10 w-px bg-gradient-to-b from-[rgba(212,175,55,0.7)] to-transparent" />
      </div>
    </section>
  );
}
