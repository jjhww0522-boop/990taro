"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense } from "react";

function FailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const message = searchParams.get("message") ?? "결제가 취소되었거나 실패했어요.";

    return (
        <main className="min-h-screen bg-[#0c1020] text-[#fef9f0] flex flex-col items-center justify-center px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6 text-center max-w-sm">
                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-4xl">😔</div>
                <div>
                    <p className="text-xl font-bold text-red-400 mb-2">결제 실패</p>
                    <p className="text-[#fef9f0]/50 text-sm leading-relaxed">{message}</p>
                </div>
                <div className="flex flex-col gap-3 w-full">
                    <button onClick={() => router.push("/payment")} className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#e8c96a] to-[#f0d97a] text-[#0c1020] font-bold text-[14px]">
                        다시 시도하기
                    </button>
                    <button onClick={() => router.back()} className="w-full py-3 rounded-xl border border-white/15 text-[#fef9f0]/50 text-[13px] hover:text-[#fef9f0] transition-all">
                        돌아가기
                    </button>
                </div>
            </motion.div>
        </main>
    );
}

export default function PaymentFailPage() {
    return <Suspense><FailContent /></Suspense>;
}
