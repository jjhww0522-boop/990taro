import type { MetadataRoute } from "next";

// 🌐 tetolab.com/tarot 경로로 서비스 중
const BASE_URL = "https://tetolab.com/tarot";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/guide`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/tarot-guide`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/terms`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/privacy-policy`, changeFrequency: "monthly", priority: 0.4 },
  ];
}
