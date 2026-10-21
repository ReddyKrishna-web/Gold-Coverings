import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Quote } from "lucide-react";
import { STORE_URL, discountPercent, formatINR } from "@uma/brand";
import { Stars } from "@uma/ui";
import type { FeaturedProduct, Testimonial, WebsiteCollection } from "@/lib/content";

export function CollectionCard({
  collection,
  index = 0,
}: {
  collection: WebsiteCollection;
  index?: number;
}) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="card-collection group relative block aspect-[4/5] overflow-hidden bg-[var(--charcoal)]"
    >
      <Image
        src={collection.image}
        alt={collection.imageAlt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover opacity-90 transition-opacity duration-700 group-hover:opacity-100"
        priority={index < 2}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(14,11,7,0.92)] via-[rgba(14,11,7,0.25)] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        {typeof collection.productCount === "number" ? (
          <p className="text-[0.55rem] uppercase tracking-[0.25em] text-[var(--gold-300)]">
            {collection.productCount} {collection.productCount === 1 ? "piece" : "pieces"}
          </p>
        ) : null}
        <h3 className="mt-2 font-display text-2xl leading-tight text-[var(--ivory)] sm:text-[1.7rem]">
          {collection.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs font-light leading-relaxed text-[rgba(255,249,236,0.62)]">
          {collection.description}
        </p>
        <span className="collection-cta mt-4 inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.24em] text-[var(--gold-300)]">
          Explore <ArrowUpRight size={13} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export function ProductCard({ product }: { product: FeaturedProduct }) {
  const off = discountPercent(product.pricePaise, product.mrpPaise);

  return (
    <a
      href={`${STORE_URL}/product/${product.slug}`}
      className="group block"
      aria-label={`${product.name} — shop this piece in the online store`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--blush)]">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        {off ? (
          <span className="absolute left-3 top-3 bg-[var(--ink)] px-2.5 py-1 text-[0.55rem] uppercase tracking-[0.18em] text-[var(--gold-300)]">
            {off}% off
          </span>
        ) : null}
        <span className="absolute inset-x-3 bottom-3 translate-y-2 bg-[rgba(14,11,7,0.86)] px-3 py-2.5 text-center text-[0.58rem] uppercase tracking-[0.22em] text-[var(--gold-100)] opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          Shop this piece ↗
        </span>
      </div>
      <div className="mt-3.5">
        <p className="text-[0.55rem] uppercase tracking-[0.22em] text-[var(--gold-700)]">
          {product.categoryName}
        </p>
        <h3 className="mt-1.5 font-display text-xl leading-snug text-[var(--ink)]">{product.name}</h3>
        <p className="mt-1 flex items-baseline gap-2 text-sm text-[rgba(14,11,7,0.75)]">
          <span>{formatINR(product.pricePaise)}</span>
          {product.mrpPaise && product.mrpPaise > product.pricePaise ? (
            <span className="text-xs text-[rgba(14,11,7,0.4)] line-through">
              {formatINR(product.mrpPaise)}
            </span>
          ) : null}
        </p>
      </div>
    </a>
  );
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="card-lux flex h-full flex-col p-7 sm:p-8">
      <Quote size={26} className="text-[var(--gold-500)]" aria-hidden="true" />
      <Stars rating={testimonial.rating} className="mt-4" />
      {testimonial.title ? (
        <figcaption className="mt-4 font-display text-xl text-[var(--ink)]">
          {testimonial.title}
        </figcaption>
      ) : null}
      <blockquote className="mt-3 flex-1 text-sm font-light leading-relaxed text-[rgba(14,11,7,0.66)]">
        “{testimonial.body}”
      </blockquote>
      <p className="mt-6 text-[0.6rem] uppercase tracking-[0.24em] text-[var(--gold-700)]">
        {testimonial.name}
      </p>
    </figure>
  );
}
