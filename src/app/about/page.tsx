import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "서비스 소개 | 월하 타로",
  description: "무녀 청령과 월하 신당의 배경, 동양 타로 서비스의 목적과 철학",
};

export default function AboutPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12 text-[#DCD8C0]">
      <h1 className="mb-6 text-3xl">서비스 소개</h1>
      <div className="space-y-6 leading-relaxed text-[#E6DDC8]">
        <p>
          월하 타로는 고요한 밤의 신당에서 무녀 <strong>청령</strong>이 들려주는 동양식 점사 경험을 디지털로 옮긴 서비스입니다.
        </p>
        <p>
          우리는 단순한 결과 나열이 아니라, 과거·현재·미래의 흐름을 정갈한 언어로 해석해 마음을 정리할 수 있는 의식의 시간을 제공하고자 합니다.
        </p>
        <p>
          월하 신당의 탄생 배경은 현대의 빠른 일상 속에서도 잠시 멈추어 자신을 돌아보는 공간이 필요하다는 문제의식에서 출발했습니다.
        </p>
        <p>
          월하 타로의 목적은 불안을 키우는 예언이 아니라, 스스로의 선택을 더 또렷하게 만드는 통찰을 전하는 데 있습니다.
        </p>
      </div>
    </main>
  );
}
