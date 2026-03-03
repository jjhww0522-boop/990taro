import type { MetadataRoute } from "next";

// 🌐 도메인 변경 시 여기만 수정 (현재: 990taro.vercel.app)
// 추후 커스텀 도메인 구매 시 아래 값을 새 도메인으로 교체할 것
const BASE_URL = "https://990taro.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/guide`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/tarot-guide`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/collection`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/pick`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/shuffle`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/terms`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/privacy-policy`, changeFrequency: "monthly", priority: 0.4 },
  ];
}
