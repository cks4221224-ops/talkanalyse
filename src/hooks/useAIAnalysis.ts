'use client';

import { useState, useCallback } from 'react';
import type { Message } from '@/lib/parser/types';
import type { AIAnalysisResult } from '@/lib/ai/types';
import { createBatches, mergeBatchResults } from '@/lib/ai/batch';

interface UseAIAnalysisReturn {
  aiResult: AIAnalysisResult | null;
  isAnalyzing: boolean;
  progress: number; // 0 ~ 100
  error: string | null;
  analyze: (messages: Message[]) => Promise<void>;
}

export function useAIAnalysis(): UseAIAnalysisReturn {
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (messages: Message[]) => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);
    setAiResult(null);

    try {
      const batches = createBatches(messages);
      const results: AIAnalysisResult[] = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: batch.messages }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `API 오류 (${res.status})`);
        }

        const batchResult: AIAnalysisResult = await res.json();
        results.push(batchResult);
        setProgress(Math.round(((i + 1) / batches.length) * 100));
      }

      const merged = mergeBatchResults(results);
      setAiResult(merged);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return { aiResult, isAnalyzing, progress, error, analyze };
}
