import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { prisma } from "@uma/db";
import { updateProductAction } from "@/app/actions/admin";
import { AdminNotice, AdminPageHeader } from "@/components/admin-ui";
import { AdminProductForm } from "@/components/admin-product-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string; saved?: string };
}) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sku: "asc" } },
      },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  const movements = await prisma.inventoryMovement.findMany({
    where: { variantId: { in: product.variants.map((variant) => variant.id) } },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: { variant: { select: { sku: true, size: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.12em] text-[rgba(14,11,7,0.5)] hover:text-[var(--gold-900)]"
        >
          <ArrowLeft size={12} aria-hidden="true" /> All products
        </Link>
        <Link
          href={`/product/${product.slug}`}
          className="inline-flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.12em] text-[var(--gold-900)] hover:underline"
        >
          View in store <ExternalLink size={11} aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-3">
        <AdminPageHeader
          eyebrow={product.isActive ? "Published" : "Hidden"}
          title={product.name}
          description={`SKU ${product.sku ?? "—"} · last updated ${product.updatedAt.toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
          })}`}
        />
      </div>

      {searchParams.saved ? <AdminNotice tone="success">Product saved.</AdminNotice> : null}
      {searchParams.error ? <AdminNotice tone="error">{searchParams.error}</AdminNotice> : null}

      <AdminProductForm
        mode="edit"
        categories={categories}
        action={updateProductAction}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          description: product.description,
          careInfo: product.careInfo,
          pricePaise: product.pricePaise,
          mrpPaise: product.mrpPaise,
          images: product.images.map((image) => image.url),
          isActive: product.isActive,
          isFeatured: product.isFeatured,
          isBestseller: product.isBestseller,
          variants: product.variants.map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            size: variant.size,
            finish: variant.finish,
            stock: variant.stock,
            pricePaise: variant.pricePaise,
          })),
        }}
      />

      <section className="admin-card mt-4 p-4">
        <h2 className="text-sm font-medium">Inventory history</h2>
        <p className="mt-1 text-[0.62rem] text-[rgba(14,11,7,0.45)]">
          Adjustments, sales and restocks recorded for this product.
        </p>
        {movements.length === 0 ? (
          <p className="mt-3 text-xs text-[rgba(14,11,7,0.45)]">No movements logged yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[rgba(122,90,18,0.08)] text-xs">
            {movements.map((movement) => (
              <li key={movement.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <div>
                  <p className="text-[var(--ink)]">
                    {movement.reason.toLowerCase()} · {movement.variant.sku}
                    {movement.variant.size ? ` (${movement.variant.size})` : ""}
                  </p>
                  {movement.note ? (
                    <p className="text-[0.58rem] text-[rgba(14,11,7,0.45)]">{movement.note}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <span className={movement.delta >= 0 ? "text-[var(--success)]" : "text-[var(--maroon)]"}>
                    {movement.delta > 0 ? "+" : ""}
                    {movement.delta}
                  </span>
                  <span className="text-[0.55rem] text-[rgba(14,11,7,0.35)]">
                    {movement.createdAt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
