import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildAnalysisPrompt } from '@/lib/ai/prompt';
import type { AIAnalysisResult } from '@/lib/ai/types';

const anthropic = new Anthropic();

interface BatchRequest {
  messages: { index: number; sender: string; content: string }[];
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchRequest = await request.json();
    const { messages } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: '메시지가 없습니다.' }, { status: 400 });
    }

    const prompt = buildAnalysisPrompt(messages);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');

    // JSON 파싱 (```json ... ``` 래핑 제거)
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result: AIAnalysisResult = JSON.parse(jsonStr);

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI 분석 오류:', error);
    return NextResponse.json(
      { error: 'AI 분석 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
