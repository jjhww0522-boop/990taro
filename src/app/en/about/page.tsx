"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const CATEGORIES = ["All", "Free", "Premium", "Bundle"];

const PRODUCTS = [
  {
    id: 1,
    category: "Free",
    tag: "FREE",
    tagColor: "#22c55e",
    title: "Byeolbit Tarot Free Reading",
    subtitle: "Your cards, read by AI",
    price: "Free",
    priceNote: "Once daily · 3 cards",
    features: ["AI tarot card interpretation", "Past · Present · Future spread", "2 AI follow-up chats", "Card collection unlocks"],
    cta: "Start for free",
    ctaLink: "/en",
    highlight: false,
  },
  {
    id: 2,
    category: "Premium",
    tag: "BEST",
    tagColor: "#e8c96a",
    title: "Byeolbit Premium Day Pass",
    subtitle: "For days when you need a deeper reading",
    price: "$0.99",
    priceNote: "24 hours · 5 conversations",
    features: ["Everything in Free", "5 deep AI conversations", "Ad-free experience", "Activates immediately after payment"],
    cta: "Start for $0.99",
    ctaLink: "/payment",
    highlight: true,
  },
  {
    id: 3,
    category: "Bundle",
    tag: "COMING SOON",
    tagColor: "#94a3b8",
    title: "Byeolbit Monthly",
    subtitle: "Every day with the stars",
    price: "Coming soon",
    priceNote: "30 days · Unlimited chats",
    features: ["Everything in Premium", "Daily unlimited readings", "Exclusive card unlocks", "Priority support"],
    cta: "Get notified",
    ctaLink: "#",
    highlight: false,
  },
];

const BENEFITS = [
  { icon: "🔮", title: "78-card Rider-Waite Deck", desc: "Grounded in centuries of symbolism, our AI interprets each card's meaning in context to your unique situation." },
  { icon: "✨", title: "GPT-Powered Deep Readings", desc: "Not just card definitions — your reading is woven into a personalized story that speaks to your question directly." },
  { icon: "🌙", title: "Available 24/7", desc: "3 AM worries or a quick lunch-break check — Byeolbit is always here, any time you need guidance." },
];

const ABOUT_ROWS = [
  { label: "Reading Style", value: "3-Card Spread (Past · Present · Future), AI-personalized interpretation" },
  { label: "Card Deck", value: "Rider-Waite 78-card deck (upright + reversed)" },
  { label: "AI Engine", value: "OpenAI GPT-4o, tarot-optimized prompt system" },
  { label: "Answer Quality", value: "Context + card symbolism + emotional empathy — layered reading" },
];

const FAQS = [
  { q: "Is tarot actually accurate?", a: "Byeolbit Tarot doesn't 'predict' the future. It uses card symbolism to reflect your current state of mind, hidden emotions, and possible paths forward — a mirror for self-understanding. Tarot has helped people find inner clarity for centuries." },
  { q: "Can I use it right after paying?", a: "Yes — Premium activates the moment payment is confirmed. No verification or installation needed. Your 5 deep conversations start immediately." },
  { q: "How many readings can I get per day?", a: "Free tier: 1 tarot reading + 2 AI chat responses per day. Premium ($0.99 / 24 hrs): 5 chat responses and no ads." },
  { q: "Is my personal information stored?", a: "Your questions and conversations are never saved to our servers. They're used only for your AI response and immediately discarded. Feel free to be completely honest." },
  { q: "What do I need to start a reading?", a: "Nothing personal — just your question. Type anything about love, work, money, or life direction. Byeolbit does the rest." },
];

export default function EnAboutPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredProducts = activeCategory === "All"
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#080c18] text-[#fef9f0]" style={{ fontFamily: "'Noto Sans KR', -apple-system, sans-serif" }}>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(232,201,106,0.15)", background: "rgba(8,12,24,0.85)", backdropFilter: "blur(20px)" }}>
        <div style={{ margin: "0 auto", maxWidth: 1100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1.5rem" }}>
          <Link href="/en" style={{ fontWeight: 700, fontSize: 17, color: "#ffd98e", letterSpacing: "0.05em", textDecoration: "none" }}>
            ✨ Byeolbit Tarot
          </Link>
          <nav style={{ display: "flex", gap: "1.75rem", fontSize: 14 }} className="hidden md:flex">
            {[["Pricing", "#products"], ["About", "#about"], ["FAQ", "#faq"]].map(([label, href]) => (
              <a key={href} href={href} style={{ color: "rgba(255,249,240,0.6)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ffd98e")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,249,240,0.6)")}>
                {label}
              </a>
            ))}
          </nav>
          <Link href="/en" style={{ padding: "7px 16px", borderRadius: 10, border: "1px solid rgba(232,201,106,0.35)", color: "#ffd98e", fontSize: 13, fontWeight: 600, textDecoration: "none", background: "linear-gradient(135deg,rgba(232,201,106,0.12),rgba(232,201,106,0.05))" }}>
            Start Reading
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ margin: "0 auto", maxWidth: 1100, padding: "5rem 1.5rem 4rem" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(232,201,106,0.7)", textTransform: "uppercase", marginBottom: "1rem" }}>
            AI × Tarot · Starlight Reads Your Day
          </p>
          <h1 style={{ fontSize: "clamp(2rem, 6vw, 3.75rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: "1.5rem" }}>
            One card holds a story.<br />
            <span style={{ background: "linear-gradient(90deg, #e8c96a, #f0d97a, #c8a830)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Your starlight message for today.
            </span>
          </h1>
          <p style={{ maxWidth: 540, fontSize: 16, color: "rgba(255,249,240,0.65)", lineHeight: 1.8, marginBottom: "2rem" }}>
            78 tarot cards meet AI empathy.<br />
            Love, career, money, life direction — ask anything under the stars.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/en" style={{ padding: "14px 28px", borderRadius: 14, background: "linear-gradient(135deg,#e8c96a,#c8a830)", color: "#0c1020", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
              Start for Free →
            </Link>
            <a href="#products" style={{ padding: "14px 28px", borderRadius: 14, border: "1px solid rgba(232,201,106,0.35)", color: "#ffd98e", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>
              View Plans
            </a>
          </div>
        </motion.div>
      </section>

      {/* Benefits */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ margin: "0 auto", maxWidth: 1100, padding: "3.5rem 1.5rem", display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
          {BENEFITS.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              style={{ borderRadius: 20, border: "1px solid rgba(232,201,106,0.15)", background: "linear-gradient(135deg,rgba(26,31,46,0.8),rgba(15,20,35,0.8))", padding: "1.75rem", backdropFilter: "blur(8px)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{b.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#ffd98e", marginBottom: 8 }}>{b.title}</div>
              <p style={{ fontSize: 14, color: "rgba(255,249,240,0.6)", lineHeight: 1.75 }}>{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" style={{ margin: "0 auto", maxWidth: 1100, padding: "4rem 1.5rem" }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 style={{ fontSize: "clamp(1.5rem,4vw,2.25rem)", fontWeight: 700, marginBottom: "0.75rem" }}>What is Byeolbit Tarot?</h2>
          <p style={{ maxWidth: 600, fontSize: 15, color: "rgba(255,249,240,0.6)", lineHeight: 1.8, marginBottom: "2rem" }}>
            Tarot is more than fortune-telling. Each card&apos;s symbolism reflects your inner state, hidden feelings, and possible directions — a tool for self-understanding.
            Byeolbit Tarot combines this ancient wisdom with the language capabilities of AI.
          </p>
          <div style={{ borderRadius: 20, border: "1px solid rgba(232,201,106,0.15)", overflow: "hidden" }}>
            {ABOUT_ROWS.map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr", borderBottom: i < ABOUT_ROWS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={{ padding: "1rem 1.25rem", background: "rgba(232,201,106,0.06)", fontWeight: 600, fontSize: 13, color: "#ffd98e", display: "flex", alignItems: "center" }}>{row.label}</div>
                <div style={{ padding: "1rem 1.25rem", fontSize: 14, color: "rgba(255,249,240,0.75)", display: "flex", alignItems: "center" }}>{row.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing */}
      <section id="products" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ margin: "0 auto", maxWidth: 1100, padding: "4rem 1.5rem" }}>
          <h2 style={{ fontSize: "clamp(1.5rem,4vw,2.25rem)", fontWeight: 700, marginBottom: "0.5rem" }}>Choose Your Plan</h2>
          <p style={{ fontSize: 14, color: "rgba(255,249,240,0.5)", marginBottom: "1.75rem" }}>Pick the starlight that fits your day</p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "2rem" }}>
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setActiveCategory(c)}
                style={{ padding: "7px 18px", borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s", border: activeCategory === c ? "none" : "1px solid rgba(232,201,106,0.25)", background: activeCategory === c ? "linear-gradient(135deg,#e8c96a,#c8a830)" : "rgba(255,255,255,0.04)", color: activeCategory === c ? "#0c1020" : "rgba(255,249,240,0.65)" }}>
                {c}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
            <AnimatePresence mode="wait">
              {filteredProducts.map((p) => (
                <motion.div key={p.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} layout
                  style={{ borderRadius: 24, border: p.highlight ? "1.5px solid rgba(232,201,106,0.6)" : "1px solid rgba(255,255,255,0.08)", background: p.highlight ? "linear-gradient(160deg,rgba(30,35,55,0.97),rgba(18,23,42,0.97))" : "rgba(255,255,255,0.03)", padding: "1.75rem", position: "relative", boxShadow: p.highlight ? "0 0 40px rgba(232,201,106,0.1)" : "none" }}>

                  {p.highlight && (
                    <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg,#e8c96a,#c8a830)", padding: "3px 14px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: "#0c1020", whiteSpace: "nowrap" }}>
                      ✨ Most Popular
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", padding: "3px 10px", borderRadius: 6, background: `${p.tagColor}20`, color: p.tagColor, border: `1px solid ${p.tagColor}40` }}>{p.tag}</span>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "#ffd98e" }}>{p.price}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,249,240,0.4)", marginTop: 2 }}>{p.priceNote}</div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{p.title}</h3>
                  <p style={{ fontSize: 13, color: "rgba(255,249,240,0.5)", marginBottom: "1.25rem" }}>{p.subtitle}</p>

                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", display: "flex", flexDirection: "column", gap: 8 }}>
                    {p.features.map((f, fi) => (
                      <li key={fi} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(255,249,240,0.75)" }}>
                        <span style={{ color: "#e8c96a", fontSize: 12, flexShrink: 0 }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>

                  <Link href={p.ctaLink}
                    style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: 14, fontWeight: 700, fontSize: 14, textDecoration: "none", background: p.highlight ? "linear-gradient(135deg,#e8c96a,#c8a830)" : "rgba(232,201,106,0.1)", color: p.highlight ? "#0c1020" : "#ffd98e", border: p.highlight ? "none" : "1px solid rgba(232,201,106,0.3)" }}>
                    {p.cta}
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
        <div style={{ margin: "0 auto", maxWidth: 760, padding: "4rem 1.5rem" }}>
          <h2 style={{ fontSize: "clamp(1.5rem,4vw,2.25rem)", fontWeight: 700, marginBottom: "2rem", textAlign: "center" }}>Frequently Asked Questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {FAQS.map((f, idx) => (
              <motion.div key={idx} layout style={{ borderRadius: 18, border: "1px solid rgba(232,201,106,0.15)", background: openFaq === idx ? "rgba(232,201,106,0.06)" : "rgba(255,255,255,0.025)", overflow: "hidden" }}>
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  style={{ width: "100%", textAlign: "left", padding: "1.125rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "#fef9f0", fontWeight: 600, fontSize: 15 }}>
                  <span>Q. {f.q}</span>
                  <motion.span animate={{ rotate: openFaq === idx ? 45 : 0 }} transition={{ duration: 0.2 }} style={{ fontSize: 20, color: "#e8c96a", flexShrink: 0, lineHeight: 1, marginLeft: 12 }}>+</motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                      style={{ overflow: "hidden" }}>
                      <p style={{ padding: "0 1.25rem 1.25rem", fontSize: 14, color: "rgba(255,249,240,0.65)", lineHeight: 1.8 }}>
                        A. {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ borderTop: "1px solid rgba(232,201,106,0.15)", background: "linear-gradient(180deg,rgba(18,23,42,0.5),rgba(8,12,24,1))", padding: "4rem 1.5rem", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔮</div>
          <h3 style={{ fontSize: "clamp(1.25rem,3vw,1.875rem)", fontWeight: 700, marginBottom: 12 }}>
            Ask the stars something today
          </h3>
          <p style={{ fontSize: 15, color: "rgba(255,249,240,0.55)", marginBottom: "2rem", maxWidth: 400, margin: "0 auto 2rem" }}>
            First time? Don&apos;t worry. The cards find your story on their own.
          </p>
          <Link href="/en" style={{ display: "inline-block", padding: "15px 36px", borderRadius: 16, background: "linear-gradient(135deg,#e8c96a,#c8a830)", color: "#0c1020", fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: "0 8px 30px rgba(232,201,106,0.3)" }}>
            Start Free Tarot Reading ✨
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ margin: "0 auto", maxWidth: 1100, padding: "2.5rem 1.5rem", fontSize: 13, color: "rgba(255,249,240,0.4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontWeight: 700, color: "#ffd98e", marginBottom: 8, fontSize: 15 }}>✨ Byeolbit Tarot</div>
              <div style={{ lineHeight: 1.8 }}>
                AI Tarot Service<br />
                Demo service (commercial launch in progress)
              </div>
            </div>
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 600, color: "rgba(255,249,240,0.6)", marginBottom: 8 }}>Service</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Link href="/en" style={{ color: "rgba(255,249,240,0.4)", textDecoration: "none" }}>Start Reading</Link>
                  <Link href="/collection" style={{ color: "rgba(255,249,240,0.4)", textDecoration: "none" }}>My Collection</Link>
                  <Link href="/payment" style={{ color: "rgba(255,249,240,0.4)", textDecoration: "none" }}>Premium</Link>
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "rgba(255,249,240,0.6)", marginBottom: 8 }}>Legal</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Link href="/privacy-policy" style={{ color: "rgba(255,249,240,0.4)", textDecoration: "none" }}>Privacy Policy</Link>
                  <Link href="/terms" style={{ color: "rgba(255,249,240,0.4)", textDecoration: "none" }}>Terms of Service</Link>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            © 2026 Byeolbit Tarot. This service is for entertainment purposes only and does not replace professional advice.
          </div>
        </div>
      </footer>
    </div>
  );
}
