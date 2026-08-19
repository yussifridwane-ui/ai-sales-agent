import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL || "https://aisalesagent.app";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/app/", "/admin/", "/api/"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
