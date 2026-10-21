import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, MessageCircle } from "lucide-react";
import { CATEGORIES, STORE_URL, whatsappHref } from "@uma/brand";
import { Reveal } from "@uma/ui";
import { ProductCard } from "@/components/cards";
import { getCollections, getProductsForCollection } from "@/lib/content";

export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const collections = await getCollections();
  const collection = collections.find((entry) => entry.slug === params.slug);
  if (!collection) return { title: "Collection not found" };

  return {
    title: collection.name,
    description: collection.description,
    alternates: { canonical: `/collections/${collection.slug}` },
    openGraph: {
      title: `${collection.name} · Uma Fashions`,
      description: collection.description,
      images: [{ url: collection.image, alt: collection.imageAlt }],
    },
  };
}

export default async function CollectionPage({ params }: Params) {
  const [collections, products] = await Promise.all([
    getCollections(),
    getProductsForCollection(params.slug),
  ]);

  const collection =
    collections.find((entry) => entry.slug === params.slug) ??
    CATEGORIES.find((entry) => entry.slug === params.slug);

  if (!collection) notFound();

  return (
    <>
      <section className="section-dark relative overflow-hidden pb-16 pt-32">
        <div className="lux-container grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.22em] text-[rgba(255,249,236,0.55)] transition-colors hover:text-[var(--gold-300)]"
            >
              <ArrowLeft size={13} aria-hidden="true" /> All collections
            </Link>
            <p className="eyebrow mt-6 text-[var(--gold-300)]">Collection</p>
            <h1 className="display-lg mt-3 max-w-xl text-[var(--ivory)]">{collection.name}</h1>
            <p className="mt-5 max-w-md text-[0.95rem] font-light leading-relaxed text-[rgba(255,249,236,0.68)]">
              {collection.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`${STORE_URL}/shop?category=${collection.slug}`} className="btn-gold">
                Shop this collection <ArrowUpRight size={14} aria-hidden="true" />
              </a>
              <a
                href={whatsappHref(`Hello Uma Fashions, I'd like to see more from the ${collection.name} collection.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                <MessageCircle size={15} aria-hidden="true" /> Ask for options
              </a>
            </div>
          </div>

          <div className="relative aspect-[5/4] overflow-hidden border border-[rgba(212,175,55,0.35)] lg:aspect-[4/3]">
            <Image
              src={collection.image}
              alt={collection.imageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(14,11,7,0.4)] to-transparent" />
          </div>
        </div>
      </section>

      <section className="section-pad bg-[var(--ivory)]">
        <div className="lux-container">
          {products.length > 0 ? (
            <>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">In this collection</p>
                  <h2 className="display-md mt-3 text-[var(--ink)]">
                    {products.length} {products.length === 1 ? "piece" : "pieces"} to see
                  </h2>
                </div>
                <p className="max-w-xs text-xs font-light leading-relaxed text-[rgba(14,11,7,0.5)]">
                  Tap any piece to open it in the online store, where live prices and stock are shown.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product, index) => (
                  <Reveal key={product.id} delay={index * 50}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>
            </>
          ) : (
            <div className="mx-auto max-w-xl border border-[rgba(212,175,55,0.3)] bg-[#fffdf7] p-10 text-center">
              <p className="eyebrow">Photographs on the way</p>
              <h2 className="display-md mt-3 text-[var(--ink)]">
                This edit is being prepared.
              </h2>
              <p className="mt-3 text-sm font-light leading-relaxed text-[rgba(14,11,7,0.62)]">
                Message the store for current designs, sizes and prices in {collection.name.toLowerCase()}.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <a
                  href={whatsappHref(`Hello Uma Fashions, please share the latest ${collection.name} designs.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold"
                >
                  WhatsApp the store
                </a>
                <Link href="/contact" className="btn-outline-ink">
                  Send an enquiry
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="pb-20">
        <div className="lux-container">
          <div className="gold-rule" />
          <div className="mt-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-sm font-light text-[rgba(14,11,7,0.6)]">
              Looking for a coordinated set or a custom colour?
            </p>
            <Link href="/contact" className="btn-outline-ink">
              Talk to us <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
