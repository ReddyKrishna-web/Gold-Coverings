import type { MetadataRoute } from "next";
import { POLICIES, STORE_URL, WEBSITE_URL } from "@uma/brand";
import { prisma } from "@uma/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let products: { slug: string; updatedAt: Date }[] = [];
  let categories: { slug: string }[] = [];

  try {
    [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({ select: { slug: true } }),
    ]);
  } catch (error) {
    console.error("[store] Sitemap could not read catalog:", error);
  }

  const staticRoutes = ["", "/shop"].map((path) => ({
    url: `${STORE_URL}${path || "/"}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.9,
  }));

  const productRoutes = products.map((product) => ({
    url: `${STORE_URL}/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryRoutes = categories.map((category) => ({
    url: `${STORE_URL}/shop?category=${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const policyRoutes = POLICIES.map((policy) => ({
    url: `${WEBSITE_URL}/policies/${policy.slug}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.2,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...policyRoutes];
}
