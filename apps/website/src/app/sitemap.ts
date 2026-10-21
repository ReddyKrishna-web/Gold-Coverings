import type { MetadataRoute } from "next";
import { POLICIES, WEBSITE_URL } from "@uma/brand";
import { getCollections } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const collections = await getCollections();
  const now = new Date();

  const staticRoutes = ["", "/collections", "/about", "/gallery", "/contact"].map((path) => ({
    url: `${WEBSITE_URL}${path || "/"}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const collectionRoutes = collections.map((collection) => ({
    url: `${WEBSITE_URL}/collections/${collection.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const policyRoutes = POLICIES.map((policy) => ({
    url: `${WEBSITE_URL}/policies/${policy.slug}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  return [...staticRoutes, ...collectionRoutes, ...policyRoutes];
}
