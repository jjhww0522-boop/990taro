import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "occult-bg-main": "#121212",
        "occult-bg-card": "#1C1C1E",
        "occult-accent": "#8C1C1C",
        "occult-accent-hover": "#A62B2B",
        "occult-accent-muted": "#3A0F0F",
        "occult-accent-text": "#D14F4F",
        "occult-text-main": "#E0E0E0",
        "occult-text-muted": "#828282"
      }
    }
  },
  plugins: []
};

export default config;
