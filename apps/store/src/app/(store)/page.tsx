import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Gem, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { BRAND, WEBSITE_URL, formatINR, whatsappHref } from "@uma/brand";
import { Ornament, Reveal } from "@uma/ui";
import { StoreProductCard } from "@/components/product-card";
import { getBestsellers, getNavCategories, getNewArrivals } from "@/lib/catalog";
import { getStoreSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Gold Covering Jewellery Online",
  description:
    "Shop earrings, jhumkas, bangles, necklaces, bridal sets and fancy accessories. Gold-covering jewellery with secure online payment and COD across India.",
  alternates: { canonical: "/" },
};

export default async function StoreHomePage() {
  const [categories, newArrivals, bestsellers, settings] = await Promise.all([
    getNavCategories(),
    getNewArrivals(4),
    getBestsellers(4),
    getStoreSettings(),
  ]);

  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden bg-[var(--ivory)]">
        <div className="lux-container grid items-center gap-10 py-14 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:py-20">
          <Reveal>
            <p className="eyebrow flex items-center gap-2">
              <Gem size={13} aria-hidden="true" /> The online store
            </p>
            <h1 className="display-hero mt-4 text-[var(--ink)]">
              The gold edit,
              <br />
              <span className="italic gold-text">delivered.</span>
            </h1>
            <p className="mt-6 max-w-md text-[0.95rem] font-light leading-[1.8] text-[rgba(14,11,7,0.68)]">
              Bridal sets, festive jhumkas and everyday pieces in a warm gold-covering finish.
              Order online, pay securely, or choose cash on delivery. Live stock, no surprises.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className="btn-gold">
                Shop all jewellery <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <Link href="/shop?category=bridal-sets" className="btn-outline-ink">
                The bridal edit
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[0.58rem] uppercase tracking-[0.18em] text-[rgba(14,11,7,0.5)]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[var(--gold-700)]" aria-hidden="true" /> Secure
                Razorpay payments
              </span>
              <span className="flex items-center gap-1.5">
                <Truck size={13} className="text-[var(--gold-700)]" aria-hidden="true" /> Free shipping
                above {formatINR(settings.freeShippingAbovePaise)}
              </span>
              <span className="flex items-center gap-1.5">
                <PackageCheck size={13} className="text-[var(--gold-700)]" aria-hidden="true" />{" "}
                {settings.returnWindowDays}-day exchange
              </span>
            </div>
          </Reveal>

          <Reveal delay={120} className="relative">
            <div className="relative ml-auto aspect-[4/5] w-[92%] overflow-hidden border border-[rgba(122,90,18,0.25)] sm:w-[80%] lg:w-full">
              <Image
                src="/images/jewel-5.jpg"
                alt="An ornate gold-covering bridal jewellery set"
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(14,11,7,0.35)] via-transparent to-transparent" />
            </div>
            <div className="absolute -left-2 bottom-8 border border-[rgba(122,90,18,0.25)] bg-[rgba(255,249,236,0.96)] px-5 py-4 shadow-[var(--shadow-lux)] backdrop-blur sm:left-4">
              <p className="font-accent text-[0.55rem] uppercase tracking-[0.24em] text-[var(--gold-700)]">
                Honest by design
              </p>
              <p className="mt-1 font-display text-lg leading-snug text-[var(--ink)]">
                Gold covering,
                <br />
                never called solid gold.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* category strip */}
      <section className="border-y border-[rgba(122,90,18,0.14)] bg-[#fffdf7] py-8">
        <div className="lux-container">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="font-accent text-[0.65rem] uppercase tracking-[0.26em] text-[var(--gold-700)]">
              Shop by collection
            </h2>
            <Link
              href="/shop"
              className="group flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.16em] text-[rgba(14,11,7,0.55)] hover:text-[var(--gold-900)]"
            >
              All pieces <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
          <div className="hide-scrollbar flex gap-3 overflow-x-auto pb-1">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group w-28 shrink-0 sm:w-32"
              >
                <div className="relative aspect-square overflow-hidden border border-[rgba(122,90,18,0.14)] bg-[var(--blush)]">
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.imageAlt ?? category.name}
                      fill
                      sizes="128px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <p className="mt-2 text-center font-display text-sm leading-tight text-[var(--ink)]">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* new arrivals */}
      <section className="lux-container py-14 sm:py-16">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Just in</p>
              <h2 className="display-md mt-2 text-[var(--ink)]">New arrivals</h2>
            </div>
            <Link
              href="/shop?sort=new"
              className="flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.16em] text-[var(--gold-900)] hover:underline"
            >
              See all <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
        <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {newArrivals.map((product, index) => (
            <Reveal key={product.id} delay={index * 50}>
              <StoreProductCard product={product} priority={index < 2} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* bridal editorial */}
      <section className="relative overflow-hidden bg-[var(--ink)]">
        <div className="absolute inset-0">
          <Image
            src="/images/jewel-1.jpg"
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,11,7,0.96)_0%,rgba(14,11,7,0.75)_55%,rgba(14,11,7,0.4)_100%)]" />
        </div>
        <div className="lux-container relative grid items-center gap-8 py-16 sm:py-20 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow text-[var(--gold-300)]">The bridal edit</p>
            <h2 className="display-lg mt-4 max-w-md text-[var(--ivory)]">
              A whole look, <span className="italic gold-text">considered.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm font-light leading-relaxed text-[rgba(255,249,236,0.7)]">
              Necklace, jhumkas and maang tikka chosen to sit together. Tell us the outfit and the
              date — we&rsquo;ll help you finish the look without the solid-gold price tag.
            </p>
            <Ornament className="mt-6" />
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/shop?category=bridal-sets" className="btn-gold">
                Shop bridal sets <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <a
                href={whatsappHref("Hello Krishna Jewellers, I'd like help choosing a bridal set.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                Ask for help
              </a>
            </div>
          </Reveal>
          <Reveal delay={100} className="hidden lg:block">
            <div className="ml-auto aspect-[5/4] w-[85%] border border-[rgba(212,175,55,0.35)]">
              <div className="relative h-full w-full">
                <Image
                  src="/images/jewel-7.jpg"
                  alt="A gold-covering bridal set styled in warm light"
                  fill
                  sizes="40vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* bestsellers */}
      <section className="lux-container py-14 sm:py-16">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Most loved</p>
              <h2 className="display-md mt-2 text-[var(--ink)]">Bestsellers</h2>
            </div>
            <Link
              href="/shop?sort=popular"
              className="flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.16em] text-[var(--gold-900)] hover:underline"
            >
              Shop popular <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
        <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {bestsellers.map((product, index) => (
            <Reveal key={product.id} delay={index * 50}>
              <StoreProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* brand link */}
      <section className="border-t border-[rgba(122,90,18,0.16)] bg-[#fffdf7] py-12">
        <div className="lux-container flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow">The house behind the store</p>
            <h2 className="display-md mt-2 text-[var(--ink)]">{BRAND.name}</h2>
            <p className="mt-2 max-w-lg text-sm font-light leading-relaxed text-[rgba(14,11,7,0.6)]">
              Read the story, see the lookbook, or plan a visit to the store in{" "}
              {BRAND.contact.address.city}.
            </p>
          </div>
          <a href={WEBSITE_URL} className="btn-outline-ink shrink-0">
            Visit the brand site <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </section>
    </>
  );
}
