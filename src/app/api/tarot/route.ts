import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { question, cards, prompt } = await req.json();
    const finalQuestion = question || prompt || '나의 운명';

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response('신당의 열쇠(API 키)가 설정되지 않았소.', { status: 500 });
    }

    // [핵심] v1beta의 불안정성을 피하기 위해 baseURL을 v1 정식 버전으로 강제 지정
    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
      baseURL: 'https://generativelanguage.googleapis.com/v1',
    });

    const cardInfo = (cards || [])
      .map((c: any, i: number) => `${i + 1}. ${c.name}(${c.orientation}): ${c.meaning}`)
      .join('\n');

    const result = await streamText({
      model: google('gemini-1.5-flash'), // 정식 버전에서는 이 이름이 표준이다
      system:
        "당신은 200년 된 신당의 무녀 '월하'입니다. 서늘하고 카리스마 있는 사극 톤(~하오, ~소)으로 점괘를 읊으시오.",
      prompt: `[질문]: ${finalQuestion}\n\n[카드 정보]:\n${cardInfo}\n\n이 운명의 타래를 풀어 점괘를 내어주시오.`,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('--- [제미나이 최종 비상] ---', error);
    return new Response(`무당의 기운이 꼬였소: ${error.message}`, { status: 500 });
  }
}
