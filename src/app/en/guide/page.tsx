import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Beginner's Guide to Tarot | Byeolbit Tarot — What is Tarot, How to Read",
  description:
    "New to tarot? Byeolbit Tarot's beginner guide covers tarot history, card types, the 3-card spread, and tips for asking powerful questions — all explained simply.",
  alternates: { canonical: "https://tetolab.com/tarot/en/guide" },
};

const ARTICLES = [
  {
    id: "what-is-tarot",
    icon: "🔮",
    title: "What is Tarot?",
    content: `Tarot is a deck of 78 cards that originated in 15th-century Europe. Originally used as playing cards, they evolved into a tool for divination and self-exploration by the 18th century.

Tarot doesn't predict the future with certainty. Instead, it uses the symbols on each card to illuminate your current inner state, hidden emotions, and the energies surrounding possible futures.

Of the 78 cards, 22 are Major Arcana — cards that represent life's big themes and lessons. Byeolbit Tarot reimagines these 22 cards through the lens of East Asian visual culture, offering a familiar and deeply resonant reading experience.

Each card carries a story that exists somewhere in our lives. The Fool holds the excitement of a new beginning; the Moon holds the trembling space between anxiety and intuition. Cards don't work on "right or wrong" — they work on resonance.`,
  },
  {
    id: "three-card-spread",
    icon: "🃏",
    title: "What is the 3-Card Spread?",
    content: `The 3-Card Spread is the most widely used tarot layout, and the one Byeolbit Tarot uses for every reading.

The three cards each represent the Past, Present, and Future.

🕰 Past Card: Shows where the current situation originated. It can surface emotions you'd rather forget, events that shaped you, or unresolved energy still affecting you today.

🌙 Present Card: Reflects the strongest energy flowing through you right now — what's happening inside you, and what state of mind you're in at this moment.

⭐ Future Card: Shows the direction things are heading if the current energy continues. But remember — the future isn't fixed. This card offers one possible path, not a definitive prediction.

Reading all three as one connected story gives the deepest insight: "This energy was present in the past, this is where I am now, and here's the direction I'm heading."`,
  },
  {
    id: "how-to-ask",
    icon: "💬",
    title: "How to Ask a Good Question",
    content: `The quality of your tarot reading depends on the quality of your question. Vague or yes/no questions limit the reading. Open, emotionally honest questions draw out far richer insight.

❌ Questions to avoid:
· "Will I get the job?" → Yes/no questions don't let the cards speak in nuance.
· "When will I meet someone?" → Precise timing is outside tarot's strength.

✅ Questions that work:
· "Is continuing to put energy into this situation really the right direction for me?"
· "There's someone I like — what energy should I bring when I approach them?"
· "I've been feeling unmotivated lately. What's behind it, and how can I find my spark again?"

The key is asking for understanding, not prediction. Cards are a mirror that surfaces the story you need to hear right now — not a forecasting machine.`,
  },
  {
    id: "reversed-cards",
    icon: "↩️",
    title: "Are Reversed Cards Bad?",
    content: `When a reversed card appears, many people worry. But reversed doesn't mean bad.

An upright card means the card's energy is flowing freely outward. A reversed card means that energy is turned inward, blocked, or not yet fully expressed.

For example, the Chariot upright signals momentum and victory. Reversed, it points to a loss of control or a sense of losing direction. That's a warning, not a curse.

What a reversed card is saying: "There's a blockage here. Look more closely at this area and you'll find a way through."

Byeolbit Tarot's AI advisor always interprets reversed cards as opportunities for growth and transformation. The darker the card, the warmer the eye it deserves.`,
  },
  {
    id: "tips-for-reading",
    icon: "✨",
    title: "Tips for a Deeper Reading",
    content: `Here are some tips from Byeolbit Tarot for first-time readers.

1. Settle your mind before you begin: Rather than rushing in mid-task, take even a brief moment — close your eyes and ask yourself, "What do I most want to understand right now?"

2. Be honest in your question: The cards respond to genuine feelings, not polished ones. Even if it's embarrassing or scary, write down what's really on your mind.

3. Don't take the result too literally: A Death card doesn't mean actual death. Tarot speaks in symbols and metaphor. Reading alongside the AI advisor's interpretation will help you understand what it truly means.

4. Don't repeat the same question: Asking the same question until you get the answer you want blurs the cards' energy. Take time to sit with the answer you received.

5. Talk it through with me: If you're unsure about an interpretation or want to go deeper, use the conversation feature to ask the Byeolbit advisor directly.`,
  },
];

export default function EnGuidePage() {
  return (
    <main className="min-h-screen text-[#fef9f0] pb-20">
      {/* Header */}
      <div className="relative py-16 px-6 text-center border-b border-[#e8c96a]/15">
        <Link href="/en" className="inline-flex items-center gap-1.5 text-[#e8c96a]/60 hover:text-[#e8c96a] text-sm mb-8 transition-colors">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to Byeolbit Tarot
        </Link>
        <p className="text-[#e8c96a]/60 text-xs tracking-[0.25em] uppercase mb-3">Beginner&apos;s Guide</p>
        <h1 className="text-4xl md:text-5xl font-bold text-[#ffd98e] mb-4" style={{ fontFamily: "serif" }}>
          Introduction to Tarot
        </h1>
        <p className="text-[#fef9f0]/55 text-base max-w-lg mx-auto leading-relaxed">
          Never read tarot before? That&apos;s perfectly fine. Byeolbit guides you from the very beginning.
        </p>
      </div>

      {/* Table of contents */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="rounded-2xl border border-[#e8c96a]/15 bg-[#0f1419]/50 p-6">
          <p className="text-[#e8c96a]/60 text-xs tracking-widest uppercase mb-4">Contents</p>
          <ul className="space-y-2">
            {ARTICLES.map((a, i) => (
              <li key={a.id}>
                <a href={`#${a.id}`} className="flex items-center gap-3 text-[#fef9f0]/60 hover:text-[#ffd98e] text-sm transition-colors">
                  <span className="text-[#e8c96a]/40 text-xs w-4">{i + 1}.</span>
                  <span>{a.icon} {a.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Articles */}
      <div className="max-w-3xl mx-auto px-6 space-y-8 pb-8">
        {ARTICLES.map((article) => (
          <article key={article.id} id={article.id} className="rounded-2xl border border-[#e8c96a]/12 bg-[#0f1419]/50 p-8">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl">{article.icon}</span>
              <h2 className="text-xl md:text-2xl font-bold text-[#ffd98e]">{article.title}</h2>
            </div>
            <div className="text-[#fef9f0]/70 text-sm leading-[2] space-y-4">
              {article.content.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="rounded-2xl border border-[#e8c96a]/20 bg-[#0f1419]/70 p-8 text-center">
          <p className="text-2xl mb-3">🌟</p>
          <h3 className="text-xl font-bold text-[#ffd98e] mb-2">Now it&apos;s your turn to experience it</h3>
          <p className="text-[#fef9f0]/50 text-sm mb-6">Experience teaches more than knowledge ever can. The Byeolbit advisor is waiting for you.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/en" className="px-6 py-3 rounded-full text-sm font-semibold transition-all" style={{ background: "linear-gradient(135deg, #e8c96a, #c8a830)", color: "#0c1020" }}>
              ✨ Start Free Tarot Reading
            </Link>
            <Link href="/en/tarot-guide" className="px-6 py-3 rounded-full text-sm font-semibold border border-[#e8c96a]/30 text-[#ffd98e] hover:border-[#e8c96a] transition-all">
              📖 Browse Card Encyclopedia
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
