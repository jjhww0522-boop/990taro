import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 별빛 타로",
  description: "별빛 타로의 개인정보 수집·이용, 쿠키, 제3자 제공(AdSense/Analytics) 정책 안내",
};

const Section = ({ num, title, children }: { num: string; title: string; children: React.ReactNode }) => (
  <section className="border-b border-[#e8c96a]/10 pb-6 last:border-0">
    <h2 className="text-[#ffd98e] text-lg font-semibold mb-3">
      <span className="text-[#e8c96a]/60 text-sm mr-2">{num}.</span>{title}
    </h2>
    <div className="text-[#fef9f0]/70 text-sm leading-[1.9] space-y-2">{children}</div>
  </section>
);

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-14 text-[#fef9f0]">
      {/* 헤더 */}
      <div className="mb-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[#e8c96a]/60 hover:text-[#e8c96a] text-sm mb-6 transition-colors">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          별빛 타로 홈으로
        </Link>
        <p className="text-[#e8c96a]/60 text-xs tracking-widest uppercase mb-2">Legal</p>
        <h1 className="text-3xl font-bold text-[#ffd98e] mb-3">개인정보처리방침</h1>
        <p className="text-[#fef9f0]/40 text-sm">최종 수정일: 2026년 3월 3일 · 별빛 타로</p>
      </div>

      <div className="rounded-2xl border border-[#e8c96a]/15 bg-[#0f1419]/60 backdrop-blur-xl p-8 space-y-8">
        <Section num="1" title="수집하는 개인정보 항목">
          <p>별빛 타로는 서비스 이용 과정에서 아래 정보를 수집할 수 있습니다.</p>
          <ul className="list-disc list-inside space-y-1 text-[#fef9f0]/60">
            <li>서비스 이용 기록 (페이지 방문, 타로 리딩 횟수)</li>
            <li>기기 식별 정보 (브라우저 생성 임시 기기 ID – 로그인 없이 이용 제한 적용에 사용)</li>
            <li>IP 주소 (부정 이용 방지용)</li>
            <li>결제 정보 (결제 진행 시 거래 식별자 및 결제 상태)</li>
          </ul>
          <p>회원 가입 없이 이용 가능하며, 이름·이메일 등 실명 정보는 수집하지 않습니다.</p>
        </Section>

        <Section num="2" title="개인정보 이용 목적">
          <ul className="list-disc list-inside space-y-1 text-[#fef9f0]/60">
            <li>무료 이용 횟수 제한 관리</li>
            <li>결제 완료 여부 확인 및 프리미엄 서비스 제공</li>
            <li>부정 이용 및 어뷰징 방지</li>
            <li>서비스 품질 개선 (통계 분석)</li>
          </ul>
        </Section>

        <Section num="3" title="개인정보 보유·이용 기간">
          <p>기기 식별 ID: 브라우저 재설정 시 소멸 (서버 미저장)</p>
          <p>결제 정보: 관련 법령(전자상거래 등에서의 소비자 보호에 관한 법률 등) 에 따른 의무 보존 기간까지 보관 후 파기합니다.</p>
        </Section>

        <Section num="4" title="제3자 제공 및 처리 위탁">
          <p>별빛 타로는 아래 서비스를 이용하며, 해당 서비스의 개인정보처리방침을 따릅니다.</p>
          <ul className="list-disc list-inside space-y-1 text-[#fef9f0]/60">
            <li><strong className="text-[#fef9f0]/80">Google AdSense</strong> – 맞춤 광고 제공 (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener" className="underline hover:text-[#e8c96a]">Google 개인정보처리방침</a>)</li>
            <li><strong className="text-[#fef9f0]/80">Google Analytics</strong> – 트래픽 분석 (익명 통계)</li>
            <li><strong className="text-[#fef9f0]/80">OpenAI API</strong> – AI 타로 해석 생성 (질문 내용은 API 처리 후 즉시 폐기, 저장하지 않음)</li>
            <li><strong className="text-[#fef9f0]/80">Vercel</strong> – 서비스 호스팅</li>
          </ul>
        </Section>

        <Section num="5" title="쿠키 및 로컬 스토리지 사용">
          <p>서비스는 이용 횟수 관리 및 프리미엄 인증을 위해 브라우저 <strong className="text-[#fef9f0]/80">로컬 스토리지</strong>를 사용합니다. 서버에 개인 데이터를 저장하지 않습니다.</p>
          <p>Google AdSense는 광고 최적화를 위해 쿠키를 사용할 수 있습니다. 브라우저 설정에서 쿠키를 거부하거나 삭제할 수 있습니다.</p>
        </Section>

        <Section num="6" title="이용자의 권리">
          <p>이용자는 언제든지 브라우저 로컬 스토리지를 초기화하여 기기 ID 및 수집 카드 정보를 삭제할 수 있습니다.</p>
          <p>추가 문의사항은 아래 연락처로 요청 주세요.</p>
        </Section>

        <Section num="7" title="개인정보 보호책임자">
          <p>운영자: 별빛 타로 서비스팀</p>
          <p>이메일: support@990taro.com</p>
        </Section>

        <Section num="8" title="방침 변경 안내">
          <p>본 방침이 변경될 경우, 변경 내용을 서비스 내 공지사항을 통해 사전 안내합니다.</p>
        </Section>
      </div>
    </main>
  );
}
