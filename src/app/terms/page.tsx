import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 | 월하 타로",
  description: "월하 타로 서비스 이용 조건, 책임 제한, 환불 정책 안내",
};

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12 text-[#DCD8C0]">
      <h1 className="mb-6 text-3xl">이용약관</h1>
      <div className="space-y-6 leading-relaxed text-[#E6DDC8]">
        <section>
          <h2 className="mb-2 text-xl">1. 서비스 성격</h2>
          <p>
            본 서비스의 타로 결과는 오락 및 참고 목적이며, 실제 미래를 예언하거나 법적/의학적 효력을 가지지 않습니다.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-xl">2. 이용자의 책임</h2>
          <p>이용자는 타인의 권리를 침해하거나 서비스 운영을 방해하는 행위를 해서는 안 됩니다.</p>
        </section>
        <section>
          <h2 className="mb-2 text-xl">3. 결제 및 환불</h2>
          <p>
            디지털 콘텐츠 특성상 신탁(결과) 확인 후에는 환불이 불가합니다.
          </p>
          <p>다만 결제 오류 등 법령상 환불 사유가 인정되는 경우 관련 기준에 따라 처리합니다.</p>
        </section>
        <section>
          <h2 className="mb-2 text-xl">4. 책임 제한</h2>
          <p>서비스는 안정적 제공을 위해 노력하나, 불가항력적 장애에 대해 책임이 제한될 수 있습니다.</p>
        </section>
      </div>
    </main>
  );
}
