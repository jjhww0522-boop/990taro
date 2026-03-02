"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const CATEGORIES = ["전체", "무료 체험", "프리미엄", "번들"];

const PRODUCTS = [
  {
    id: 1,
    category: "무료 체험",
    tag: "FREE",
    tagColor: "#22c55e",
    title: "별빛 타로 무료 리딩",
    subtitle: "AI가 읽어주는 나의 카드",
    price: "무료",
    priceNote: "하루 1회 · 카드 3장",
    features: ["AI 타로 카드 해석", "과거 · 현재 · 미래 리딩", "AI와 2회 대화", "카드 도감 수집"],
    cta: "지금 무료로 보기",
    ctaLink: "/",
    highlight: false,
  },
  {
    id: 2,
    category: "프리미엄",
    tag: "BEST",
    tagColor: "#e8c96a",
    title: "별빛 프리미엄 1일권",
    subtitle: "깊은 상담이 필요한 날",
    price: "990원",
    priceNote: "24시간 · 5회 대화",
    features: ["무료 기능 전체 포함", "AI와 5회 심층 대화", "광고 없는 깔끔한 화면", "결제 즉시 활성화"],
    cta: "990원으로 시작하기",
    ctaLink: "/payment",
    highlight: true,
  },
  {
    id: 3,
    category: "번들",
    tag: "준비 중",
    tagColor: "#94a3b8",
    title: "별빛 월정액",
    subtitle: "매일 별빛과 함께",
    price: "coming soon",
    priceNote: "30일 · 무제한 대화",
    features: ["프리미엄 전체 포함", "매일 무제한 리딩", "특별 카드 해금", "우선 고객 지원"],
    cta: "알림 받기",
    ctaLink: "#",
    highlight: false,
  },
];

const BENEFITS = [
  { icon: "🔮", title: "78장 정통 웨이트 덱", desc: "수백 년의 상징 체계를 기반으로 한 타로 카드로, AI가 각 카드의 의미를 맥락에 맞게 해석합니다." },
  { icon: "✨", title: "GPT 기반 심층 해석", desc: "단순 카드 설명이 아닌, 나의 질문과 상황에 맞춰 개인화된 이야기로 리딩을 풀어냅니다." },
  { icon: "🌙", title: "언제 어디서나 상담", desc: "새벽 3시 고민도, 점심 잠깐 짬도 괜찮아요. 별빛은 24시간 당신 곁에 있습니다." },
];

const ABOUT_ROWS = [
  { label: "리딩 방식", value: "카드 3장 (과거 · 현재 · 미래) 스프레드, AI 맞춤 해석" },
  { label: "사용 카드", value: "라이더-웨이트 78장 덱 (정방향 + 역방향)" },
  { label: "AI 엔진", value: "OpenAI GPT-4o 기반, 한국어 특화 타로 프롬프트" },
  { label: "답변 품질", value: "질문 맥락 + 카드 상징 + 감정 공감을 결합한 복합 해석" },
];

const FAQS = [
  { q: "타로가 정말 맞나요?", a: "별빛타로는 미래를 '예언'하는 것이 아닌, 현재 나의 상태와 가능성을 카드 상징으로 비추어 자기 이해를 돕는 도구입니다. 수백년 간 많은 사람들이 타로를 통해 내면의 답을 찾아왔습니다." },
  { q: "결제 후 바로 사용 가능한가요?", a: "네, 결제 완료 즉시 프리미엄이 활성화됩니다. 별도 인증이나 설치 없이 바로 5회 심층 대화를 시작하실 수 있습니다." },
  { q: "하루에 몇 번 리딩할 수 있나요?", a: "무료 버전은 매일 1회 타로 리딩 + 2회 AI 대화가 가능합니다. 프리미엄(990원/24시간)은 5회 대화와 광고 제거 혜택이 제공됩니다." },
  { q: "개인 정보가 저장되나요?", a: "입력하신 고민과 대화 내용은 서버에 저장되지 않습니다. AI 응답을 위한 일시적 처리 후 즉시 폐기됩니다. 안심하고 솔직하게 물어보세요." },
  { q: "리딩에 어떤 정보가 필요한가요?", a: "별도 개인 정보 없이 '오늘의 질문'만 있으면 됩니다. 연애, 직장, 금전, 학업 등 마음속 고민을 자유롭게 입력하면 별빛이 카드를 펼쳐드립니다." },
];

export default function AboutPage() {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredProducts = activeCategory === "전체"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#080c18] text-[#fef9f0]" style={{ fontFamily: "'Noto Sans KR', -apple-system, sans-serif" }}>

      {/* ── 헤더 ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(232,201,106,0.15)", background: "rgba(8,12,24,0.85)", backdropFilter: "blur(20px)" }}>
        <div style={{ margin: "0 auto", maxWidth: 1100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1.5rem" }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: 17, color: "#ffd98e", letterSpacing: "0.05em", textDecoration: "none" }}>
            ✨ 별빛타로
          </Link>
          <nav style={{ display: "flex", gap: "1.75rem", fontSize: 14 }} className="hidden md:flex">
            {[["상품", "#products"], ["소개", "#about"], ["FAQ", "#faq"]].map(([label, href]) => (
              <a key={href} href={href} style={{ color: "rgba(255,249,240,0.6)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#ffd98e")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,249,240,0.6)")}>
                {label}
              </a>
            ))}
          </nav>
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href="/"
              style={{ padding: "7px 16px", borderRadius: 10, border: "1px solid rgba(232,201,106,0.35)", color: "#ffd98e", fontSize: 13, fontWeight: 600, textDecoration: "none", background: "linear-gradient(135deg,rgba(232,201,106,0.12),rgba(232,201,106,0.05))" }}
            >
              타로 시작하기
            </Link>
          </div>
        </div>
      </header>

      {/* ── 히어로 ── */}
      <section style={{ margin: "0 auto", maxWidth: 1100, padding: "5rem 1.5rem 4rem" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(232,201,106,0.7)", textTransform: "uppercase", marginBottom: "1rem" }}>
            AI × 타로 · 별빛이 읽는 오늘
          </p>
          <h1 style={{ fontSize: "clamp(2rem, 6vw, 3.75rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: "1.5rem" }}>
            카드 한 장이 들려주는<br />
            <span style={{ background: "linear-gradient(90deg, #e8c96a, #f0d97a, #c8a830)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              오늘의 별빛 메시지
            </span>
          </h1>
          <p style={{ maxWidth: 540, fontSize: 16, color: "rgba(255,249,240,0.65)", lineHeight: 1.8, marginBottom: "2rem" }}>
            78장의 타로 카드와 AI의 공감 능력이 만났습니다.<br />
            연애, 직장, 금전, 진로 — 마음속 질문을 별빛에게 던져보세요.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/" style={{ padding: "14px 28px", borderRadius: 14, background: "linear-gradient(135deg,#e8c96a,#c8a830)", color: "#0c1020", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
              무료로 시작하기 →
            </Link>
            <a href="#products" style={{ padding: "14px 28px", borderRadius: 14, border: "1px solid rgba(232,201,106,0.35)", color: "#ffd98e", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>
              상품 보기
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── 혜택 3가지 ── */}
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

      {/* ── 소개 / 서비스 정보 표 ── */}
      <section id="about" style={{ margin: "0 auto", maxWidth: 1100, padding: "4rem 1.5rem" }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 style={{ fontSize: "clamp(1.5rem,4vw,2.25rem)", fontWeight: 700, marginBottom: "0.75rem" }}>별빛타로란 무엇인가요?</h2>
          <p style={{ maxWidth: 600, fontSize: 15, color: "rgba(255,249,240,0.6)", lineHeight: 1.8, marginBottom: "2rem" }}>
            타로는 단순한 점술이 아닙니다. 카드에 담긴 상징을 통해 지금 내 마음의 상태, 숨겨진 감정, 나아갈 방향을 시각화하는 자기 이해의 도구입니다.
            별빛타로는 이 오랜 지혜에 AI의 언어 능력을 결합했습니다.
          </p>
          <div style={{ borderRadius: 20, border: "1px solid rgba(232,201,106,0.15)", overflow: "hidden" }}>
            {ABOUT_ROWS.map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr", borderBottom: i < ABOUT_ROWS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={{ padding: "1rem 1.25rem", background: "rgba(232,201,106,0.06)", fontWeight: 600, fontSize: 13, color: "#ffd98e", display: "flex", alignItems: "center" }}>{row.label}</div>
                <div style={{ padding: "1rem 1.25rem", fontSize: 14, color: "rgba(255,249,240,0.75)", display: "flex", alignItems: "center" }}>{row.value}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── 상품 ── */}
      <section id="products" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ margin: "0 auto", maxWidth: 1100, padding: "4rem 1.5rem" }}>
          <h2 style={{ fontSize: "clamp(1.5rem,4vw,2.25rem)", fontWeight: 700, marginBottom: "0.5rem" }}>이용권 선택</h2>
          <p style={{ fontSize: 14, color: "rgba(255,249,240,0.5)", marginBottom: "1.75rem" }}>상황에 맞는 별빛을 골라보세요</p>

          {/* 카테고리 탭 */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: "2rem" }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)}
                style={{ padding: "7px 18px", borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s", border: activeCategory === c ? "none" : "1px solid rgba(232,201,106,0.25)", background: activeCategory === c ? "linear-gradient(135deg,#e8c96a,#c8a830)" : "rgba(255,255,255,0.04)", color: activeCategory === c ? "#0c1020" : "rgba(255,249,240,0.65)" }}>
                {c}
              </button>
            ))}
          </div>

          {/* 상품 카드 */}
          <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
            <AnimatePresence mode="wait">
              {filteredProducts.map(p => (
                <motion.div key={p.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} layout
                  style={{ borderRadius: 24, border: p.highlight ? "1.5px solid rgba(232,201,106,0.6)" : "1px solid rgba(255,255,255,0.08)", background: p.highlight ? "linear-gradient(160deg,rgba(30,35,55,0.97),rgba(18,23,42,0.97))" : "rgba(255,255,255,0.03)", padding: "1.75rem", position: "relative", boxShadow: p.highlight ? "0 0 40px rgba(232,201,106,0.1)" : "none" }}>

                  {p.highlight && (
                    <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg,#e8c96a,#c8a830)", padding: "3px 14px", borderRadius: 999, fontSize: 11, fontWeight: 700, color: "#0c1020", whiteSpace: "nowrap" }}>
                      ✨ 가장 인기 있어요
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", padding: "3px 10px", borderRadius: 6, background: `${p.tagColor}20`, color: p.tagColor, border: `1px solid ${p.tagColor}40` }}>{p.tag}</span>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: p.price === "무료" || p.price === "coming soon" ? 20 : 24, fontWeight: 800, color: "#ffd98e" }}>{p.price}</div>
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

      {/* ── FAQ ── */}
      <section id="faq" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
        <div style={{ margin: "0 auto", maxWidth: 760, padding: "4rem 1.5rem" }}>
          <h2 style={{ fontSize: "clamp(1.5rem,4vw,2.25rem)", fontWeight: 700, marginBottom: "2rem", textAlign: "center" }}>자주 묻는 질문</h2>
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

      {/* ── 하단 CTA ── */}
      <section style={{ borderTop: "1px solid rgba(232,201,106,0.15)", background: "linear-gradient(180deg,rgba(18,23,42,0.5),rgba(8,12,24,1))", padding: "4rem 1.5rem", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔮</div>
          <h3 style={{ fontSize: "clamp(1.25rem,3vw,1.875rem)", fontWeight: 700, marginBottom: 12 }}>
            지금 별빛에게 물어보세요
          </h3>
          <p style={{ fontSize: 15, color: "rgba(255,249,240,0.55)", marginBottom: "2rem", maxWidth: 400, margin: "0 auto 2rem" }}>
            처음이어도 괜찮아요. 카드가 알아서 당신의 이야기를 찾아냅니다.
          </p>
          <Link href="/" style={{ display: "inline-block", padding: "15px 36px", borderRadius: 16, background: "linear-gradient(135deg,#e8c96a,#c8a830)", color: "#0c1020", fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: "0 8px 30px rgba(232,201,106,0.3)" }}>
            무료 타로 시작하기 ✨
          </Link>
        </motion.div>
      </section>

      {/* ── 푸터 ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ margin: "0 auto", maxWidth: 1100, padding: "2.5rem 1.5rem", fontSize: 13, color: "rgba(255,249,240,0.4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontWeight: 700, color: "#ffd98e", marginBottom: 8, fontSize: 15 }}>✨ 별빛타로</div>
              <div style={{ lineHeight: 1.8 }}>
                AI 타로 서비스 · 대한민국<br />
                비사업자 데모 서비스 (상업적 이용 준비 중)
              </div>
            </div>
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 600, color: "rgba(255,249,240,0.6)", marginBottom: 8 }}>서비스</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Link href="/" style={{ color: "rgba(255,249,240,0.4)", textDecoration: "none" }}>타로 시작</Link>
                  <Link href="/collection" style={{ color: "rgba(255,249,240,0.4)", textDecoration: "none" }}>나의 도감</Link>
                  <Link href="/payment" style={{ color: "rgba(255,249,240,0.4)", textDecoration: "none" }}>프리미엄</Link>
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "rgba(255,249,240,0.6)", marginBottom: 8 }}>법적 고지</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Link href="/privacy-policy" style={{ color: "rgba(255,249,240,0.4)", textDecoration: "none" }}>개인정보 처리방침</Link>
                  <Link href="/terms" style={{ color: "rgba(255,249,240,0.4)", textDecoration: "none" }}>이용약관</Link>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            © 2026 별빛타로. 본 서비스는 오락 목적이며, 전문적 상담을 대체하지 않습니다.
          </div>
        </div>
      </footer>
    </div>
  );
}
