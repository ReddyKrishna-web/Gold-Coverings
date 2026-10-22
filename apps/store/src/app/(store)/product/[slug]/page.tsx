import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import {
  BRAND,
  STORE_URL,
  WEBSITE_URL,
  discountPercent,
  formatINR,
  whatsappHref,
} from "@uma/brand";
import { Stars } from "@uma/ui";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchase } from "@/components/product-purchase";
import { StoreProductCard } from "@/components/product-card";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { getCurrentUser } from "@/lib/auth";
import { getStoreSettings } from "@/lib/settings";
import { submitReviewAction } from "@/app/actions/reviews";

export const dynamic = "force-dynamic";

type Props = {
  params: { slug: string };
  searchParams: { review?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Piece not found" };

  return {
    title: product.name,
    description: product.description.slice(0, 155),
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.name} — ${BRAND.name}`,
      description: product.description.slice(0, 155),
      images: product.images[0] ? [{ url: product.images[0].url, alt: product.images[0].alt }] : [],
      type: "website",
    },
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const [related, settings, user] = await Promise.all([
    getRelatedProducts(product.categoryId, product.id, 4),
    getStoreSettings(),
    getCurrentUser(),
  ]);

  const off = discountPercent(product.pricePaise, product.mrpPaise);
  const stock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  const reviewCount = product.reviews.length;
  const averageRating =
    reviewCount > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku ?? product.variants[0]?.sku,
    brand: { "@type": "Brand", name: BRAND.name },
    image: product.images.map((image) => `${STORE_URL}${image.url}`),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: (product.pricePaise / 100).toFixed(2),
      availability:
        stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${STORE_URL}/product/${product.slug}`,
      seller: { "@type": "Organization", name: BRAND.name },
    },
    ...(reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: averageRating.toFixed(1),
            reviewCount,
          },
        }
      : {}),
  };

  const notice =
    searchParams.review === "pending"
      ? { tone: "success", text: "Thank you — your review is with the store for a quick check." }
      : searchParams.review === "invalid"
        ? { tone: "error", text: "Please complete the review fields and try again." }
        : searchParams.review === "slow"
          ? { tone: "error", text: "A few too many reviews just now. Please try again a little later." }
          : null;

  return (
    <>
      <div className="border-b border-[rgba(122,90,18,0.12)] bg-[#fffdf7]">
        <div className="lux-container flex items-center gap-2 py-3 text-[0.58rem] uppercase tracking-[0.14em] text-[rgba(14,11,7,0.45)]">
          <Link href="/" className="hover:text-[var(--gold-900)]">
            Store
          </Link>
          <ChevronRight size={11} aria-hidden="true" />
          <Link href={`/shop?category=${product.category.slug}`} className="hover:text-[var(--gold-900)]">
            {product.category.name}
          </Link>
          <ChevronRight size={11} aria-hidden="true" />
          <span className="truncate text-[var(--gold-900)]">{product.name}</span>
        </div>
      </div>

      <section className="lux-container grid gap-10 py-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} name={product.name} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          <Link
            href={`/shop?category=${product.category.slug}`}
            className="text-[0.58rem] uppercase tracking-[0.2em] text-[var(--gold-700)] hover:underline"
          >
            {product.category.name}
          </Link>
          <h1 className="mt-2 font-display text-4xl leading-tight text-[var(--ink)] sm:text-5xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {reviewCount > 0 ? (
              <>
                <Stars rating={averageRating} />
                <a href="#reviews" className="text-xs text-[rgba(14,11,7,0.55)] underline underline-offset-2">
                  {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                </a>
              </>
            ) : (
              <a href="#reviews" className="text-xs text-[rgba(14,11,7,0.5)] underline underline-offset-2">
                Be the first to review
              </a>
            )}
            {off ? (
              <span className="bg-[var(--gold-300)] px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.12em]">
                {off}% off
              </span>
            ) : null}
          </div>

          <p className="mt-5 text-sm font-light leading-relaxed text-[rgba(14,11,7,0.68)]">
            {product.description}
          </p>

          <div className="mt-6">
            <ProductPurchase
              productName={product.name}
              variants={product.variants.map((variant) => ({
                id: variant.id,
                sku: variant.sku,
                size: variant.size,
                finish: variant.finish,
                pricePaise: variant.pricePaise,
                stock: variant.stock,
              }))}
              pricePaise={product.pricePaise}
              mrpPaise={product.mrpPaise}
            />
          </div>

          <div className="mt-7 grid gap-3 border-y border-[rgba(122,90,18,0.16)] py-5 sm:grid-cols-3">
            <div className="flex items-start gap-2.5">
              <Truck size={16} className="mt-0.5 text-[var(--gold-700)]" aria-hidden="true" />
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.12em] text-[var(--ink)]">Delivery</p>
                <p className="mt-0.5 text-[0.68rem] leading-relaxed text-[rgba(14,11,7,0.55)]">
                  Free above {formatINR(settings.freeShippingAbovePaise)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={16} className="mt-0.5 text-[var(--gold-700)]" aria-hidden="true" />
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.12em] text-[var(--ink)]">Payment</p>
                <p className="mt-0.5 text-[0.68rem] leading-relaxed text-[rgba(14,11,7,0.55)]">
                  Razorpay{settings.codEnabled ? " · COD available" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <PackageCheck size={16} className="mt-0.5 text-[var(--gold-700)]" aria-hidden="true" />
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.12em] text-[var(--ink)]">Exchange</p>
                <p className="mt-0.5 text-[0.68rem] leading-relaxed text-[rgba(14,11,7,0.55)]">
                  {settings.returnWindowDays}-day window
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-1">
            <details className="group border-b border-[rgba(122,90,18,0.12)] py-3" open>
              <summary className="cursor-pointer list-none font-accent text-[0.65rem] uppercase tracking-[0.2em] text-[var(--ink)]">
                Materials &amp; care
              </summary>
              <p className="mt-2 text-xs font-light leading-relaxed text-[rgba(14,11,7,0.6)]">
                {product.careInfo ??
                  "Gold-covering (gold-plated) finish over a base metal. Keep away from perfume and water; wipe with a soft dry cloth and store separately."}
              </p>
              <p className="mt-2 text-xs font-light leading-relaxed text-[rgba(14,11,7,0.6)]">
                This is not solid gold. We do not claim purity or hallmarking.
              </p>
            </details>
            <details className="group border-b border-[rgba(122,90,18,0.12)] py-3">
              <summary className="cursor-pointer list-none font-accent text-[0.65rem] uppercase tracking-[0.2em] text-[var(--ink)]">
                Delivery &amp; returns
              </summary>
              <p className="mt-2 text-xs font-light leading-relaxed text-[rgba(14,11,7,0.6)]">
                In-stock pieces are packed within 1–3 working days and delivered across India.
                Unworn pieces with tags can be exchanged within {settings.returnWindowDays} days.
                Custom and bridal orders are not returnable unless damaged or incorrect.
              </p>
              <a
                href={`${WEBSITE_URL}/policies/returns`}
                className="mt-2 inline-block text-[0.6rem] uppercase tracking-[0.14em] text-[var(--gold-900)] underline decoration-[var(--gold-500)] underline-offset-4"
              >
                Full returns policy ↗
              </a>
            </details>
          </div>

          <a
            href={whatsappHref(`Hello Krishna Jewellers, I have a question about the ${product.name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.16em] text-[var(--gold-900)] hover:underline"
          >
            <MessageCircle size={14} aria-hidden="true" /> Ask about this piece
          </a>
        </div>
      </section>

      {/* reviews */}
      <section id="reviews" className="border-t border-[rgba(122,90,18,0.14)] bg-[#fffdf7] py-14">
        <div className="lux-container">
          <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
            <div>
              <p className="eyebrow">Reviews</p>
              <h2 className="display-md mt-2 text-[var(--ink)]">
                What customers are saying
              </h2>

              {notice ? (
                <p
                  role="status"
                  className={`mt-4 border px-4 py-3 text-sm ${
                    notice.tone === "success"
                      ? "border-[rgba(46,125,50,0.3)] bg-[#eef7ee] text-[var(--success)]"
                      : "border-[rgba(179,38,30,0.3)] bg-[#fdf2f1] text-[var(--error)]"
                  }`}
                >
                  {notice.text}
                </p>
              ) : null}

              {product.reviews.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {product.reviews.map((review) => (
                    <article key={review.id} className="border border-[rgba(122,90,18,0.14)] bg-[#fffdf8] p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Stars rating={review.rating} />
                        <span className="text-[0.6rem] uppercase tracking-[0.12em] text-[rgba(14,11,7,0.4)]">
                          {review.createdAt.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                        </span>
                      </div>
                      {review.title ? (
                        <h3 className="mt-2 font-display text-xl text-[var(--ink)]">{review.title}</h3>
                      ) : null}
                      <p className="mt-1 text-sm font-light leading-relaxed text-[rgba(14,11,7,0.65)]">
                        {review.body}
                      </p>
                      <p className="mt-3 text-[0.6rem] uppercase tracking-[0.14em] text-[var(--gold-700)]">
                        {review.name}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-sm font-light text-[rgba(14,11,7,0.55)]">
                  No published reviews yet. If you own this piece, we would love to hear how it
                  wears.
                </p>
              )}
            </div>

            <div className="border border-[rgba(122,90,18,0.18)] bg-[var(--ivory)] p-6">
              <h3 className="font-display text-2xl text-[var(--ink)]">Write a review</h3>
              <p className="mt-1 text-xs font-light leading-relaxed text-[rgba(14,11,7,0.55)]">
                Reviews are checked before they appear. Please keep it honest and useful.
              </p>
              <form action={submitReviewAction} className="mt-5 space-y-3">
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="slug" value={product.slug} />
                <div>
                  <label htmlFor="review-name" className="field-label">
                    Name
                  </label>
                  <input
                    id="review-name"
                    name="name"
                    required
                    defaultValue={user?.name ?? ""}
                    minLength={2}
                    maxLength={60}
                    className="field py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-[7rem_1fr] gap-3">
                  <div>
                    <label htmlFor="review-rating" className="field-label">
                      Rating
                    </label>
                    <select id="review-rating" name="rating" required defaultValue="5" className="field py-2 text-sm">
                      <option value="5">5 stars</option>
                      <option value="4">4 stars</option>
                      <option value="3">3 stars</option>
                      <option value="2">2 stars</option>
                      <option value="1">1 star</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="review-title" className="field-label">
                      Title (optional)
                    </label>
                    <input id="review-title" name="title" maxLength={100} className="field py-2 text-sm" />
                  </div>
                </div>
                <div>
                  <label htmlFor="review-body" className="field-label">
                    Your review
                  </label>
                  <textarea
                    id="review-body"
                    name="body"
                    required
                    minLength={10}
                    maxLength={800}
                    rows={4}
                    className="field resize-none py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="review-email" className="field-label">
                    Email (optional, not published)
                  </label>
                  <input
                    id="review-email"
                    name="email"
                    type="email"
                    defaultValue={user?.email ?? ""}
                    className="field py-2 text-sm"
                  />
                </div>
                <button type="submit" className="btn-outline-ink w-full py-3">
                  Submit review
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="lux-container py-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">You may also like</p>
              <h2 className="display-md mt-2 text-[var(--ink)]">From the same collection</h2>
            </div>
            <Link
              href={`/shop?category=${product.category.slug}`}
              className="text-[0.6rem] uppercase tracking-[0.16em] text-[var(--gold-900)] hover:underline"
            >
              See all
            </Link>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
            {related.map((item) => (
              <StoreProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="lux-container pb-4">
        <div className="flex items-center gap-4">
          <Image src="/images/jewel-3.jpg" alt="" width={64} height={64} className="h-16 w-16 object-cover" aria-hidden="true" />
          <p className="text-xs font-light leading-relaxed text-[rgba(14,11,7,0.5)]">
            Photographs are of the actual collection; screens can vary slightly. Need a closer
            look? <a href={`${WEBSITE_URL}/contact`} className="underline decoration-[var(--gold-500)] underline-offset-2">Book a store visit</a>.
          </p>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
