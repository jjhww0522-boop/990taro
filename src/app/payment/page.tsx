"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense } from "react";

type PaymentMethod = "tosspay" | "kakaopay" | "card" | null;

function PaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnTo = searchParams.get("returnTo") ?? "/result";

    const [selected, setSelected] = useState<PaymentMethod>(null);
    const [isPaying, setIsPaying] = useState(false);
    const [step, setStep] = useState<"select" | "confirm" | "processing">("select");

    const orderId = `taro-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const handlePay = async () => {
        if (!selected) return;
        setStep("processing");
        setIsPaying(true);

        // ── 실제 API 연동 시 이 부분을 교체하세요 ──
        // 토스페이먼츠:
        // const toss = await loadTossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!);
        // await toss.requestPayment("카드", { amount: 990, orderId, orderName: "별빛타로 프리미엄 1일" });
        //
        // 카카오페이:
        // const res = await fetch("/api/payment/kakao-ready", { method:"POST", body: JSON.stringify({ orderId }) });
        // const { next_redirect_pc_url } = await res.json();
        // window.location.href = next_redirect_pc_url;
        // ────────────────────────────────────────────

        // 현재: 데모 시뮬레이션 (3초 후 성공)
        await new Promise(r => setTimeout(r, 2800));

        // 데모 성공 → /payment/success로 이동 (실제 결제 시 PG사가 리다이렉트)
        router.push(
            `/payment/success?orderId=${orderId}&amount=990&paymentKey=DEMO_${Date.now()}&returnTo=${encodeURIComponent(returnTo)}`
        );
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
            color: "#0064FF",
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
            color: "#FFE812",
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
            color: "#666",
        },
    ];

    if (step === "processing") {
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
                        <p className="text-sm text-[#fef9f0]/50 mt-1">{selected === "kakaopay" ? "카카오페이" : selected === "tosspay" ? "토스페이" : "카드"}로 연결 중이에요...</p>
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
                    결제 시 이용약관에 동의하는 것으로 간주됩니다.<br />
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
