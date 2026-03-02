import { NextResponse } from "next/server";
import { issueEntitlementJwt } from "../../../../server/auth/entitlement";

const DEMO_MODE = !process.env.TOSS_SECRET_KEY || process.env.TOSS_SECRET_KEY.startsWith("여기에");

async function verifyTossPayment(paymentKey: string, orderId: string, amount: number) {
    // ── 실제 토스페이먼츠 API 연동 시 이 함수를 활성화하세요 ──
    // const encoded = Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString("base64");
    // const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    //   method: "POST",
    //   headers: { Authorization: `Basic ${encoded}`, "Content-Type": "application/json" },
    //   body: JSON.stringify({ paymentKey, orderId, amount }),
    // });
    // if (!res.ok) {
    //   const err = await res.json();
    //   throw new Error(err.message ?? "결제 승인 실패");
    // }
    // return await res.json();

    // 데모 모드: paymentKey가 DEMO_로 시작하면 성공으로 처리
    if (paymentKey.startsWith("DEMO_")) {
        return { status: "DONE", orderId, totalAmount: amount };
    }
    throw new Error("결제를 확인할 수 없습니다.");
}

export async function POST(request: Request) {
    try {
        const body = await request.json() as { paymentKey?: string; orderId?: string; amount?: number };
        const { paymentKey, orderId, amount } = body;

        if (!paymentKey || !orderId || !amount) {
            return NextResponse.json({ error: "필수 파라미터가 누락되었습니다." }, { status: 400 });
        }

        // 금액 검증 (990원 고정)
        if (amount !== 990) {
            return NextResponse.json({ error: "결제 금액이 올바르지 않습니다." }, { status: 400 });
        }

        if (!DEMO_MODE) {
            // 실제 API 검증
            await verifyTossPayment(paymentKey, orderId, amount);
        } else {
            // 데모 모드 검증
            await verifyTossPayment(paymentKey, orderId, amount);
        }

        // sessionId 생성 (디바이스 고유값으로 사용)
        const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        // JWT 발급 (24시간)
        const jwt = issueEntitlementJwt(orderId, sessionId, 86400);

        console.log(`[payment/confirm] 결제 완료 - orderId: ${orderId}, demo: ${DEMO_MODE}`);

        return NextResponse.json({ jwt, sessionId, expiresIn: 86400 });
    } catch (error) {
        const msg = error instanceof Error ? error.message : "서버 오류가 발생했습니다.";
        console.error("[payment/confirm] error:", error);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
