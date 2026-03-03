import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { question, cards, prompt } = await req.json();
    const finalQuestion = question || prompt || '나의 운명';

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response('별빛 연결(API 키)이 설정되지 않았어요.', { status: 500 });
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
        "당신은 밤하늘의 별빛처럼 따뜻한 타로 상담사 '별빛'이에요. 친근하고 다정한 해요체(~해요, ~에요)로 카드의 메시지를 전해 주세요. 희망적이고 구체적인 조언을 담아, 상담자가 용기를 얻을 수 있도록 해 주세요.",
      prompt: `[질문]: ${finalQuestion}\n\n[카드 정보]:\n${cardInfo}\n\n이 카드들이 전하는 메시지를 따뜻하게 풀어 주세요.`,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('--- [별빛 연결 오류] ---', error);
    return new Response(`별빛 연결에 문제가 생겼어요: ${error.message}`, { status: 500 });
  }
}
