import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용약관 | 별빛 타로",
  description: "별빛 타로 서비스 이용 조건, 책임 제한, 환불 정책 안내",
};

const Section = ({ num, title, children }: { num: string; title: string; children: React.ReactNode }) => (
  <section className="border-b border-[#e8c96a]/10 pb-6 last:border-0">
    <h2 className="text-[#ffd98e] text-lg font-semibold mb-3">
      <span className="text-[#e8c96a]/60 text-sm mr-2">{num}.</span>{title}
    </h2>
    <div className="text-[#fef9f0]/70 text-sm leading-[1.9] space-y-2">{children}</div>
  </section>
);

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-14 text-[#fef9f0]">
      {/* 헤더 */}
      <div className="mb-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[#e8c96a]/60 hover:text-[#e8c96a] text-sm mb-6 transition-colors">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          별빛 타로 홈으로
        </Link>
        <p className="text-[#e8c96a]/60 text-xs tracking-widest uppercase mb-2">Legal</p>
        <h1 className="text-3xl font-bold text-[#ffd98e] mb-3">이용약관</h1>
        <p className="text-[#fef9f0]/40 text-sm">최종 수정일: 2026년 3월 3일 · 별빛 타로</p>
      </div>

      <div className="rounded-2xl border border-[#e8c96a]/15 bg-[#0f1419]/60 backdrop-blur-xl p-8 space-y-8">
        <Section num="1" title="약관의 목적">
          <p>본 약관은 별빛 타로(이하 "서비스")가 제공하는 AI 타로 리딩 서비스의 이용 조건 및 절차, 이용자와 서비스 운영자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>
        </Section>

        <Section num="2" title="서비스의 성격 및 면책">
          <p>별빛 타로의 타로 결과는 <strong className="text-[#fef9f0]/90">오락 및 자기 탐색 목적</strong>으로 제공됩니다. 실제 미래를 예언하거나 법적·의학적·금융적 효력을 가지지 않습니다.</p>
          <p>서비스 결과를 중요한 의사결정의 유일한 근거로 삼는 행위에 대해 서비스는 책임을 지지 않습니다.</p>
        </Section>

        <Section num="3" title="이용자의 의무">
          <ul className="list-disc list-inside space-y-1 text-[#fef9f0]/60">
            <li>타인의 개인정보, 사생활을 침해하는 내용의 질문 입력 금지</li>
            <li>서비스 운영을 방해하거나 시스템에 부하를 주는 행위 금지</li>
            <li>自動化 도구(봇, 스크래퍼 등)를 이용한 반복 요청 금지</li>
            <li>만 14세 미만 이용자는 보호자의 동의 후 이용 가능</li>
          </ul>
        </Section>

        <Section num="4" title="무료 이용 제한">
          <p>무료 이용자는 매일 1회 타로 리딩과 AI 대화 2회가 제공됩니다. 제한은 한국 표준시(KST) 자정 기준으로 초기화됩니다.</p>
        </Section>

        <Section num="5" title="프리미엄 이용권 및 결제">
          <p>프리미엄 이용권(990원/24시간)은 결제 완료 즉시 활성화되며, 결제일로부터 24시간 동안 유효합니다.</p>
          <p>이용권은 특정 기기/브라우저에 연결되어 제공되며, 계정 이전은 지원하지 않습니다.</p>
        </Section>

        <Section num="6" title="환불 정책">
          <p>디지털 콘텐츠의 특성상 이용권 활성화(타로 리딩 열람) 이후에는 청약 철회 및 환불이 제한됩니다.</p>
          <p>다만 다음의 경우 관련 법령에 따라 처리합니다.</p>
          <ul className="list-disc list-inside space-y-1 text-[#fef9f0]/60">
            <li>결제 후 서비스를 전혀 이용하지 못한 경우</li>
            <li>이중 결제 등 결제 오류가 발생한 경우</li>
          </ul>
          <p>환불 문의: support@990taro.com</p>
        </Section>

        <Section num="7" title="서비스 변경·중단">
          <p>서비스 운영자는 서비스 개선, 천재지변, 시스템 점검 등 불가피한 사유로 서비스를 일시 중단하거나 내용을 변경할 수 있습니다. 중요 변경 사항은 서비스 내 공지를 통해 사전 안내합니다.</p>
        </Section>

        <Section num="8" title="책임의 한계">
          <p>서비스는 이용자가 타로 결과를 기반으로 내린 의사결정의 결과에 대해 법적 책임을 지지 않습니다. 모든 콘텐츠는 AI가 생성한 것으로, 특정 결과를 보장하지 않습니다.</p>
        </Section>

        <Section num="9" title="분쟁 해결">
          <p>서비스 이용과 관련하여 분쟁이 발생할 경우, 대한민국 법을 준거법으로 하며, 관할 법원은 서울중앙지방법원으로 합니다.</p>
        </Section>
      </div>
    </main>
  );
}
