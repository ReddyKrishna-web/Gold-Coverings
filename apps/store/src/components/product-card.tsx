import Image from "next/image";
import Link from "next/link";
import { discountPercent, formatINR } from "@uma/brand";
import type { ProductCardData } from "@/lib/catalog";
import { totalStock } from "@/lib/catalog";

export function StoreProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const image = product.images[0];
  const hoverImage = product.images[1];
  const off = discountPercent(product.pricePaise, product.mrpPaise);
  const stock = totalStock(product);
  const lowStock = stock > 0 && stock <= product.lowStockThreshold;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="product-tile group block"
      aria-label={`${product.name} — ${formatINR(product.pricePaise)}`}
    >
      <div className="tile-image relative aspect-[3/4] overflow-hidden border border-[rgba(122,90,18,0.12)] bg-[var(--blush)]">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
            priority={priority}
            className={`object-cover ${hoverImage ? "transition-opacity duration-500 group-hover:opacity-0" : ""}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-[rgba(14,11,7,0.4)]">
            Photograph coming soon
          </div>
        )}
        {hoverImage ? (
          <Image
            src={hoverImage.url}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        ) : null}

        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {product.isBestseller ? (
            <span className="bg-[var(--ink)] px-2 py-1 text-[0.5rem] uppercase tracking-[0.16em] text-[var(--gold-300)]">
              Bestseller
            </span>
          ) : null}
          {off ? (
            <span className="bg-[var(--gold-300)] px-2 py-1 text-[0.5rem] uppercase tracking-[0.16em] text-[var(--ink)]">
              {off}% off
            </span>
          ) : null}
        </div>

        {stock === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(255,249,236,0.78)]">
            <span className="border border-[rgba(14,11,7,0.25)] bg-[var(--ivory)] px-3 py-1.5 text-[0.55rem] uppercase tracking-[0.2em]">
              Sold out
            </span>
          </div>
        ) : null}

        <span className="absolute inset-x-2 bottom-2 translate-y-2 bg-[rgba(14,11,7,0.88)] py-2 text-center text-[0.55rem] uppercase tracking-[0.2em] text-[var(--gold-100)] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          View details
        </span>
      </div>

      <div className="mt-3">
        <p className="text-[0.52rem] uppercase tracking-[0.18em] text-[var(--gold-700)]">
          {product.category.name}
        </p>
        <h3 className="mt-1 font-display text-lg leading-snug text-[var(--ink)]">{product.name}</h3>
        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-medium text-[var(--ink)]">{formatINR(product.pricePaise)}</span>
          {product.mrpPaise && product.mrpPaise > product.pricePaise ? (
            <span className="text-xs text-[rgba(14,11,7,0.4)] line-through">
              {formatINR(product.mrpPaise)}
            </span>
          ) : null}
        </div>
        {lowStock ? (
          <p className="mt-1 text-[0.6rem] uppercase tracking-[0.12em] text-[var(--maroon)]">
            Only {stock} left
          </p>
        ) : null}
      </div>
    </Link>
  );
}
