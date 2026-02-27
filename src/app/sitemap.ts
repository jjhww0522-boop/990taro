import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://wolha-tarot.kr";

  return [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/shuffle`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/pick`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/result`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/terms`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
