import type { Metadata } from "next";
import Link from "next/link";
import { MAJOR_ARCANA } from "../../../lib/tarotData";

export const metadata: Metadata = {
  title: "Tarot Card Encyclopedia | Byeolbit Tarot — Complete Guide to 22 Major Arcana",
  description:
    "Byeolbit Tarot's complete guide to all 22 Major Arcana cards. Discover each card's symbolism, upright & reversed meanings, and interpretations for love, money, and health.",
  alternates: { canonical: "https://tetolab.com/tarot/en/tarot-guide" },
};

const EXTENDED_MEANINGS: Record<number, { symbol: string; love: string; money: string; health: string; summary: string }> = {
  0: { symbol: "An empty sack and a step at the cliff's edge", love: "The thrilling start of a new connection. Open your heart without conditions and an unexpected bond may find you.", money: "Be cautious with unplanned investments. Experimental small bets are welcome — just don't go all-in blind.", health: "A great time to start a new workout or diet habit. Listen to your body and begin slowly.", summary: "Pure beginning energy. Choose excitement over fear of the unknown." },
  1: { symbol: "Hands that command the wand, cup, sword, and coin", love: "You have the power to actively shape the relationship you want. The courage to approach first changes everything.", money: "Use every skill you have. Opportunities find those who are prepared.", health: "The perfect timing to build a fitness routine or health plan.", summary: "Will and creativity. A reminder that you already have everything you need inside you." },
  2: { symbol: "A woman holding scrolls beneath the moonlight", love: "So much remains unsaid. Take time to look more deeply into your own heart — and your partner's.", money: "Gather information quietly rather than deciding right now. Trust the unseen flow.", health: "Don't ignore subtle signals from your body. A check-up or expert consultation may help.", summary: "Intuition and stillness. A signal to listen to your inner voice." },
  3: { symbol: "A queen enthroned in abundant nature", love: "Being loved feels natural right now. Your authentic self radiates magnetic charm.", money: "Abundant energy flows. Creative pursuits or emotional intelligence can generate income.", health: "Your body's rhythm is restoring itself. Rest well and nourish yourself.", summary: "Abundance and nurturing. The card of seeds becoming fruit." },
  4: { symbol: "An absolute ruler crowned over armor", love: "You crave a stable, trustworthy relationship. You prioritize reliability and responsibility over fleeting emotion.", money: "A systematic, structured approach brings success. Avoid impulsive spending — build your foundation.", health: "An ideal time to create a regular routine. Consistency is what keeps you well.", summary: "Authority and responsibility. A message to build solid ground." },
  5: { symbol: "A high priest passing wisdom to two disciples", love: "You're drawn toward traditional, committed relationships. Family values and community shape your bonds.", money: "Classic, proven methods work. Stick to established, trusted approaches for investing and saving.", health: "Follow traditional medicine and expert advice. Trust the process of regular treatment.", summary: "Tradition and wisdom. A signal to listen to your elders and mentors." },
  6: { symbol: "Two lovers standing beneath an angel's blessing", love: "You're at a crossroads. Your heart already knows what it truly wants.", money: "Partnerships and joint ventures look promising. Together you grow bigger than alone.", health: "Balance between body and mind matters. Without joy, health can waver.", summary: "Choice and connection. A message to follow what your heart leads." },
  7: { symbol: "A warrior in star-emblazoned armor driving a chariot", love: "Charge boldly toward the relationship you want. Don't hesitate — express your genuine feelings.", money: "Push hard toward your target with fierce momentum. Breakthroughs come to those who don't quit.", health: "Your physical and mental energy is fully charged. A great time to tackle ambitious fitness goals.", summary: "Will and victory. The card that says: push all the way and you'll win." },
  8: { symbol: "Gentle hands opening the mouth of a lion", love: "Win hearts through soft understanding, not force. Patience deepens relationships.", money: "Slow and steady wins over rushing for quick gains.", health: "Recovery takes time. Not hurrying is the most important thing.", summary: "Inner strength and patience. Softness overcomes hardness." },
  9: { symbol: "A lone elder walking with a lantern of starlight", love: "You need time alone. Don't rush — understand yourself first before seeking another.", money: "Analyze carefully and trust your own instincts over others' advice.", health: "Mental health comes before physical health right now. Meditation, walks, and quiet recovery time are essential.", summary: "Solitude and reflection. A time to stop and look within." },
  10: { symbol: "The ever-turning Wheel of Fate", love: "A new chapter in your relationship opens. Old connections may resurface or fresh currents may begin.", money: "Fortune is starting to turn in your favor. Stay ready — don't miss the opportunity.", health: "Your condition may shift. Since this is a turning point, consistent care matters.", summary: "The turn of fate. Everything flows and changes." },
  11: { symbol: "A judge holding scales and a sword", love: "If there's an imbalance, now is the time to correct it. A fair understanding of each other is needed.", money: "Fair outcomes in contracts and legal matters. Honest business practices are protected now.", health: "Accept the honest results of health checks. Analyze causes and effects with clear eyes.", summary: "Justice and karma. The card of receiving the fair result of your actions." },
  12: { symbol: "A monk hanging upside down from a tree by one foot", love: "If you're sacrificing yourself in a relationship, reconsider what it means. Waiting brings a new perspective.", money: "This is a period of long-term preparation rather than immediate income. The investment isn't ripe yet.", health: "Rest is more important than pushing hard. Stopping now is actually the faster path to recovery.", summary: "Sacrifice and waiting. The discomfort you face today becomes a great insight tomorrow." },
  13: { symbol: "A skeletal figure walking across a barren field with a scythe", love: "End what needs to end, and make space for a new beginning. Every ending is a beginning.", money: "Clear out expenses or ventures with no return. Pivot to a new direction.", health: "A decisive moment to break old bad habits. Only complete transformation brings real healing.", summary: "Change, ending, and new beginning. Feel liberation, not fear." },
  14: { symbol: "An angel pouring water between two cups", love: "Don't act hastily or to extremes. This is a time to slowly refine a harmonious bond.", money: "A balanced portfolio beats one-sided bets. Restraint builds long-term results.", health: "Balance diet, sleep, and exercise. Leaning too far in one direction throws everything off.", summary: "Temperance and balance. The greatest power comes from harmonious flow." },
  15: { symbol: "Two figures chained below a looming devil", love: "Free yourself from attachment or dependent relationships. Are you staying out of fear?", money: "Be wary of impulsive spending or speculative investments. Desire can cloud your judgment.", health: "Time to break bad habits — smoking, drinking, overeating. Just being aware is already the first step to freedom.", summary: "Bondage and attachment. But the chains were always loose — you can choose to walk away." },
  16: { symbol: "A tower struck by lightning; figures falling from above", love: "A sudden breakup or revelation may arrive. Tensions that have built up can erupt all at once.", money: "Unexpected loss or a business crisis may come. Fast rebuilding after the shock matters.", health: "Don't ignore sudden signals from your body. Seek professional help immediately.", summary: "Sudden collapse. But the rubble can become a stronger foundation." },
  17: { symbol: "A woman pouring water beneath a sky full of bright stars", love: "Healing and hope flow in. A wounded heart begins to slowly mend.", money: "Time to move toward your dream. Direction matters more than results right now.", health: "Your body and mind are recovering. Activities in nature bring great renewal.", summary: "Hope and healing. Even in the dark of night, the light is always there." },
  18: { symbol: "A dog howling at the moon; a crab crawling ashore", love: "Your partner's true intentions are unclear. Try to see reality instead of projecting your hopes.", money: "Be alert to unreliable information or potential scams. Don't let emotions drive big investment decisions.", health: "Psychological anxiety can affect your body. Focus more on sleep quality and mental wellness.", summary: "Anxiety and illusion. What you see isn't everything — use both intuition and reason." },
  19: { symbol: "A child dancing freely under a radiant sun", love: "A vibrant, honest love energy surrounds you. Express yourself as you truly are and you'll be loved.", money: "Strong success and income energy. Move toward your goals with confidence.", health: "You're overflowing with vitality. Outdoor activities and social connection boost your health enormously.", summary: "Success and joy. The most positive and radiant energy in the deck." },
  20: { symbol: "Figures rising from their tombs at the sound of a trumpet", love: "Time to reassess an important relationship. If there's true feeling, summon the courage to begin again.", money: "The results of a long wait are finally appearing. A cycle of evaluation and reward is completing.", health: "A long-standing symptom or postponed health issue can finally be addressed and resolved.", summary: "Resurrection and reward. The moment your past efforts finally receive their due recognition." },
  21: { symbol: "A figure dancing inside a laurel wreath", love: "A complete and mature love energy. Your relationship steps forward or settles into a stable phase.", money: "Big and small goals are being reached. Enjoy the achievement and prepare for the next cycle.", health: "Your overall condition is excellent. Establishing habits to maintain this energy is key.", summary: "Completion and liberation. One journey ends — and a greater new one awaits." },
};

export default function EnTarotGuidePage() {
  return (
    <main className="min-h-screen text-[#fef9f0] pb-20">
      {/* Header */}
      <div className="relative py-16 px-6 text-center border-b border-[#e8c96a]/15">
        <Link href="/en" className="inline-flex items-center gap-1.5 text-[#e8c96a]/60 hover:text-[#e8c96a] text-sm mb-8 transition-colors">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to Byeolbit Tarot
        </Link>
        <p className="text-[#e8c96a]/60 text-xs tracking-[0.25em] uppercase mb-3">Encyclopedia</p>
        <h1 className="text-4xl md:text-5xl font-bold text-[#ffd98e] mb-4" style={{ fontFamily: "serif" }}>
          Tarot Card Encyclopedia
        </h1>
        <p className="text-[#fef9f0]/55 text-base max-w-lg mx-auto leading-relaxed">
          All 22 Major Arcana cards of Byeolbit Tarot — symbolism, upright &amp; reversed meanings, and readings for love, money, and health.
        </p>
        <div className="flex items-center justify-center gap-6 mt-6 text-sm">
          <span className="text-[#fef9f0]/40">📖 22 Cards</span>
          <span className="text-[#e8c96a]/30">·</span>
          <span className="text-[#fef9f0]/40">🔮 Upright &amp; Reversed</span>
          <span className="text-[#e8c96a]/30">·</span>
          <span className="text-[#fef9f0]/40">💕 Love · Money · Health</span>
        </div>
      </div>

      {/* Card list */}
      <div className="max-w-5xl mx-auto px-4 pt-12 space-y-10">
        {MAJOR_ARCANA.map((card) => {
          const ext = EXTENDED_MEANINGS[card.id];
          return (
            <article
              key={card.id}
              id={`card-${card.id}`}
              className="rounded-2xl border border-[#e8c96a]/12 bg-[#0f1419]/50 backdrop-blur-sm overflow-hidden"
            >
              {/* Card header */}
              <div className="flex items-center gap-5 p-6 border-b border-[#e8c96a]/10">
                <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-[#e8c96a]/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.image} alt={card.original} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#e8c96a]/50 text-xs tracking-widest">No.{String(card.id).padStart(2, "0")}</span>
                    <span className="text-[#fef9f0]/20 text-xs">·</span>
                    <span className="text-[#fef9f0]/35 text-xs">{card.name}</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-[#ffd98e]" style={{ fontFamily: "serif" }}>{card.original}</h2>
                  {ext && <p className="text-[#fef9f0]/40 text-xs mt-1">🔯 {ext.symbol}</p>}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Summary */}
                {ext && (
                  <p className="text-[#ffd98e]/80 text-sm italic border-l-2 border-[#e8c96a]/30 pl-4 leading-relaxed">
                    {ext.summary}
                  </p>
                )}

                {/* Upright & Reversed */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#e8c96a]/5 border border-[#e8c96a]/15 p-4">
                    <p className="text-[#e8c96a] text-xs font-bold tracking-widest mb-2">◆ UPRIGHT</p>
                    <p className="text-[#fef9f0]/75 text-sm leading-relaxed">{card.upright}</p>
                  </div>
                  <div className="rounded-xl bg-[#d46b6b]/5 border border-[#d46b6b]/15 p-4">
                    <p className="text-[#d46b6b] text-xs font-bold tracking-widest mb-2">✦ REVERSED</p>
                    <p className="text-[#fef9f0]/75 text-sm leading-relaxed">{card.reversed}</p>
                  </div>
                </div>

                {/* Context readings */}
                {ext && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { icon: "💕", label: "Love", text: ext.love },
                      { icon: "🪙", label: "Money", text: ext.money },
                      { icon: "🌿", label: "Health", text: ext.health },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl bg-white/3 border border-white/8 p-4">
                        <p className="text-[#fef9f0]/50 text-xs font-semibold mb-2">{item.icon} {item.label}</p>
                        <p className="text-[#fef9f0]/65 text-xs leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-16 px-6">
        <p className="text-[#fef9f0]/40 text-sm mb-4">Want to experience the cards yourself?</p>
        <Link
          href="/en"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all"
          style={{
            background: "linear-gradient(135deg, #e8c96a, #c8a830)",
            color: "#0c1020",
            boxShadow: "0 4px 20px rgba(232,201,106,0.25)",
          }}
        >
          ✨ Start Free Tarot Reading
        </Link>
      </div>
    </main>
  );
}
