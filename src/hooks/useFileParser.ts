'use client';

import { useState, useCallback } from 'react';
import { parseKakaoTalk } from '@/lib/parser';
import { analyzeChat } from '@/lib/analysis/stats';
import { getSizeStrategy } from '@/lib/processing/sizeStrategy';
import { sampleMessages } from '@/lib/processing/sampler';
import type { ParsedChat } from '@/lib/parser/types';
import type { AnalysisResult } from '@/lib/analysis/types';
import type { SizeCategory } from '@/lib/processing/sizeStrategy';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

interface UseFileParserReturn {
  parsedChat: ParsedChat | null;
  analysis: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  sizeInfo: { category: SizeCategory; message: string } | null;
  isSampled: boolean;
  handleFile: (file: File) => Promise<void>;
  reset: () => void;
}

export function useFileParser(): UseFileParserReturn {
  const [parsedChat, setParsedChat] = useState<ParsedChat | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sizeInfo, setSizeInfo] = useState<{ category: SizeCategory; message: string } | null>(null);
  const [isSampled, setIsSampled] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setParsedChat(null);
    setAnalysis(null);
    setSizeInfo(null);
    setIsSampled(false);

    if (!file.name.endsWith('.txt')) {
      setError('.txt 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('100MB 이하의 파일만 업로드할 수 있습니다. 카카오톡에서 기간을 나눠 내보내기해 주세요.');
      return;
    }

    const strategy = getSizeStrategy(file.size);
    if (strategy.category === 'rejected') {
      setError(strategy.message);
      return;
    }

    if (strategy.message) {
      setSizeInfo({ category: strategy.category, message: strategy.message });
    }

    setIsLoading(true);

    try {
      const text = await file.text();
      const chat = parseKakaoTalk(text);

      if (chat.messages.length === 0) {
        setError('카카오톡 대화를 파싱할 수 없습니다. 카카오톡에서 내보낸 txt 파일인지 확인해 주세요.');
        return;
      }

      // 대용량 샘플링
      if (strategy.needsSampling) {
        chat.messages = sampleMessages(chat.messages);
        setIsSampled(true);
      }

      const result = analyzeChat(chat);
      setParsedChat(chat);
      setAnalysis(result);
    } catch {
      setError('파일을 처리하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setParsedChat(null);
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
    setSizeInfo(null);
    setIsSampled(false);
  }, []);

  return { parsedChat, analysis, isLoading, error, sizeInfo, isSampled, handleFile, reset };
}
