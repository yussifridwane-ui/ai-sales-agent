import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_URL || "https://aisalesagent.app";
  return ["", "/pricing", "/features", "/login", "/register", "/privacy", "/terms", "/security"].map((p) => ({
    url: `${base}${p || "/"}`,
    lastModified: new Date(),
  }));
}
