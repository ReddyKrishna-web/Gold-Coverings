import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatINR } from "@uma/brand";
import { prisma } from "@uma/db";
import { toggleProductAction } from "@/app/actions/admin";
import { AdminEmpty, AdminNotice, AdminPageHeader } from "@/components/admin-ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; error?: string; created?: string };
}) {
  const q = searchParams.q?.trim().slice(0, 80) ?? "";

  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      category: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { select: { stock: true } },
    },
  });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Products"
        description="Manage prices, stock and visibility. Hidden products disappear from the storefront but keep their order history."
        action={
          <Link href="/admin/products/new" className="btn-dark px-4 py-2.5">
            Add product
          </Link>
        }
      />

      {searchParams.created ? <AdminNotice tone="success">Product created.</AdminNotice> : null}
      {searchParams.error ? <AdminNotice tone="error">{searchParams.error}</AdminNotice> : null}

      <form action="/admin/products" method="get" className="mt-4 flex max-w-md">
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search by name, slug or SKU"
          className="admin-input"
          aria-label="Search products"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 border border-l-0 border-[rgba(122,90,18,0.24)] bg-[var(--ink)] px-3 text-[0.6rem] uppercase tracking-[0.1em] text-[var(--gold-100)]"
        >
          <Search size={13} aria-hidden="true" /> Find
        </button>
      </form>

      {products.length === 0 ? (
        <div className="mt-4">
          <AdminEmpty
            title="No products found"
            body="Try a different search, or add your first product with a photo, price and stock."
          />
        </div>
      ) : (
        <div className="admin-card mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[rgba(122,90,18,0.12)] text-[0.55rem] uppercase tracking-[0.12em] text-[rgba(14,11,7,0.4)]">
              <tr>
                <th className="px-3 py-2.5 font-normal">Piece</th>
                <th className="px-3 py-2.5 font-normal">Collection</th>
                <th className="px-3 py-2.5 text-right font-normal">Price</th>
                <th className="px-3 py-2.5 text-right font-normal">Stock</th>
                <th className="px-3 py-2.5 font-normal">Visibility</th>
                <th className="px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(122,90,18,0.08)]">
              {products.map((product) => {
                const stock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
                return (
                  <tr key={product.id} className="hover:bg-[rgba(212,175,55,0.05)]">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden border border-[rgba(122,90,18,0.12)] bg-[var(--blush)]">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0].url}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <div>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="font-medium text-[var(--ink)] hover:text-[var(--gold-900)]"
                          >
                            {product.name}
                          </Link>
                          <span className="block text-[0.55rem] text-[rgba(14,11,7,0.4)]">
                            /{product.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-[rgba(14,11,7,0.6)]">{product.category.name}</td>
                    <td className="px-3 py-2.5 text-right">
                      {formatINR(product.pricePaise)}
                      {product.mrpPaise ? (
                        <span className="block text-[0.55rem] text-[rgba(14,11,7,0.35)] line-through">
                          {formatINR(product.mrpPaise)}
                        </span>
                      ) : null}
                    </td>
                    <td className={`px-3 py-2.5 text-right ${stock === 0 ? "text-[var(--error)]" : ""}`}>
                      {stock}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`badge ${product.isActive ? "badge-paid" : "badge-neutral"}`}>
                        {product.isActive ? "Live" : "Hidden"}
                      </span>
                      {product.isFeatured ? (
                        <span className="mt-1 block text-[0.55rem] uppercase tracking-[0.08em] text-[var(--gold-700)]">
                          Featured
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="border border-[rgba(122,90,18,0.22)] px-2.5 py-1.5 text-[0.58rem] uppercase tracking-[0.08em]"
                        >
                          Edit
                        </Link>
                        <form action={toggleProductAction}>
                          <input type="hidden" name="id" value={product.id} />
                          <button
                            type="submit"
                            className="border border-[rgba(122,90,18,0.22)] px-2.5 py-1.5 text-[0.58rem] uppercase tracking-[0.08em] text-[rgba(14,11,7,0.6)] hover:bg-[rgba(212,175,55,0.1)]"
                          >
                            {product.isActive ? "Hide" : "Publish"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-[0.62rem] leading-relaxed text-[rgba(14,11,7,0.4)]">
        Images are referenced from this app&rsquo;s public folder (for example{" "}
        <code>/images/jewel-1.jpg</code>). Upload approved photos there before publishing.
      </p>
    </div>
  );
}
