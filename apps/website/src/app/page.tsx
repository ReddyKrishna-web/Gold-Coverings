import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Crown,
  Gem,
  Gift,
  Leaf,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  Tag,
} from "lucide-react";
import {
  BRAND,
  CARE_TIPS,
  STORE_URL,
  TRUST_POINTS,
  fullAddress,
  mapsEmbedUrl,
  mapsSearchUrl,
  telHref,
  whatsappHref,
} from "@uma/brand";
import { Reveal, SectionHeading } from "@uma/ui";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { CollectionCard, ProductCard, TestimonialCard } from "@/components/cards";
import { EnquiryForm } from "@/components/enquiry-form";
import { getCollections, getFeaturedProducts, getGallery, getTestimonials } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gold Covering Jewellery & Ladies' Fancy Store",
  description:
    "Explore gold-covering earrings, jhumkas, bangles, necklaces, bridal sets and fancy accessories at Uma Fashions, Hyderabad. Visit the store or shop online.",
  alternates: { canonical: "/" },
};

const icons = { sparkle: Sparkles, leaf: Leaf, gem: Gem, tag: Tag, crown: Crown, gift: Gift } as const;

export default async function HomePage() {
  const [collections, featured, gallery, testimonials] = await Promise.all([
    getCollections(),
    getFeaturedProducts(6),
    getGallery(6),
    getTestimonials(3),
  ]);

  return (
    <>
      <Hero />
      <Marquee />

      {/* ---------------- brand introduction ---------------- */}
      <section className="section-pad bg-[var(--ivory)]">
        <div className="lux-container grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <p className="eyebrow">The Uma Fashions approach</p>
            <h2 className="display-lg mt-4 max-w-lg text-[var(--ink)]">
              Fine-looking gold, <span className="italic gold-text">honestly described.</span>
            </h2>
            <div className="mt-6 space-y-4 text-[0.95rem] font-light leading-[1.85] text-[rgba(14,11,7,0.68)]">
              <p>
                We are a family-run jewellery and fancy store in {BRAND.contact.address.city},
                bringing together gold-covering (gold-plated) pieces for brides, festive dressing
                and everyday wear.
              </p>
              <p>
                Nothing here pretends to be solid gold. What we offer is considered design, a
                warm gold-covering finish and a price that lets you say yes to the piece you
                actually love.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/about" className="btn-outline-ink">
                Read our story <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <a
                href={whatsappHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.2em] text-[var(--gold-900)]"
              >
                <MessageCircle size={15} aria-hidden="true" /> Ask on WhatsApp
              </a>
            </div>
          </Reveal>

          <Reveal delay={120} className="relative">
            <div className="relative ml-auto aspect-[4/5] w-[82%] overflow-hidden border border-[rgba(212,175,55,0.4)]">
              <Image
                src="/images/jewel-2.jpg"
                alt="Gold-covering earrings and studs styled on a soft neutral surface"
                fill
                sizes="(max-width: 1024px) 80vw, 40vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-8 left-0 aspect-square w-[38%] overflow-hidden border-[6px] border-[var(--ivory)] shadow-[var(--shadow-lux)]">
              <Image
                src="/images/jewel-7.jpg"
                alt="A delicate gold-tone anklet with tiny charms"
                fill
                sizes="(max-width: 1024px) 38vw, 18vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -left-2 top-8 hidden border border-[rgba(212,175,55,0.4)] bg-[rgba(255,249,236,0.94)] px-5 py-4 backdrop-blur sm:block">
              <p className="font-accent text-[0.55rem] uppercase tracking-[0.25em] text-[var(--gold-700)]">
                In store &amp; online
              </p>
              <p className="mt-1 font-display text-lg text-[var(--ink)]">
                Bridal appointments
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- collections ---------------- */}
      <section className="pb-20 pt-6 sm:pb-28" id="collections">
        <div className="lux-container">
          <Reveal>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading
                align="left"
                eyebrow="The collections"
                title={
                  <>
                    Find your <span className="italic gold-text">shine</span>
                  </>
                }
                description="Eight considered edits, from small everyday studs to full bridal sets."
                ornament={false}
              />
              <Link
                href="/collections"
                className="group inline-flex items-center gap-2 whitespace-nowrap text-[0.65rem] uppercase tracking-[0.22em] text-[var(--gold-900)]"
              >
                View all collections
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {collections.map((collection, index) => (
              <Reveal key={collection.slug} delay={index * 60}>
                <CollectionCard collection={collection} index={index} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- featured pieces ---------------- */}
      <section className="section-dark section-pad">
        <div className="lux-container">
          <Reveal>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading
                align="left"
                tone="dark"
                eyebrow="Selected pieces"
                title={
                  <>
                    The pieces everyone <span className="italic gold-text">asks about</span>
                  </>
                }
                description="A small edit from the live collection. Prices and availability live in the online store."
                ornament={false}
              />
              <a
                href={STORE_URL}
                className="group inline-flex items-center gap-2 whitespace-nowrap text-[0.65rem] uppercase tracking-[0.22em] text-[var(--gold-300)]"
              >
                Shop the full collection
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
          </Reveal>

          {featured.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product, index) => (
                <Reveal key={product.id} delay={index * 60}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-10 border border-[rgba(212,175,55,0.3)] p-8 text-center">
              <p className="font-display text-2xl text-[var(--ivory)]">
                The collection is being photographed.
              </p>
              <p className="mt-2 text-sm text-[rgba(255,249,236,0.6)]">
                Visit the store to see the full range, or message us for what&rsquo;s new.
              </p>
              <a href={whatsappHref()} className="btn-outline mt-6" target="_blank" rel="noopener noreferrer">
                Ask on WhatsApp
              </a>
            </div>
          )}

          <p className="mt-10 text-center text-[0.65rem] uppercase tracking-[0.2em] text-[rgba(255,249,236,0.36)]">
            All pieces are gold covering / gold plated — never sold as solid gold.
          </p>
        </div>
      </section>

      {/* ---------------- why us ---------------- */}
      <section className="section-pad bg-[var(--ivory)]">
        <div className="lux-container">
          <Reveal>
            <SectionHeading
              eyebrow="Why our customers return"
              title={
                <>
                  Considered in every <span className="italic gold-text">detail</span>
                </>
              }
              description="No inflated claims. Just a thoughtful store, a fair price and pieces that photograph beautifully."
            />
          </Reveal>

          <div className="mt-12 grid gap-px overflow-hidden border border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.25)] sm:grid-cols-2 lg:grid-cols-3">
            {TRUST_POINTS.map((point, index) => {
              const Icon = icons[point.icon as keyof typeof icons] ?? Sparkles;
              return (
                <Reveal key={point.title} delay={index * 50} className="h-full bg-[#fffdf7]">
                  <div className="flex h-full flex-col p-7 sm:p-8">
                    <Icon size={22} className="text-[var(--gold-700)]" aria-hidden="true" />
                    <h3 className="mt-5 font-display text-2xl text-[var(--ink)]">{point.title}</h3>
                    <p className="mt-2 text-sm font-light leading-relaxed text-[rgba(14,11,7,0.62)]">
                      {point.body}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- care guide ---------------- */}
      <section className="section-dark section-pad">
        <div className="lux-container grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="relative">
            <div className="relative aspect-[5/6] overflow-hidden border border-[rgba(212,175,55,0.3)]">
              <Image
                src="/images/jewel-9.jpg"
                alt="Gold-covering jewellery catching warm light"
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(14,11,7,0.55)] to-transparent" />
            </div>
            <div className="absolute -right-3 -top-3 h-24 w-24 border-r border-t border-[rgba(212,175,55,0.6)]" aria-hidden="true" />
          </Reveal>

          <Reveal delay={100}>
            <p className="eyebrow text-[var(--gold-300)]">Keep the glow</p>
            <h2 className="display-lg mt-4 text-[var(--ivory)]">
              A little care, a <span className="italic gold-text">longer shine.</span>
            </h2>
            <p className="mt-5 text-[0.95rem] font-light leading-relaxed text-[rgba(255,249,236,0.66)]">
              Gold-covering finishes are delicate by nature. These small habits keep your
              pieces looking their best, wear after wear.
            </p>
            <ol className="mt-8 space-y-4">
              {CARE_TIPS.map((tip, index) => (
                <li key={tip} className="flex gap-4">
                  <span className="font-accent text-[0.65rem] tracking-[0.15em] text-[var(--gold-500)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm font-light leading-relaxed text-[rgba(255,249,236,0.72)]">
                    {tip}
                  </p>
                </li>
              ))}
            </ol>
            <Link href="/policies/returns" className="btn-outline mt-9">
              Read care &amp; returns <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------------- story ---------------- */}
      <section className="section-pad bg-[var(--blush)]">
        <div className="lux-container grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <p className="eyebrow">Our story</p>
            <h2 className="display-lg mt-4 max-w-xl text-[var(--ink)]">
              Built on a simple idea: <span className="italic gold-text">dress the moment.</span>
            </h2>
            <p className="mt-6 max-w-xl text-[0.95rem] font-light leading-[1.85] text-[rgba(14,11,7,0.68)]">
              Uma Fashions began with the belief that a wedding, a festival or a first day at work
              deserves something beautiful — without the weight of solid-gold pricing. Our
              collection is chosen piece by piece, with an eye for finish, comfort and how it
              will look in photographs.
            </p>
            <p className="mt-4 max-w-xl text-[0.95rem] font-light leading-[1.85] text-[rgba(14,11,7,0.68)]">
              Come in, try a few things, take your time. There is no pressure here — only a
              store that wants you to leave with the right piece.
            </p>
            <p className="mt-8 font-display text-2xl italic text-[var(--gold-900)]">
              {BRAND.owner.name}
            </p>
            <p className="text-[0.6rem] uppercase tracking-[0.25em] text-[rgba(14,11,7,0.5)]">
              {BRAND.owner.role}, {BRAND.name}
            </p>
            <Link href="/about" className="btn-outline-ink mt-8">
              Our story <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </Reveal>

          <Reveal delay={100}>
            <div className="relative aspect-[4/5] overflow-hidden border border-[rgba(122,90,18,0.25)]">
              <Image
                src="/images/jewel-4.jpg"
                alt="A layered gold-tone necklace displayed on a neutral background"
                fill
                sizes="(max-width: 1024px) 90vw, 40vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- gallery preview ---------------- */}
      <section className="section-pad bg-[var(--ivory)]">
        <div className="lux-container">
          <Reveal>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading
                align="left"
                eyebrow="The lookbook"
                title={
                  <>
                    Seen in <span className="italic gold-text">the light</span>
                  </>
                }
                description="Real pieces from the store, styled for the season."
                ornament={false}
              />
              <Link
                href="/gallery"
                className="group inline-flex items-center gap-2 whitespace-nowrap text-[0.65rem] uppercase tracking-[0.22em] text-[var(--gold-900)]"
              >
                Open the lookbook
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {gallery.map((image, index) => (
              <Reveal
                key={image.id}
                delay={index * 50}
                className={index === 0 ? "col-span-2 row-span-2" : ""}
              >
                <Link
                  href="/gallery"
                  className="group relative block h-full overflow-hidden bg-[var(--blush)]"
                  aria-label={`View the lookbook: ${image.caption ?? image.alt}`}
                >
                  <div className={index === 0 ? "aspect-[4/3] sm:aspect-square" : "aspect-square"}>
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      sizes={index === 0 ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 30vw"}
                      className="object-cover transition-transform duration-[1.4s] group-hover:scale-105"
                    />
                  </div>
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(14,11,7,0.72)] to-transparent px-4 py-3 text-[0.62rem] uppercase tracking-[0.2em] text-[var(--ivory)] opacity-0 transition-opacity group-hover:opacity-100">
                    {image.caption}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- testimonials ---------------- */}
      <section className="section-pad border-y border-[rgba(212,175,55,0.2)] bg-[#fffdf7]">
        <div className="lux-container">
          <Reveal>
            <SectionHeading
              eyebrow="Kind words"
              title={
                <>
                  From our <span className="italic gold-text">customers</span>
                </>
              }
              description="A few notes from people who found their piece with us."
            />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Reveal key={testimonial.id} delay={index * 80}>
                <TestimonialCard testimonial={testimonial} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- visit + enquiry ---------------- */}
      <section className="section-dark section-pad" id="contact">
        <div className="lux-container grid gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <p className="eyebrow text-[var(--gold-300)]">Come and see</p>
            <h2 className="display-lg mt-4 text-[var(--ivory)]">
              Visit the store, or <span className="italic gold-text">say hello.</span>
            </h2>
            <p className="mt-5 max-w-md text-[0.95rem] font-light leading-relaxed text-[rgba(255,249,236,0.66)]">
              Try pieces in person, discuss a bridal set, or ask us to keep something aside.
              We are happy to help you plan the whole look.
            </p>

            <dl className="mt-8 space-y-5 text-sm">
              <div className="flex gap-4">
                <MapPin size={17} className="mt-1 shrink-0 text-[var(--gold-500)]" aria-hidden="true" />
                <div>
                  <dt className="text-[0.6rem] uppercase tracking-[0.22em] text-[var(--gold-300)]">
                    Address
                  </dt>
                  <dd className="mt-1 font-light leading-relaxed text-[rgba(255,249,236,0.78)]">
                    {fullAddress()}
                  </dd>
                  <dd className="mt-2">
                    <a
                      href={mapsSearchUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[0.62rem] uppercase tracking-[0.18em] text-[var(--gold-300)] underline decoration-[rgba(212,175,55,0.4)] underline-offset-4"
                    >
                      Get directions ↗
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-4">
                <Phone size={17} className="mt-1 shrink-0 text-[var(--gold-500)]" aria-hidden="true" />
                <div>
                  <dt className="text-[0.6rem] uppercase tracking-[0.22em] text-[var(--gold-300)]">
                    Phone
                  </dt>
                  <dd className="mt-1 font-light text-[rgba(255,249,236,0.78)]">
                    <a href={telHref()} className="hover:text-[var(--gold-100)]">
                      {BRAND.contact.phone}
                    </a>
                  </dd>
                </div>
              </div>
              <div>
                <dt className="text-[0.6rem] uppercase tracking-[0.22em] text-[var(--gold-300)]">
                  Opening hours
                </dt>
                {BRAND.contact.hours.map((entry) => (
                  <dd key={entry.days} className="mt-1 font-light text-[rgba(255,249,236,0.78)]">
                    {entry.days} · {entry.time}
                  </dd>
                ))}
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={whatsappHref()} target="_blank" rel="noopener noreferrer" className="btn-outline">
                <MessageCircle size={15} aria-hidden="true" /> WhatsApp
              </a>
              <a href={telHref()} className="btn-gold">
                <Phone size={14} aria-hidden="true" /> Call the store
              </a>
            </div>

            <div className="mt-8 overflow-hidden border border-[rgba(212,175,55,0.25)]">
              <iframe
                title={`Map showing ${BRAND.name}`}
                src={mapsEmbedUrl()}
                width="100%"
                height="240"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale-[35%] contrast-[0.9]"
              />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="border border-[rgba(212,175,55,0.35)] bg-[var(--ivory)] p-6 sm:p-8">
              <p className="eyebrow">Enquiry</p>
              <h3 className="mt-3 font-display text-3xl text-[var(--ink)]">
                Tell us what you&rsquo;re looking for
              </h3>
              <p className="mt-2 mb-6 text-sm font-light leading-relaxed text-[rgba(14,11,7,0.6)]">
                Share an occasion or a budget and we&rsquo;ll suggest a few pieces. No obligation.
              </p>
              <EnquiryForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
