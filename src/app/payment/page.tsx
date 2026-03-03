"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense } from "react";

type PaymentMethod = "tosspay" | "kakaopay" | "card" | null;

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "";
const IS_DEMO = !TOSS_CLIENT_KEY || TOSS_CLIENT_KEY.startsWith("여기에");

const TOSS_METHOD_MAP: Record<NonNullable<Exclude<PaymentMethod, null>>, string> = {
    tosspay: "토스페이",
    kakaopay: "카카오페이",
    card: "카드",
};

function generateOrderId() {
    return `taro-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function PaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo") ?? "/result";

    const [selected, setSelected] = useState<PaymentMethod>(null);
    const [isPaying, setIsPaying] = useState(false);
    const [step, setStep] = useState<"select" | "processing">("select");
    const [errorMsg, setErrorMsg] = useState("");

    // orderId는 마운트 시 1회 생성 후 고정
    const orderIdRef = useRef(generateOrderId());
    const orderId = orderIdRef.current;

    const handlePay = async () => {
        if (!selected || isPaying) return;
        setStep("processing");
        setIsPaying(true);
        setErrorMsg("");

        try {
            if (!IS_DEMO) {
                // ── 실제 토스페이먼츠 결제 (SDK v2) ────────────────────────────
                const { loadTossPayments, ANONYMOUS } = await import("@tosspayments/tosspayments-sdk");
                const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
                const payment = tossPayments.payment({ customerKey: ANONYMOUS });

                const successUrl = `${window.location.origin}/payment/success?returnTo=${encodeURIComponent(returnTo)}`;
                const failUrl    = `${window.location.origin}/payment/fail`;

                // requestPayment 후 PG가 successUrl / failUrl 로 리다이렉트
                await payment.requestPayment({
                    method: "CARD",
                    amount: { currency: "KRW", value: 990 },
                    orderId,
                    orderName: "별빛 타로 프리미엄 1일권",
                    successUrl,
                    failUrl,
                    card: {
                        useEscrow: false,
                        flowMode: "DEFAULT",
                        useCardPoint: false,
                        useAppCardOnly: false,
                    },
                });
                // ────────────────────────────────────────────────────────────────
                // Redirect 방식이므로 이 아래 코드는 실행되지 않습니다.
            } else {
                // ── 데모 시뮬레이션 (키 없을 때) ────────────────────────────────
                await new Promise(r => setTimeout(r, 2400));
                router.push(
                    `/payment/success?orderId=${orderId}&amount=990&paymentKey=DEMO_${Date.now()}&returnTo=${encodeURIComponent(returnTo)}`
                );
            }
        } catch (e) {
            const msg = (e as Error).message ?? "결제 요청 중 오류가 발생했어요.";
            setErrorMsg(msg);
            setStep("select");
            setIsPaying(false);
        }
    };

    const methods = [
        {
            id: "tosspay" as PaymentMethod,
            label: "토스페이",
            icon: (
                <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none">
                    <rect width="48" height="48" rx="10" fill="#0064FF" />
                    <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="900" fontStyle="italic" fontFamily="sans-serif">toss</text>
                </svg>
            ),
            desc: "토스 앱 또는 계좌이체",
        },
        {
            id: "kakaopay" as PaymentMethod,
            label: "카카오페이",
            icon: (
                <svg viewBox="0 0 48 48" className="w-6 h-6" fill="none">
                    <rect width="48" height="48" rx="10" fill="#FFE812" />
                    <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="#3A1D1D" fontSize="11" fontWeight="900" fontFamily="sans-serif">pay</text>
                </svg>
            ),
            desc: "카카오 계정으로 간편결제",
        },
        {
            id: "card" as PaymentMethod,
            label: "신용/체크카드",
            icon: (
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#555" strokeWidth="1.8">
                    <rect x="1" y="4" width="22" height="16" rx="2" />
                    <path d="M1 10h22" />
                </svg>
            ),
            desc: "국내 모든 카드 사용 가능",
        },
    ];

    if (step === "processing") {
        const methodLabel = selected ? TOSS_METHOD_MAP[selected] : "";
        return (
            <main className="min-h-screen flex flex-col items-center justify-center bg-[#0c1020] text-[#fef9f0] px-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6 text-center">
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 rounded-full border-4 border-[#e8c96a]/20" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-[#e8c96a] animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-2xl">✨</div>
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-[#ffd98e]">결제 처리 중</p>
                        <p className="text-sm text-[#fef9f0]/50 mt-1">{methodLabel}로 연결 중이에요...</p>
                    </div>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#0c1020] text-[#fef9f0] flex flex-col items-center justify-center px-4 py-12">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[400px] flex flex-col gap-5">

                {/* 상단 뒤로가기 */}
                <button onClick={() => router.back()} className="flex items-center gap-2 text-[#fef9f0]/40 hover:text-[#fef9f0] text-sm transition-colors self-start">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    뒤로
                </button>

                {/* 데모 모드 배너 */}
                {IS_DEMO && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-xs">
                        <span>⚠️</span>
                        <span>테스트 모드 — 실제 결제가 이루어지지 않습니다</span>
                    </div>
                )}

                {/* 상품 정보 카드 */}
                <div className="rounded-2xl border border-[#e8c96a]/25 bg-[#1a1f2e]/80 backdrop-blur-xl p-6">
                    <div className="flex items-center gap-4 mb-5">
                        <div className="w-12 h-12 rounded-full bg-[#e8c96a]/10 border border-[#e8c96a]/30 flex items-center justify-center text-2xl shrink-0">✨</div>
                        <div>
                            <p className="font-bold text-[#ffd98e] text-[17px]">별빛 타로 프리미엄</p>
                            <p className="text-sm text-[#fef9f0]/50">24시간 이용권</p>
                        </div>
                        <p className="ml-auto text-xl font-black text-[#ffd98e]">990원</p>
                    </div>
                    <div className="space-y-2 text-sm border-t border-white/5 pt-4">
                        {[
                            "✅ AI 타로 상담 5회",
                            "✅ 심층 카드 분석",
                            "✅ 광고 없는 깔끔한 화면",
                            "✅ 결제 후 즉시 이용 가능",
                        ].map((item, i) => (
                            <p key={i} className="text-[#fef9f0]/70">{item}</p>
                        ))}
                    </div>
                </div>

                {/* 결제 방법 선택 */}
                <div>
                    <p className="text-xs text-[#fef9f0]/40 mb-3 tracking-widest uppercase">결제 방법 선택</p>
                    <div className="flex flex-col gap-2">
                        {methods.map((m) => (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => setSelected(m.id)}
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${selected === m.id
                                    ? "border-[#e8c96a] bg-[#e8c96a]/8"
                                    : "border-white/10 bg-white/3 hover:border-white/20"
                                    }`}
                            >
                                <div className="shrink-0">{m.icon}</div>
                                <div className="flex-1">
                                    <p className={`font-semibold text-[14px] ${selected === m.id ? "text-[#ffd98e]" : "text-[#fef9f0]/80"}`}>{m.label}</p>
                                    <p className="text-xs text-[#fef9f0]/40 mt-0.5">{m.desc}</p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected === m.id ? "border-[#e8c96a] bg-[#e8c96a]" : "border-white/20"}`}>
                                    {selected === m.id && <div className="w-2 h-2 rounded-full bg-[#0c1020]" />}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 에러 메시지 */}
                {errorMsg && (
                    <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-xl px-4 py-3 border border-red-500/20">
                        {errorMsg}
                    </p>
                )}

                {/* 결제 버튼 */}
                <motion.button
                    type="button"
                    onClick={handlePay}
                    disabled={!selected || isPaying}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full py-4 rounded-2xl font-bold text-[15px] transition-all ${selected
                        ? "bg-gradient-to-r from-[#e8c96a] to-[#f0d97a] text-[#0c1020] hover:shadow-[0_0_30px_rgba(232,201,106,0.4)]"
                        : "bg-white/8 text-[#fef9f0]/30 cursor-not-allowed"
                        }`}
                >
                    {selected ? `990원 결제하기` : "결제 방법을 선택해 주세요"}
                </motion.button>

                <p className="text-center text-[11px] text-[#fef9f0]/25 leading-relaxed">
                    결제 시 <a href="/terms" className="underline hover:text-[#fef9f0]/50 transition-colors">이용약관</a>에 동의하는 것으로 간주됩니다.<br />
                    이용 기간: 결제 완료 후 24시간
                </p>
            </motion.div>
        </main>
    );
}

export default function PaymentPage() {
    return (
        <Suspense>
            <PaymentContent />
        </Suspense>
    );
}
