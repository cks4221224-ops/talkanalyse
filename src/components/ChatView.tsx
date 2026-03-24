'use client';

import type { Message } from '@/lib/parser/types';
import type { SentimentResult, TermResult } from '@/lib/ai/types';
import TermPopover from './TermPopover';

interface Props {
  messages: Message[];
  sentiments: SentimentResult[];
  terms: TermResult[];
}

const SENTIMENT_COLORS: Record<string, string> = {
  positive: 'border-l-green-400',
  negative: 'border-l-red-400',
  neutral: 'border-l-gray-200',
};

function highlightTerms(content: string, messageIndex: number, terms: TermResult[]): React.ReactNode {
  const relevantTerms = terms.filter((t) => t.messageIndices.includes(messageIndex));
  if (relevantTerms.length === 0) return content;

  // 용어를 긴 순서대로 정렬 (겹침 방지)
  const sorted = [...relevantTerms].sort((a, b) => b.term.length - a.term.length);

  const parts: React.ReactNode[] = [];
  let remaining = content;
  let key = 0;

  while (remaining.length > 0) {
    let earliest = -1;
    let matchedTerm: TermResult | null = null;
    let matchIndex = Infinity;

    for (const term of sorted) {
      const idx = remaining.indexOf(term.term);
      if (idx !== -1 && idx < matchIndex) {
        matchIndex = idx;
        matchedTerm = term;
        earliest = idx;
      }
    }

    if (earliest === -1 || !matchedTerm) {
      parts.push(remaining);
      break;
    }

    if (earliest > 0) {
      parts.push(remaining.slice(0, earliest));
    }

    parts.push(
      <TermPopover key={key++} term={matchedTerm.term} explanation={matchedTerm.explanation}>
        {matchedTerm.term}
      </TermPopover>,
    );

    remaining = remaining.slice(earliest + matchedTerm.term.length);
  }

  return <>{parts}</>;
}

export default function ChatView({ messages, sentiments, terms }: Props) {
  const sentimentMap = new Map(sentiments.map((s) => [s.messageIndex, s]));

  // 텍스트 메시지만 표시 (최대 200개)
  const textMessages = messages
    .map((m, i) => ({ ...m, originalIndex: i }))
    .filter((m) => m.type === 'text')
    .slice(0, 200);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        대화 뷰 (감정 + 용어 설명)
      </h3>
      <p className="text-xs text-gray-400 mb-3">
        밑줄 표시된 용어를 클릭하면 설명을 볼 수 있습니다
      </p>
      <div className="max-h-[500px] overflow-y-auto space-y-1">
        {textMessages.map((msg) => {
          const sentiment = sentimentMap.get(msg.originalIndex);
          const borderColor = sentiment
            ? SENTIMENT_COLORS[sentiment.sentiment]
            : 'border-l-gray-200';

          return (
            <div
              key={msg.originalIndex}
              className={`border-l-2 ${borderColor} pl-3 py-1`}
            >
              <span className="text-xs font-medium text-gray-600">{msg.sender}</span>
              <span className="text-xs text-gray-400 ml-2">
                {msg.timestamp.getHours()}:{String(msg.timestamp.getMinutes()).padStart(2, '0')}
              </span>
              <p className="text-sm text-gray-800 mt-0.5">
                {highlightTerms(msg.content, msg.originalIndex, terms)}
              </p>
            </div>
          );
        })}
      </div>
      {messages.filter((m) => m.type === 'text').length > 200 && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          처음 200개 메시지만 표시됩니다
        </p>
      )}
    </div>
  );
}
