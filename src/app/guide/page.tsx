import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "타로 입문 가이드 | 별빛 타로 — 타로란 무엇인가, 리딩 방법",
    description: "타로 카드가 처음이신가요? 별빛 타로 입문 가이드에서 타로의 역사, 카드 종류, 3-카드 스프레드 읽는 법, 좋은 질문 만드는 팁까지 쉽게 알려드려요.",
};

const ARTICLES = [
    {
        id: "what-is-tarot",
        icon: "🔮",
        title: "타로란 무엇인가요?",
        content: `타로(Tarot)는 15세기 유럽에서 시작된 78장의 카드로 구성된 도구예요. 처음엔 게임 카드로 사용됐지만, 18세기부터 점술과 자기 탐색의 도구로 발전했어요.

타로는 미래를 확정적으로 예언하는 것이 아니에요. 지금 이 순간 나의 내면 상태, 숨겨진 감정, 앞으로 마주할 가능성의 에너지를 카드에 담긴 상징으로 비춰주는 도구예요.

78장 중 22장의 메이저 아르카나(Major Arcana)는 삶의 큰 주제와 교훈을 담고 있어요. 별빛 타로는 이 22장을 한국 동양 문화의 감성으로 재해석해, 더 친숙하고 깊이 있는 리딩을 제공해요.

카드 한 장 한 장은 우리 삶 어딘가에 있는 이야기예요. 바보(The Fool)는 새로운 시작의 두근거림을, 달(The Moon)은 불안과 직관 사이의 흔들림을 담고 있어요. 카드는 "맞다 틀리다"가 아닌 "공감"으로 작동해요.`,
    },
    {
        id: "three-card-spread",
        icon: "🃏",
        title: "3-카드 스프레드란?",
        content: `3-카드 스프레드(Three-Card Spread)는 타로 리딩에서 가장 많이 쓰이는 기본 배열이에요. 별빛 타로도 이 방식을 사용해요.

세 장은 각각 과거 · 현재 · 미래를 나타내요.

🕰 과거 카드: 지금 이 상황이 어디서 비롯됐는지 알려줘요. 기억하고 싶지 않은 감정, 영향을 줬던 사건, 아직 해소되지 않은 에너지가 담겨 있어요.

🌙 현재 카드: 지금 이 순간 나에게 가장 강하게 흐르는 에너지예요. 내 안에 무엇이 일어나고 있는지, 어떤 마음의 상태인지를 반영해요.

⭐ 미래 카드: 지금 이 흐름이 계속된다면 어떤 방향으로 향할지 보여줘요. 단, 미래는 고정되지 않아요. 카드는 하나의 가능성을 제시하는 것이지, 확정적인 예언이 아니에요.

세 장을 하나의 이야기로 연결하면 더 깊은 통찰을 얻을 수 있어요. "과거에 이런 에너지가 있었고, 지금 이런 상황에 있으니, 이런 흐름으로 가고 있구나."`,
    },
    {
        id: "how-to-ask",
        icon: "💬",
        title: "좋은 질문 만드는 법",
        content: `타로 리딩의 품질은 질문의 품질에 달려 있어요. 막연하거나 yes/no로 답하는 질문보다, 나의 마음 상태와 상황을 담은 열린 질문이 훨씬 풍부한 리딩을 만들어요.

❌ 피하면 좋은 질문:
· "나 취업 돼?" → yes/no 질문은 카드의 뉘앙스를 살리기 어려워요.
· "언제 남자친구 생겨?" → 시점 예언은 타로가 잘 못하는 영역이에요.

✅ 효과적인 질문:
· "지금 이 일에 계속 에너지를 쏟는 게 나에게 맞는 방향인지 궁금해요."
· "좋아하는 사람이 있는데, 내가 어떤 마음으로 다가가면 좋을까요?"
· "요즘 무기력한 이유가 뭔지, 어떻게 하면 다시 활력을 찾을 수 있을지 알고 싶어요."

핵심은 '예측'보다 '이해'를 묻는 것이에요. 카드는 미래를 알려주기보다, 지금 나에게 필요한 이야기를 꺼내주는 거울이에요.`,
    },
    {
        id: "reversed-cards",
        icon: "↩️",
        title: "역방향 카드, 나쁜 건가요?",
        content: `역방향 카드가 나오면 많은 분들이 걱정해요. 하지만 역방향은 "나쁜 카드"가 아니에요.

정방향 카드가 에너지가 밖으로 자유롭게 흐르는 상태라면, 역방향 카드는 그 에너지가 내면으로 향하거나, 억눌리거나, 아직 완전히 발현되지 않은 상태를 나타내요.

예를 들어, 호랑이를 탄 장수(전차) 카드가 정방향으로 나오면 추진력과 승리를 의미해요. 역방향으로 나오면 통제력이 흔들리거나 방향을 잃었다는 뜻이에요. 이는 경고이지, 저주가 아니에요.

역방향 카드가 말하는 것은: "지금 이 부분에서 막혀 있어요. 여기서 더 자세히 살펴보면 돌파구가 보일 거예요."

별빛 타로의 별빛 상담사는 역방향 카드도 항상 성장과 전환의 가능성으로 해석해요. 어두운 카드일수록 더 따뜻한 눈으로 바라봐 드릴게요.`,
    },
    {
        id: "tips-for-reading",
        icon: "✨",
        title: "더 깊은 리딩을 위한 팁",
        content: `타로 리딩을 처음 경험하는 분들을 위한 별빛 상담사의 팁을 알려드릴게요.

1. 마음을 정돈하고 시작하세요: 바쁜 중간에 급하게 하기보다, 잠깐이라도 눈을 감고 "지금 내가 가장 알고 싶은 게 뭔지" 생각해보세요.

2. 솔직하게 질문하세요: 카드는 꾸미거나 포장된 질문이 아닌, 진짜 마음에 반응해요. 부끄럽거나 두렵더라도 솔직하게 적어보세요.

3. 결과를 글자 그대로 받아들이지 마세요: "죽음 카드가 나왔어요"라고 해서 실제 죽음을 의미하지 않아요. 카드는 상징과 은유로 말해요. 별빛 상담사의 해석을 함께 읽으면 더 잘 이해할 수 있어요.

4. 같은 질문을 반복하지 마세요: 마음에 드는 답이 나올 때까지 같은 질문을 반복하면 카드의 에너지가 흐릿해져요. 한 번 받은 답을 천천히 소화해 보세요.

5. 저와 대화를 나눠보세요: 카드 해석이 헷갈리거나 더 깊이 이야기하고 싶다면, "본격적인 대화 나누기"를 통해 별빛 상담사에게 물어보세요.`,
    },
];

export default function GuidePage() {
    return (
        <main className="min-h-screen text-[#fef9f0] pb-20">
            {/* 헤더 */}
            <div className="relative py-16 px-6 text-center border-b border-[#e8c96a]/15">
                <Link href="/" className="inline-flex items-center gap-1.5 text-[#e8c96a]/60 hover:text-[#e8c96a] text-sm mb-8 transition-colors">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    별빛 타로 홈으로
                </Link>
                <p className="text-[#e8c96a]/60 text-xs tracking-[0.25em] uppercase mb-3">Beginner&apos;s Guide</p>
                <h1 className="text-4xl md:text-5xl font-bold text-[#ffd98e] mb-4" style={{ fontFamily: "serif" }}>
                    타로 입문 가이드
                </h1>
                <p className="text-[#fef9f0]/55 text-base max-w-lg mx-auto leading-relaxed">
                    타로가 처음이어도 괜찮아요. 별빛 상담사가 처음부터 쉽게 안내해 드릴게요.
                </p>
            </div>

            {/* 목차 */}
            <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="rounded-2xl border border-[#e8c96a]/15 bg-[#0f1419]/50 p-6">
                    <p className="text-[#e8c96a]/60 text-xs tracking-widest uppercase mb-4">목차</p>
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

            {/* 아티클 목록 */}
            <div className="max-w-3xl mx-auto px-6 space-y-8 pb-8">
                {ARTICLES.map((article) => (
                    <article
                        key={article.id}
                        id={article.id}
                        className="rounded-2xl border border-[#e8c96a]/12 bg-[#0f1419]/50 p-8"
                    >
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

            {/* 하단 CTA */}
            <div className="max-w-3xl mx-auto px-6">
                <div className="rounded-2xl border border-[#e8c96a]/20 bg-[#0f1419]/70 p-8 text-center">
                    <p className="text-2xl mb-3">🌟</p>
                    <h3 className="text-xl font-bold text-[#ffd98e] mb-2">이제 직접 경험해 볼 차례예요</h3>
                    <p className="text-[#fef9f0]/50 text-sm mb-6">지식보다 경험이 더 큰 가르침을 줘요. 별빛 상담사가 기다리고 있어요.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/" className="px-6 py-3 rounded-full text-sm font-semibold transition-all" style={{ background: "linear-gradient(135deg, #e8c96a, #c8a830)", color: "#0c1020" }}>
                            ✨ 무료 타로 시작하기
                        </Link>
                        <Link href="/tarot-guide" className="px-6 py-3 rounded-full text-sm font-semibold border border-[#e8c96a]/30 text-[#ffd98e] hover:border-[#e8c96a] transition-all">
                            📖 카드 백과사전 보기
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
