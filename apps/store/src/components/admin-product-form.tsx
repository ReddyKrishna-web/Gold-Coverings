import Link from "next/link";
import type { Category } from "@uma/db";

type VariantValues = {
  id: string;
  sku: string;
  size: string | null;
  finish: string | null;
  stock: number;
  pricePaise: number;
};

type ProductValues = {
  id?: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  careInfo: string | null;
  pricePaise: number;
  mrpPaise: number | null;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  variants: VariantValues[];
};

export function AdminProductForm({
  mode,
  categories,
  product,
  action,
}: {
  mode: "new" | "edit";
  categories: Pick<Category, "id" | "name">[];
  product?: ProductValues;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const isEdit = mode === "edit";
  const firstVariant = product?.variants[0];

  return (
    <form action={action} className="mt-5 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      {isEdit && product ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="space-y-4">
        <section className="admin-card p-4">
          <h2 className="text-sm font-medium">The piece</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="product-name" className="admin-label">
                Name *
              </label>
              <input
                id="product-name"
                name="name"
                required
                minLength={2}
                maxLength={120}
                defaultValue={product?.name ?? ""}
                className="admin-input"
                placeholder="Meenakari Jhumka"
              />
            </div>
            <div>
              <label htmlFor="product-slug" className="admin-label">
                URL slug
              </label>
              <input
                id="product-slug"
                name="slug"
                pattern="[a-z0-9-]+"
                maxLength={80}
                defaultValue={product?.slug ?? ""}
                className="admin-input"
                placeholder="meenakari-jhumka"
              />
              <p className="mt-1 text-[0.58rem] text-[rgba(14,11,7,0.4)]">
                Leave blank to generate from the name.
              </p>
            </div>
            <div>
              <label htmlFor="product-category" className="admin-label">
                Collection *
              </label>
              <select
                id="product-category"
                name="categoryId"
                required
                defaultValue={product?.categoryId ?? ""}
                className="admin-input"
              >
                <option value="">Choose a collection</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="product-description" className="admin-label">
                Description *
              </label>
              <textarea
                id="product-description"
                name="description"
                required
                minLength={20}
                maxLength={4000}
                rows={5}
                defaultValue={product?.description ?? ""}
                className="admin-input resize-none"
                placeholder="Describe the design, finish and occasion. Avoid any claim of solid gold or purity."
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="product-care" className="admin-label">
                Care / material note
              </label>
              <textarea
                id="product-care"
                name="careInfo"
                maxLength={1000}
                rows={2}
                defaultValue={product?.careInfo ?? ""}
                className="admin-input resize-none"
                placeholder="Gold covering / gold plated. Keep away from perfume and water…"
              />
            </div>
          </div>
        </section>

        <section className="admin-card p-4">
          <h2 className="text-sm font-medium">Price &amp; stock</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="product-price" className="admin-label">
                Selling price (₹) *
              </label>
              <input
                id="product-price"
                name="price"
                type="number"
                min={1}
                step="1"
                required
                defaultValue={product ? product.pricePaise / 100 : ""}
                className="admin-input"
              />
            </div>
            <div>
              <label htmlFor="product-mrp" className="admin-label">
                MRP (₹, optional)
              </label>
              <input
                id="product-mrp"
                name="mrp"
                type="number"
                min={0}
                step="1"
                defaultValue={product?.mrpPaise ? product.mrpPaise / 100 : ""}
                className="admin-input"
              />
            </div>
            <div>
              <label htmlFor="product-sku" className="admin-label">
                SKU
              </label>
              <input
                id="product-sku"
                name="sku"
                maxLength={60}
                defaultValue={firstVariant?.sku ?? ""}
                className="admin-input"
                placeholder="UF-EAR-001"
              />
            </div>
          </div>

          {isEdit && product ? (
            <div className="mt-4">
              <p className="admin-label">Variants — stock &amp; price</p>
              <div className="space-y-2">
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="grid grid-cols-[1fr_5rem_7rem] items-end gap-2 border border-[rgba(122,90,18,0.12)] p-2"
                  >
                    <div>
                      <p className="text-[0.55rem] uppercase tracking-[0.08em] text-[rgba(14,11,7,0.4)]">
                        {variant.sku}
                      </p>
                      <p className="text-xs text-[var(--ink)]">
                        {[variant.size, variant.finish].filter(Boolean).join(" · ") || "One size"}
                      </p>
                    </div>
                    <div>
                      <label htmlFor={`stock_${variant.id}`} className="admin-label">
                        Stock
                      </label>
                      <input
                        id={`stock_${variant.id}`}
                        name={`stock_${variant.id}`}
                        type="number"
                        min={0}
                        defaultValue={variant.stock}
                        className="admin-input"
                      />
                    </div>
                    <div>
                      <label htmlFor={`price_${variant.id}`} className="admin-label">
                        Price (₹)
                      </label>
                      <input
                        id={`price_${variant.id}`}
                        name={`price_${variant.id}`}
                        type="number"
                        min={1}
                        defaultValue={variant.pricePaise / 100}
                        className="admin-input"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-1.5 text-[0.58rem] text-[rgba(14,11,7,0.4)]">
                Stock changes are logged as adjustments. To add a new size or finish, contact the
                developer for now.
              </p>
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="product-stock" className="admin-label">
                  Opening stock *
                </label>
                <input
                  id="product-stock"
                  name="stock"
                  type="number"
                  min={0}
                  required
                  defaultValue={0}
                  className="admin-input"
                />
              </div>
              <div>
                <label htmlFor="product-size" className="admin-label">
                  Size / option
                </label>
                <input
                  id="product-size"
                  name="size"
                  maxLength={40}
                  placeholder="One size / 2.6 / Set"
                  className="admin-input"
                />
              </div>
              <div>
                <label htmlFor="product-finish" className="admin-label">
                  Finish
                </label>
                <input
                  id="product-finish"
                  name="finish"
                  maxLength={40}
                  defaultValue="Gold tone"
                  className="admin-input"
                />
              </div>
            </div>
          )}
        </section>

        <section className="admin-card p-4">
          <h2 className="text-sm font-medium">Photography</h2>
          <label htmlFor="product-images" className="admin-label mt-3">
            Image paths — one per line
          </label>
          <textarea
            id="product-images"
            name="images"
            rows={4}
            defaultValue={product?.images.join("\n") ?? ""}
            className="admin-input resize-none font-mono text-[0.7rem]"
            placeholder={"/images/jewel-1.jpg\n/images/jewel-2.jpg"}
          />
          <p className="mt-1.5 text-[0.6rem] leading-relaxed text-[rgba(14,11,7,0.45)]">
            Use <code>/images/…</code> paths for files placed in{" "}
            <code>apps/store/public/images</code>. The first image is the main photo; the second
            shows on hover. Up to 8 images.
          </p>
        </section>
      </div>

      <div className="space-y-4">
        <section className="admin-card p-4">
          <h2 className="text-sm font-medium">Visibility</h2>
          <div className="mt-3 space-y-2.5 text-xs">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={product?.isActive ?? true}
                className="mt-0.5 accent-[var(--gold-700)]"
              />
              <span>
                <span className="block text-[var(--ink)]">Published</span>
                <span className="block text-[0.58rem] text-[rgba(14,11,7,0.45)]">
                  Visible and purchasable in the store.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={product?.isFeatured ?? false}
                className="mt-0.5 accent-[var(--gold-700)]"
              />
              <span>
                <span className="block text-[var(--ink)]">Featured</span>
                <span className="block text-[0.58rem] text-[rgba(14,11,7,0.45)]">
                  Shown on the brand website and store home.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                name="isBestseller"
                defaultChecked={product?.isBestseller ?? false}
                className="mt-0.5 accent-[var(--gold-700)]"
              />
              <span>
                <span className="block text-[var(--ink)]">Bestseller</span>
                <span className="block text-[0.58rem] text-[rgba(14,11,7,0.45)]">
                  Badged as a bestseller in the catalog.
                </span>
              </span>
            </label>
          </div>
        </section>

        <section className="admin-card p-4">
          <button type="submit" className="btn-dark w-full py-3">
            {mode === "new" ? "Create product" : "Save changes"}
          </button>
          <Link
            href="/admin/products"
            className="mt-2 block w-full border border-[rgba(122,90,18,0.24)] py-2.5 text-center text-[0.62rem] uppercase tracking-[0.12em] text-[rgba(14,11,7,0.6)] hover:bg-[rgba(212,175,55,0.08)]"
          >
            Back to products
          </Link>
          <p className="mt-3 text-[0.58rem] leading-relaxed text-[rgba(14,11,7,0.4)]">
            All changes are logged in the audit trail. Prices are stored in paise on the server.
          </p>
        </section>
      </div>
    </form>
  );
}
