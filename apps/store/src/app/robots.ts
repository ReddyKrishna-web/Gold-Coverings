import type { MetadataRoute } from "next";
import { STORE_URL } from "@uma/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/account", "/cart", "/checkout", "/orders", "/api/"],
      },
    ],
    sitemap: `${STORE_URL}/sitemap.xml`,
    host: STORE_URL,
  };
}
