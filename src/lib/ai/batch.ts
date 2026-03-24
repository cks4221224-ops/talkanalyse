import type { Message } from '@/lib/parser/types';
import type { AIAnalysisResult, SentimentResult, TermResult } from './types';

const BATCH_SIZE = 50; // 메시지 50개씩 배치

export interface BatchInfo {
  messages: { index: number; sender: string; content: string }[];
  startIndex: number;
}

export function createBatches(messages: Message[]): BatchInfo[] {
  const textMessages = messages
    .map((m, i) => ({ ...m, originalIndex: i }))
    .filter((m) => m.type === 'text');

  const batches: BatchInfo[] = [];

  for (let i = 0; i < textMessages.length; i += BATCH_SIZE) {
    const batch = textMessages.slice(i, i + BATCH_SIZE);
    batches.push({
      messages: batch.map((m) => ({
        index: m.originalIndex,
        sender: m.sender,
        content: m.content,
      })),
      startIndex: i,
    });
  }

  return batches;
}

export function mergeBatchResults(results: AIAnalysisResult[]): AIAnalysisResult {
  const sentiments: SentimentResult[] = [];
  const termsMap = new Map<string, TermResult>();

  for (const result of results) {
    sentiments.push(...result.sentiments);

    for (const term of result.terms) {
      const existing = termsMap.get(term.term);
      if (existing) {
        existing.messageIndices = [
          ...new Set([...existing.messageIndices, ...term.messageIndices]),
        ];
      } else {
        termsMap.set(term.term, { ...term });
      }
    }
  }

  return {
    sentiments: sentiments.sort((a, b) => a.messageIndex - b.messageIndex),
    terms: Array.from(termsMap.values()),
  };
}
