import type { Metadata } from "next";
import Link from "next/link";
import { MAJOR_ARCANA } from "../../lib/tarotData";

export const metadata: Metadata = {
    title: "타로 카드 백과사전 | 별빛 타로 — 22장 메이저 아르카나 완전 가이드",
    description: "별빛 타로의 22장 동양 타로 카드 완전 가이드. 각 카드의 상징, 정방향·역방향 의미, 연애·금전·학업별 해석까지 상세히 안내합니다.",
};

const EXTENDED_MEANINGS: Record<number, { symbol: string; love: string; money: string; health: string; summary: string }> = {
    0: { symbol: "빈 배낭과 절벽 끝의 발걸음", love: "두근거리는 새 만남의 시작. 조건 없이 순수하게 마음을 열면 예상치 못한 인연이 찾아와요.", money: "계획 없이 시작하는 투자는 조심해요. 작은 씨앗을 심는 실험적 도전은 오히려 환영받아요.", health: "새로운 운동이나 식습관을 시작하기 좋은 시기예요. 몸에 귀 기울이며 천천히 시작해 보세요.", summary: "순수한 시작 에너지. 미지에 대한 두려움보다 설렘을 선택하는 카드." },
    1: { symbol: "지팡이·컵·검·동전을 모두 다루는 손", love: "내가 원하는 관계를 적극적으로 만들어갈 수 있어요. 먼저 다가가는 용기가 관계를 바꿔요.", money: "가진 능력을 최대한 활용할 때예요. 준비된 사람에게 좋은 기회가 찾아오는 시기예요.", health: "운동 루틴을 만들거나 건강 계획을 세우기에 최적의 타이밍이에요.", summary: "의지와 창조력. 내 안의 자원이 충분하다는 걸 확인시켜주는 카드." },
    2: { symbol: "달빛 아래 두루마리를 든 여인", love: "말하지 않은 감정이 많아요. 상대방의 속마음도, 내 마음도 조금 더 깊이 살펴볼 시간이에요.", money: "지금 당장 결정하기보다 조용히 정보를 모으는 게 나아요. 보이지 않는 흐름을 신뢰하세요.", health: "몸의 미세한 신호를 무시하지 마세요. 정기 검진이나 전문가 상담이 도움이 될 수 있어요.", summary: "직관과 고요함. 내면의 목소리에 집중하라는 신호." },
    3: { symbol: "풍요로운 자연 속 왕좌에 앉은 여왕", love: "사랑받는 것이 자연스러운 시기예요. 있는 그대로의 모습으로 매력을 발산해요.", money: "풍요로운 에너지가 흘러요. 창작 활동이나 감성적 접근으로 수익을 만들 수 있어요.", health: "몸의 리듬이 회복되는 시기예요. 충분한 휴식과 영양 보충을 권장해요.", summary: "풍요와 모성. 씨앗이 열매 맺는 때를 알리는 카드." },
    4: { symbol: "갑옷 위에 왕관을 쓴 절대 군주", love: "안정적이고 믿음직스러운 관계를 원해요. 감정보다 신뢰와 책임을 중시하는 시기예요.", money: "계획적이고 체계적인 접근이 성공을 만들어요. 충동적 지출을 피하고 구조를 세우세요.", health: "규칙적인 생활 습관을 만들기 좋은 때예요. 꾸준함이 건강을 지켜줄 거예요.", summary: "권위와 책임. 기반을 단단히 다지라는 메시지." },
    5: { symbol: "두 사람에게 가르침을 전하는 성직자", love: "전통적이고 진지한 관계를 향해요. 가족이나 공동체의 가치가 관계에 영향을 미쳐요.", money: "정석적인 방법이 통해요. 검증된 투자·저축 방식을 따르는 게 안전해요.", health: "전통 의학이나 전문가의 조언을 따르세요. 규칙적인 치료 과정을 믿어보세요.", summary: "전통과 지혜. 선배와 스승의 말에 귀 기울이라는 신호." },
    6: { symbol: "천사의 축복 아래 마주한 두 연인", love: "중요한 선택의 갈림길에 서 있어요. 진심으로 원하는 게 무엇인지 마음이 알고 있어요.", money: "파트너십·공동 사업에서 좋은 결과가 기대돼요. 혼자보다 함께할 때 더 커져요.", health: "몸과 마음의 균형이 중요해요. 즐거움이 없으면 건강도 흔들릴 수 있어요.", summary: "선택과 인연. 가슴이 이끄는 대로 움직이라는 메시지." },
    7: { symbol: "별이 새겨진 갑옷을 입고 전차를 모는 장수", love: "원하는 관계를 향해 적극적으로 나아가는 시기예요. 주저하지 말고 진심을 전해보세요.", money: "강한 추진력으로 목표를 향해 달리세요. 포기만 하지 않으면 반드시 돌파구가 생겨요.", health: "체력과 의지력이 충전된 시기예요. 강도 높은 운동 목표에 도전하기 좋아요.", summary: "의지와 승리. 끝까지 밀어붙이면 이길 수 있다는 카드." },
    8: { symbol: "사자의 입을 부드럽게 다루는 손", love: "강요가 아닌 부드러운 이해로 마음을 얻는 시기예요. 인내심이 관계를 더 깊게 해줘요.", money: "급하게 욕심 부리기보단 천천히 꾸준하게 쌓는 방법이 통해요.", health: "몸의 회복에는 시간이 필요해요. 조급해하지 않는 것이 가장 중요해요.", summary: "내면의 힘과 인내. 부드러움이 강함을 이긴다는 카드." },
    9: { symbol: "별빛 등불을 든 채 홀로 걷는 노인", love: "혼자만의 시간이 필요해요. 서두르지 말고 스스로를 먼저 이해하는 시간을 가져보세요.", money: "신중하게 분석하고 판단하세요. 남의 말보다 자신의 직관을 믿는 게 좋아요.", health: "정신 건강이 몸 건강보다 우선이에요. 명상, 산책 등 조용한 회복 시간이 필요해요.", summary: "고독과 성찰. 멈추고 내면을 들여다봐야 할 때." },
    10: { symbol: "영원히 돌아가는 운명의 수레바퀴", love: "관계의 새로운 국면이 열려요. 오래된 인연이 다시 연결되거나 새로운 흐름이 시작돼요.", money: "운이 돌아오기 시작하는 신호예요. 기회를 놓치지 않도록 준비해 두세요.", health: "몸 상태가 변화할 수 있어요. 전환기이므로 꾸준한 관리가 중요해요.", summary: "운명의 전환. 모든 것은 흐르고 변한다는 메시지." },
    11: { symbol: "천칭과 검을 든 판관", love: "불균형이 있다면 지금이 바로잡을 때예요. 서로에 대한 공정한 이해가 필요해요.", money: "계약·법적 문제에서 공정한 결과가 나와요. 정직한 사업 운영이 보호받는 시기예요.", health: "건강 검진 결과를 정직하게 받아들이세요. 원인과 결과를 냉철히 분석해야 해요.", summary: "공정과 인과응보. 지금까지 한 일의 정당한 결과를 받는 카드." },
    12: { symbol: "나무에 발이 묶인 채 거꾸로 매달린 수도자", love: "관계에서 희생하고 있다면 그 의미를 다시 생각해 보세요. 기다림이 새로운 시각을 줘요.", money: "지금 당장 수익보다 장기적인 준비 기간이에요. 투자가 아직 무르익지 않았어요.", health: "무리한 활동보다 휴식이 필요해요. 지금 멈추는 것이 오히려 더 빠른 회복이에요.", summary: "희생과 기다림. 지금 겪는 불편이 나중에 큰 깨달음이 된다는 카드." },
    13: { symbol: "낫을 든 해골이 걷는 황량한 들판", love: "끝내야 할 관계는 끝내고, 새로운 시작을 위한 자리를 만드세요. 끝이 곧 시작이에요.", money: "불필요한 지출이나 수익 없는 사업은 정리할 때예요. 새로운 방향으로 전환하세요.", health: "오래된 나쁜 습관을 끊을 결정적인 시기예요. 완전한 변화만이 근본적 치유예요.", summary: "변화와 끝, 그리고 새로운 시작. 두려움보다 해방감을 느껴야 할 카드." },
    14: { symbol: "두 잔 사이로 물을 흘려보내는 천사", love: "급하거나 극단적으로 행동하지 마세요. 천천히 조화로운 관계를 다듬어 가는 시기예요.", money: "한쪽에 치우친 투자보다 균형 잡힌 포트폴리오가 안전해요. 절제가 장기 성과를 만들어요.", health: "식습관, 수면, 운동의 균형을 맞추세요. 어느 한 쪽에 집중하면 균형이 깨져요.", summary: "절제와 균형. 조화로운 흐름 속에서 가장 큰 힘이 나온다는 카드." },
    15: { symbol: "사슬로 묶인 두 인물 위에 선 악마", love: "집착이나 의존적인 관계에서 스스로 벗어나세요. 두려움 때문에 관계를 유지하진 않나요?", money: "충동적 소비나 도박성 투자에 주의해요. 욕망이 판단력을 흐리게 할 수 있어요.", health: "나쁜 습관(술, 담배, 과식)을 끊을 때예요. 인식만 해도 이미 벗어나기 시작한 거예요.", summary: "집착과 속박. 그러나 줄은 원래부터 느슨했다 — 스스로 선택할 수 있다는 카드." },
    16: { symbol: "벼락을 맞아 무너지는 탑과 추락하는 인물들", love: "갑작스러운 이별이나 폭로가 생길 수 있어요. 쌓였던 문제가 한꺼번에 터질 수 있어요.", money: "예상치 못한 손실이나 사업 위기가 올 수 있어요. 충격 이후 빠른 재구성이 중요해요.", health: "갑작스러운 몸의 이상 신호를 무시하지 마세요. 즉시 전문가의 도움을 구하세요.", summary: "갑작스러운 붕괴. 그러나 무너진 자리가 더 단단한 기초가 될 수 있다는 카드." },
    17: { symbol: "밤하늘에 빛나는 큰 별과 물을 붓는 여인", love: "치유와 희망의 에너지예요. 상처 입은 마음이 서서히 회복되기 시작해요.", money: "꿈을 향해 나아갈 때예요. 지금은 결실보다 방향성이 더 중요한 시기예요.", health: "몸과 마음이 회복되는 시기예요. 자연과 가까운 활동이 큰 도움이 돼요.", summary: "희망과 치유. 어두운 밤에도 빛은 있다는 메시지를 전하는 카드." },
    18: { symbol: "달 아래에서 짖는 개와 절로 기어오르는 가재", love: "상대방의 진심이 불분명해요. 환상보다 현실을 보려는 노력이 필요해요.", money: "불확실한 정보나 사기에 주의하세요. 감정적 판단으로 큰 투자를 결정하지 마세요.", health: "심리적 불안이 몸에 영향을 줄 수 있어요. 수면 질과 정신 건강에 더 집중하세요.", summary: "불안과 환상. 보이는 것이 전부가 아니니 직관과 이성을 함께 써야 하는 카드." },
    19: { symbol: "밝게 빛나는 태양 아래 뛰노는 아이", love: "생동감 있고 솔직한 사랑의 에너지예요. 있는 그대로 자신을 표현하면 사랑받아요.", money: "성공과 수익의 에너지가 강해요. 자신감을 갖고 목표를 향해 나아가세요.", health: "활력이 넘치는 시기예요. 야외 활동이나 사람들과의 교류가 건강에 큰 도움이 돼요.", summary: "성공과 기쁨. 가장 행복하고 긍정적인 에너지를 담은 카드." },
    20: { symbol: "나팔 소리에 무덤에서 일어나는 인물들", love: "중요한 관계에 대한 재평가의 시간이에요. 진심이 있다면 다시 시작할 용기를 내세요.", money: "오랫동안 기다린 결과가 나타나는 시기예요. 평가와 보상의 사이클이 마무리돼요.", health: "오래된 증상이나 묵혀둔 건강 문제를 드디어 해결할 수 있어요.", summary: "재기와 보상. 과거의 노력이 드디어 인정받는 타이밍." },
    21: { symbol: "월계관 원형 안에서 춤추는 인물", love: "완성되고 성숙한 사랑의 에너지예요. 관계가 한 단계 더 발전하거나 안정기에 접어들어요.", money: "크고 작은 목표가 달성되는 시기예요. 성취감을 즐기며 다음 사이클을 준비하세요.", health: "전반적인 몸 상태가 좋아요. 이 에너지를 유지하기 위한 습관 정립이 중요해요.", summary: "완성과 해탈. 하나의 여정이 끝나고 더 큰 시작을 앞둔 카드." },
};

export default function TarotGuidePage() {
    return (
        <main className="min-h-screen text-[#fef9f0] pb-20">
            {/* 헤더 */}
            <div className="relative py-16 px-6 text-center border-b border-[#e8c96a]/15">
                <Link href="/" className="inline-flex items-center gap-1.5 text-[#e8c96a]/60 hover:text-[#e8c96a] text-sm mb-8 transition-colors">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    별빛 타로 홈으로
                </Link>
                <p className="text-[#e8c96a]/60 text-xs tracking-[0.25em] uppercase mb-3">Encyclopedia</p>
                <h1 className="text-4xl md:text-5xl font-bold text-[#ffd98e] mb-4" style={{ fontFamily: "serif" }}>
                    타로 카드 백과사전
                </h1>
                <p className="text-[#fef9f0]/55 text-base max-w-lg mx-auto leading-relaxed">
                    별빛 타로의 22장 동양 메이저 아르카나 — 각 카드의 상징, 의미, 상황별 해석을 모두 담았어요.
                </p>
                <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                    <span className="text-[#fef9f0]/40">📖 22장 카드</span>
                    <span className="text-[#e8c96a]/30">·</span>
                    <span className="text-[#fef9f0]/40">🔮 정·역방향 해석</span>
                    <span className="text-[#e8c96a]/30">·</span>
                    <span className="text-[#fef9f0]/40">💕 연애·금전·건강별 안내</span>
                </div>
            </div>

            {/* 카드 목록 */}
            <div className="max-w-5xl mx-auto px-4 pt-12 space-y-10">
                {MAJOR_ARCANA.map((card) => {
                    const ext = EXTENDED_MEANINGS[card.id];
                    return (
                        <article
                            key={card.id}
                            id={`card-${card.id}`}
                            className="rounded-2xl border border-[#e8c96a]/12 bg-[#0f1419]/50 backdrop-blur-sm overflow-hidden"
                        >
                            {/* 카드 헤더 */}
                            <div className="flex items-center gap-5 p-6 border-b border-[#e8c96a]/10">
                                <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-[#e8c96a]/20">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[#e8c96a]/50 text-xs tracking-widest">No.{String(card.id).padStart(2, "0")}</span>
                                        <span className="text-[#fef9f0]/20 text-xs">·</span>
                                        <span className="text-[#fef9f0]/35 text-xs">{card.original}</span>
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-bold text-[#ffd98e]" style={{ fontFamily: "serif" }}>{card.name}</h2>
                                    {ext && <p className="text-[#fef9f0]/40 text-xs mt-1">🔯 {ext.symbol}</p>}
                                </div>
                            </div>

                            {/* 본문 */}
                            <div className="p-6 space-y-5">
                                {/* 한줄 요약 */}
                                {ext && (
                                    <p className="text-[#ffd98e]/80 text-sm italic border-l-2 border-[#e8c96a]/30 pl-4 leading-relaxed">
                                        {ext.summary}
                                    </p>
                                )}

                                {/* 정·역방향 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="rounded-xl bg-[#e8c96a]/5 border border-[#e8c96a]/15 p-4">
                                        <p className="text-[#e8c96a] text-xs font-bold tracking-widest mb-2">◆ 정방향</p>
                                        <p className="text-[#fef9f0]/75 text-sm leading-relaxed">{card.upright}</p>
                                    </div>
                                    <div className="rounded-xl bg-[#d46b6b]/5 border border-[#d46b6b]/15 p-4">
                                        <p className="text-[#d46b6b] text-xs font-bold tracking-widest mb-2">✦ 역방향</p>
                                        <p className="text-[#fef9f0]/75 text-sm leading-relaxed">{card.reversed}</p>
                                    </div>
                                </div>

                                {/* 상황별 해석 */}
                                {ext && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {[
                                            { icon: "💕", label: "연애", text: ext.love },
                                            { icon: "🪙", label: "금전", text: ext.money },
                                            { icon: "🌿", label: "건강", text: ext.health },
                                        ].map((item) => (
                                            <div key={item.label} className="rounded-xl bg-white/3 border border-white/8 p-4">
                                                <p className="text-[#fef9f0]/50 text-xs font-semibold mb-2">{item.icon} {item.label}운</p>
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

            {/* 하단 CTA */}
            <div className="text-center mt-16 px-6">
                <p className="text-[#fef9f0]/40 text-sm mb-4">카드의 의미를 직접 경험해 보고 싶다면</p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all"
                    style={{
                        background: "linear-gradient(135deg, #e8c96a, #c8a830)",
                        color: "#0c1020",
                        boxShadow: "0 4px 20px rgba(232,201,106,0.25)",
                    }}
                >
                    ✨ 지금 무료 타로 보기
                </Link>
            </div>
        </main>
    );
}
