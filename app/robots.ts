import type { MetadataRoute } from "next";

const SITE_URL = process.env.SITE_URL || "https://curavet.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/products", "/product/"],
        disallow: ["/admin", "/admin/", "/api/"],
      },
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
