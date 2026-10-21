import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { BRAND, formatINR, whatsappHref } from "@uma/brand";
import { Reveal } from "@uma/ui";
import { StoreProductCard } from "@/components/product-card";
import { MobileFilterSummary, SortSelect } from "@/components/shop-controls";
import { getNavCategories, getShopProducts, type ShopQuery } from "@/lib/catalog";
import { getStoreSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop All Jewellery",
  description:
    "Browse all gold-covering jewellery: earrings, nose pins, bangles, necklaces, bridal sets, rings, anklets and hair accessories.",
  alternates: { canonical: "/shop" },
};

type SearchParams = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const query: ShopQuery = {
    q: one(searchParams.q),
    category: one(searchParams.category),
    sort: one(searchParams.sort),
    min: one(searchParams.min),
    max: one(searchParams.max),
    inStock: one(searchParams.inStock),
    page: one(searchParams.page),
  };

  const [{ products, total, page, pageCount }, categories, settings] = await Promise.all([
    getShopProducts(query),
    getNavCategories(),
    getStoreSettings(),
  ]);

  const activeCategory = categories.find((category) => category.slug === query.category);
  const activeFilters = [query.q, query.category, query.min, query.max, query.inStock].filter(Boolean)
    .length;

  const hrefWith = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { ...query, ...overrides };
    Object.entries(merged).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  return (
    <>
      <section className="border-b border-[rgba(122,90,18,0.14)] bg-[#fffdf7] pb-8 pt-10">
        <div className="lux-container">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.16em] text-[rgba(14,11,7,0.45)]">
            <Link href="/" className="hover:text-[var(--gold-900)]">
              Store
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[var(--gold-900)]">{activeCategory?.name ?? "All jewellery"}</span>
          </nav>

          <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="display-lg text-[var(--ink)]">
                {activeCategory?.name ?? (query.q ? `Results for “${query.q}”` : "The full collection")}
              </h1>
              <p className="mt-2 max-w-xl text-sm font-light leading-relaxed text-[rgba(14,11,7,0.6)]">
                {activeCategory?.description ??
                  "Every piece is gold covering / gold plated. Live prices and stock, delivered across India."}
              </p>
              <p className="mt-3 text-[0.6rem] uppercase tracking-[0.18em] text-[rgba(14,11,7,0.45)]">
                {total} {total === 1 ? "piece" : "pieces"} found
              </p>
            </div>

            <div className="flex items-center gap-3">
              <SortSelect value={query.sort ?? "new"} />
            </div>
          </div>
        </div>
      </section>

      <section className="lux-container py-10">
        <div className="grid gap-10 lg:grid-cols-[15rem_1fr]">
          <aside>
            <details open className="group">
              <MobileFilterSummary count={activeFilters} />
              <div className="mt-4 space-y-7 lg:mt-0">
                <form action="/shop" method="get" className="space-y-6">
                  {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
                  {query.sort ? <input type="hidden" name="sort" value={query.sort} /> : null}

                  <div>
                    <label htmlFor="shop-search" className="admin-label">
                      Search
                    </label>
                    <div className="flex">
                      <input
                        id="shop-search"
                        name="q"
                        type="search"
                        defaultValue={query.q ?? ""}
                        placeholder="Jhumka, bangle, bridal…"
                        className="admin-input"
                      />
                      <button
                        type="submit"
                        aria-label="Apply search"
                        className="flex items-center justify-center border border-l-0 border-[rgba(122,90,18,0.24)] px-3 text-[var(--gold-900)]"
                      >
                        <Search size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <fieldset>
                    <legend className="admin-label">Collection</legend>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 text-sm font-light text-[rgba(14,11,7,0.72)]">
                        <input
                          type="radio"
                          name="category"
                          value=""
                          defaultChecked={!query.category}
                          className="accent-[var(--gold-700)]"
                        />
                        All collections
                      </label>
                      {categories.map((category) => (
                        <label
                          key={category.id}
                          className="flex items-center gap-2 text-sm font-light text-[rgba(14,11,7,0.72)]"
                        >
                          <input
                            type="radio"
                            name="category"
                            value={category.slug}
                            defaultChecked={query.category === category.slug}
                            className="accent-[var(--gold-700)]"
                          />
                          {category.name}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div>
                    <span className="admin-label">Price (₹)</span>
                    <div className="flex items-center gap-2">
                      <input
                        name="min"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        placeholder="Min"
                        defaultValue={query.min ?? ""}
                        className="admin-input"
                        aria-label="Minimum price in rupees"
                      />
                      <span className="text-[rgba(14,11,7,0.4)]">–</span>
                      <input
                        name="max"
                        type="number"
                        inputMode="numeric"
                        min={0}
                        placeholder="Max"
                        defaultValue={query.max ?? ""}
                        className="admin-input"
                        aria-label="Maximum price in rupees"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm font-light text-[rgba(14,11,7,0.72)]">
                    <input
                      type="checkbox"
                      name="inStock"
                      value="1"
                      defaultChecked={query.inStock === "1"}
                      className="accent-[var(--gold-700)]"
                    />
                    In stock only
                  </label>

                  <button type="submit" className="btn-dark w-full py-3">
                    Apply filters
                  </button>
                  {activeFilters > 0 ? (
                    <Link
                      href="/shop"
                      className="flex items-center justify-center gap-1 text-[0.62rem] uppercase tracking-[0.16em] text-[rgba(14,11,7,0.55)] hover:text-[var(--gold-900)]"
                    >
                      <X size={12} aria-hidden="true" /> Clear all
                    </Link>
                  ) : null}
                </form>

                <div className="border-t border-[rgba(122,90,18,0.14)] pt-5">
                  <p className="text-[0.6rem] uppercase tracking-[0.16em] text-[var(--gold-900)]">
                    Need a hand?
                  </p>
                  <p className="mt-2 text-xs font-light leading-relaxed text-[rgba(14,11,7,0.6)]">
                    Sizing, styling or a custom order — message the store and we&apos;ll help.
                  </p>
                  <a
                    href={whatsappHref()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex text-[0.62rem] uppercase tracking-[0.16em] text-[var(--gold-900)] underline decoration-[var(--gold-500)] underline-offset-4"
                  >
                    WhatsApp us
                  </a>
                </div>
              </div>
            </details>
          </aside>

          <div>
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3">
                  {products.map((product, index) => (
                    <Reveal key={product.id} delay={(index % 3) * 40}>
                      <StoreProductCard product={product} priority={index < 3} />
                    </Reveal>
                  ))}
                </div>

                {pageCount > 1 ? (
                  <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-4">
                    {page > 1 ? (
                      <Link
                        href={hrefWith({ page: String(page - 1) })}
                        className="flex items-center gap-1 border border-[rgba(122,90,18,0.24)] px-3 py-2 text-xs uppercase tracking-[0.12em] hover:bg-[rgba(212,175,55,0.1)]"
                      >
                        <ChevronLeft size={14} aria-hidden="true" /> Previous
                      </Link>
                    ) : null}
                    <p className="text-xs text-[rgba(14,11,7,0.55)]">
                      Page {page} of {pageCount}
                    </p>
                    {page < pageCount ? (
                      <Link
                        href={hrefWith({ page: String(page + 1) })}
                        className="flex items-center gap-1 border border-[rgba(122,90,18,0.24)] px-3 py-2 text-xs uppercase tracking-[0.12em] hover:bg-[rgba(212,175,55,0.1)]"
                      >
                        Next <ChevronRight size={14} aria-hidden="true" />
                      </Link>
                    ) : null}
                  </nav>
                ) : null}
              </>
            ) : (
              <div className="border border-[rgba(122,90,18,0.18)] bg-[#fffdf7] p-10 text-center">
                <p className="eyebrow">Nothing here yet</p>
                <h2 className="display-md mt-3 text-[var(--ink)]">No pieces match those filters.</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm font-light leading-relaxed text-[rgba(14,11,7,0.6)]">
                  Try a wider price range or another collection. We can also source something
                  specific — just ask.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link href="/shop" className="btn-outline-ink">
                    Clear filters
                  </Link>
                  <a
                    href={whatsappHref("Hello Uma Fashions, I am looking for a specific piece.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold"
                  >
                    Ask the store
                  </a>
                </div>
              </div>
            )}

            <p className="mt-10 text-center text-[0.62rem] uppercase tracking-[0.16em] text-[rgba(14,11,7,0.38)]">
              {settings.gstPercent > 0
                ? `GST (${settings.gstPercent}%) is added at checkout`
                : "Prices shown without GST — tax is not configured"}{" "}
              · free delivery above {formatINR(settings.freeShippingAbovePaise)} · {BRAND.name}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
