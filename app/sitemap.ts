import type { MetadataRoute } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const SITE_URL = process.env.SITE_URL || "https://curavet.com";

async function getProductIds(): Promise<string[]> {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    return snapshot.docs.map((doc) => doc.id);
  } catch (error) {
    console.error("Sitemap: failed to fetch products", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productIds = await getProductIds();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const productPages: MetadataRoute.Sitemap = productIds.map((id) => ({
    url: `${SITE_URL}/product/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages];
}
