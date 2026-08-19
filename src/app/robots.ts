import type { MetadataRoute } from "next";
import { marketingOrigin } from "@/lib/domains";

export default function robots(): MetadataRoute.Robots {
  const base = marketingOrigin();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/app/", "/admin/", "/api/"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
