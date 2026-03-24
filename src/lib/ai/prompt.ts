import type { Message } from '@/lib/parser/types';

export function buildAnalysisPrompt(messages: { index: number; sender: string; content: string }[]): string {
  const msgLines = messages
    .map((m) => `[${m.index}] ${m.sender}: ${m.content}`)
    .join('\n');

  return `다음은 카카오톡 대화 메시지 목록입니다. 각 메시지를 분석하여 아래 두 가지를 JSON으로 반환해 주세요.

1. **감정 분석(sentiments)**: 각 메시지의 감정을 분석합니다.
   - messageIndex: 메시지 번호 (대괄호 안의 숫자)
   - sentiment: "positive" | "negative" | "neutral"
   - score: -1.0(매우 부정) ~ 1.0(매우 긍정)

2. **어려운 용어(terms)**: 대화에서 일반인이 이해하기 어려운 전문용어, 신조어, 약어가 있으면 추출합니다.
   - term: 용어
   - explanation: 쉬운 설명 (한국어, 2문장 이내)
   - messageIndices: 해당 용어가 등장하는 메시지 번호 배열

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.

{
  "sentiments": [
    { "messageIndex": 0, "sentiment": "neutral", "score": 0.0 }
  ],
  "terms": [
    { "term": "예시", "explanation": "설명", "messageIndices": [0] }
  ]
}

대화:
${msgLines}`;
}

export function prepareMessages(
  messages: Message[],
  startIndex: number,
): { index: number; sender: string; content: string }[] {
  return messages
    .filter((m) => m.type === 'text')
    .map((m, i) => ({
      index: startIndex + i,
      sender: m.sender,
      content: m.content,
    }));
}
