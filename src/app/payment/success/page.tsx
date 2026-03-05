"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId") ?? "";
    const amount = searchParams.get("amount") ?? "990";
    const paymentKey = searchParams.get("paymentKey") ?? "";
    const returnTo = searchParams.get("returnTo") ?? "/result";

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!orderId || !paymentKey) { setStatus("error"); setMessage("결제 정보가 올바르지 않아요."); return; }

        (async () => {
            try {
                const res = await fetch("/tarot/api/payment/confirm", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId, amount: Number(amount), paymentKey }),
                });
                const data = await res.json() as { jwt?: string; error?: string };
                if (!res.ok) throw new Error(data.error ?? "확인 실패");
                if (data.jwt) {
                    localStorage.setItem("entitlementJwt", data.jwt);
                    localStorage.setItem("premiumUntil", String(Date.now() + 24 * 60 * 60 * 1000));
                }
                setStatus("success");
            } catch (e) {
                setStatus("error");
                setMessage((e as Error).message);
            }
        })();
    }, [orderId, amount, paymentKey, returnTo]);

    return (
        <main className="min-h-screen bg-[#0c1020] text-[#fef9f0] flex flex-col items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6 text-center max-w-sm">

                {status === "loading" && (
                    <>
                        <div className="relative w-20 h-20">
                            <div className="absolute inset-0 rounded-full border-4 border-[#e8c96a]/20" />
                            <div className="absolute inset-0 rounded-full border-4 border-t-[#e8c96a] animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center text-2xl">✨</div>
                        </div>
                        <p className="text-[#ffd98e] font-semibold text-lg">결제 확인 중...</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }} className="w-24 h-24 rounded-full bg-[#e8c96a]/15 border border-[#e8c96a]/40 flex items-center justify-center text-5xl">
                            ✨
                        </motion.div>
                        <div>
                            <p className="text-2xl font-bold text-[#ffd98e] mb-2">결제 완료!</p>
                            <p className="text-[#fef9f0]/60 text-sm leading-relaxed">
                                별빛 타로 프리미엄이 활성화되었어요.<br />
                                24시간 동안 5회 상담을 마음껏 이용하세요.
                            </p>
                        </div>
                        <div className="w-full rounded-xl bg-white/5 border border-white/8 p-4 text-left text-sm space-y-2">
                            <div className="flex justify-between"><span className="text-[#fef9f0]/40">결제 금액</span><span className="text-[#ffd98e] font-bold">{Number(amount).toLocaleString()}원</span></div>
                            <div className="flex justify-between"><span className="text-[#fef9f0]/40">주문번호</span><span className="text-[#fef9f0]/60 text-xs truncate max-w-[160px]">{orderId}</span></div>
                            <div className="flex justify-between"><span className="text-[#fef9f0]/40">이용 기간</span><span className="text-[#fef9f0]/70">결제 후 24시간</span></div>
                        </div>
                        <button
                            onClick={() => router.push(returnTo)}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#e8c96a] to-[#f0d97a] text-[#0c1020] font-bold text-[15px] hover:shadow-[0_0_30px_rgba(232,201,106,0.4)] transition-all"
                        >
                            타로 상담 시작하기 →
                        </button>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-4xl">⚠️</div>
                        <div>
                            <p className="text-xl font-bold text-red-400 mb-2">결제 확인 실패</p>
                            <p className="text-[#fef9f0]/50 text-sm">{message || "잠시 후 다시 시도해 주세요."}</p>
                        </div>
                        <button onClick={() => router.push("/payment")} className="w-full py-3 rounded-xl border border-white/15 text-[#fef9f0]/60 hover:text-[#fef9f0] text-sm transition-all">
                            다시 결제하기
                        </button>
                    </>
                )}
            </motion.div>
        </main>
    );
}

export default function PaymentSuccessPage() {
    return <Suspense><SuccessContent /></Suspense>;
}
