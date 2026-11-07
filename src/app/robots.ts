import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/management/",
        "/api/",
      ],
    },

    sitemap: "https://prosota.ao/sitemap.xml",
  };
}