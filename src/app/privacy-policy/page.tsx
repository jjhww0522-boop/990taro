import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 월하 타로",
  description: "월하 타로의 개인정보 수집·이용, 쿠키, 제3자 제공(AdSense/Analytics) 정책 안내",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12 text-[#DCD8C0]">
      <h1 className="mb-6 text-3xl">개인정보처리방침</h1>
      <div className="space-y-6 leading-relaxed text-[#E6DDC8]">
        <section>
          <h2 className="mb-2 text-xl">1. 수집 항목</h2>
          <p>본 서비스는 이메일, IP 주소, 결제 정보(거래 식별자, 결제 상태)를 수집할 수 있습니다.</p>
        </section>
        <section>
          <h2 className="mb-2 text-xl">2. 이용 목적</h2>
          <p>회원 문의 대응, 서비스 운영/보안, 결제 검증, 부정 이용 방지, 품질 개선을 위해 이용합니다.</p>
        </section>
        <section>
          <h2 className="mb-2 text-xl">3. 제3자 제공 및 처리 위탁</h2>
          <p>광고 및 트래픽 분석을 위해 Google AdSense, Google Analytics 등 제3자 도구를 사용할 수 있습니다.</p>
          <p>결제 처리 과정에서 결제 서비스 제공자(PG)에 필요한 정보가 전달될 수 있습니다.</p>
        </section>
        <section>
          <h2 className="mb-2 text-xl">4. 쿠키 정책</h2>
          <p>서비스는 로그인 상태 유지, 통계 분석, 맞춤 광고 제공을 위해 쿠키를 사용할 수 있습니다.</p>
          <p>이용자는 브라우저 설정으로 쿠키 저장을 거부하거나 삭제할 수 있습니다.</p>
        </section>
        <section>
          <h2 className="mb-2 text-xl">5. 보관 및 파기</h2>
          <p>관련 법령 또는 서비스 운영 목적 달성 시점까지 보관하며, 목적 달성 후 지체 없이 파기합니다.</p>
        </section>
      </div>
    </main>
  );
}
