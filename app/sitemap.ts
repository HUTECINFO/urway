import type { MetadataRoute } from "next";
import { listPublishedDeals } from "@/lib/data/deals";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const deals = await listPublishedDeals();
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/drops`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/como-funciona`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...deals.map((deal) => ({
      url: `${baseUrl}/drop/${deal.slug}`,
      lastModified: new Date(deal.updatedAt),
      changeFrequency: "daily" as const,
      priority: deal.featured ? 0.9 : 0.8,
      images: [deal.imageUrl],
    })),
  ];
}
