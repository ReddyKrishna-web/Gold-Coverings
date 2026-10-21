import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@uma/db";
import { createProductAction } from "@/app/actions/admin";
import { AdminNotice, AdminPageHeader } from "@/components/admin-ui";
import { AdminProductForm } from "@/components/admin-product-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Add product" };

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.12em] text-[rgba(14,11,7,0.5)] hover:text-[var(--gold-900)]"
      >
        <ArrowLeft size={12} aria-hidden="true" /> All products
      </Link>
      <div className="mt-3">
        <AdminPageHeader
          eyebrow="Catalog"
          title="Add a product"
          description="Photos, an honest description and accurate stock. New pieces appear in the store immediately when published."
        />
      </div>
      {searchParams.error ? <AdminNotice tone="error">{searchParams.error}</AdminNotice> : null}
      <AdminProductForm mode="new" categories={categories} action={createProductAction} />
    </div>
  );
}
