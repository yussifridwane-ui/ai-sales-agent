import type { MetadataRoute } from "next";
import { marketingOrigin } from "@/lib/domains";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = marketingOrigin();
  return ["", "/pricing", "/features", "/login", "/register", "/privacy", "/terms", "/security"].map((p) => ({
    url: `${base}${p || "/"}`,
    lastModified: new Date(),
  }));
}
