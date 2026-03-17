import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Byeolbit Tarot | AI Tarot Reading · Daily Fortune",
    template: "%s | Byeolbit Tarot",
  },
  description:
    "Share your story with Byeolbit Tarot. Our AI tarot advisor draws 22 cards to warmly interpret your love, money, career, and health fortune. Free once daily — no sign-up required.",
  keywords: [
    "AI tarot",
    "tarot reading",
    "daily fortune",
    "free tarot",
    "love tarot",
    "tarot cards",
    "online tarot",
    "tarot spread",
    "major arcana",
    "tarot interpretation",
    "relationship tarot",
    "career tarot",
  ],
  metadataBase: new URL("https://tetolab.com/tarot"),
  alternates: {
    canonical: "https://tetolab.com/tarot/en",
    languages: {
      "ko": "https://tetolab.com/tarot",
      "en": "https://tetolab.com/tarot/en",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    title: "Byeolbit Tarot | AI Tarot Reading",
    description:
      "AI-powered tarot reading for love, money, health & career. Free daily reading — no sign-up needed. Start now.",
    url: "https://tetolab.com/tarot/en",
    siteName: "Byeolbit Tarot",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Byeolbit Tarot | AI Tarot Reading",
    description:
      "AI-powered tarot reading for love, money, health & career. Free daily reading — no sign-up needed.",
  },
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return children;
}
