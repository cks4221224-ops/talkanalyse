'use client';

import type { ParsedChat } from '@/lib/parser/types';
import type { AnalysisResult } from '@/lib/analysis/types';
import type { AIAnalysisResult } from '@/lib/ai/types';
import StatCard from './StatCard';
import HourlyChart from './charts/HourlyChart';
import DailyChart from './charts/DailyChart';
import ParticipantChart from './charts/ParticipantChart';
import HeatmapChart from './charts/HeatmapChart';
import ReplySpeedChart from './charts/ReplySpeedChart';
import SentimentChart from './charts/SentimentChart';
import ChatView from './ChatView';

interface Props {
  chat: ParsedChat;
  analysis: AnalysisResult;
  aiResult: AIAnalysisResult | null;
  isAnalyzing: boolean;
  aiProgress: number;
  aiError: string | null;
  onAnalyze: () => void;
  onReset: () => void;
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

export default function Dashboard({
  chat,
  analysis,
  aiResult,
  isAnalyzing,
  aiProgress,
  aiError,
  onAnalyze,
  onReset,
}: Props) {
  const topStarter = [...analysis.participantStats].sort(
    (a, b) => b.conversationStarts - a.conversationStarts,
  )[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {chat.title || '카카오톡 대화'} 분석 결과
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(analysis.dateRange.start)} ~ {formatDate(analysis.dateRange.end)} ({analysis.totalDays}일)
            · {chat.platform === 'android' ? 'Android' : 'iOS'} 포맷
          </p>
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          다시 분석하기
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="총 메시지" value={analysis.totalMessages.toLocaleString()} sub={`${analysis.totalDays}일간`} />
        <StatCard
          label="일 평균"
          value={Math.round(analysis.totalMessages / analysis.totalDays).toLocaleString()}
          sub="메시지/일"
        />
        <StatCard label="참여자" value={chat.participants.length} sub={chat.participants.join(', ')} />
        <StatCard
          label="대화 주도"
          value={topStarter?.name || '-'}
          sub={`${topStarter?.conversationStarts || 0}회 시작`}
        />
      </div>

      {/* 참여자별 상세 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {analysis.participantStats.map((p) => (
          <div key={p.name} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="font-semibold text-gray-800">{p.name}</p>
            <div className="mt-2 grid grid-cols-2 gap-y-1 text-sm text-gray-600">
              <span>메시지</span>
              <span className="text-right font-medium">{p.messageCount.toLocaleString()}개</span>
              <span>평균 길이</span>
              <span className="text-right font-medium">{p.averageLength}자</span>
              <span>사진/동영상</span>
              <span className="text-right font-medium">{p.mediaCount}개</span>
              <span>대화 시작</span>
              <span className="text-right font-medium">{p.conversationStarts}회</span>
            </div>
          </div>
        ))}
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ParticipantChart data={analysis.participantStats} />
        <ReplySpeedChart data={analysis.replySpeeds} />
        <HourlyChart data={analysis.hourlyActivity} />
        <DailyChart data={analysis.dailyActivity} />
      </div>

      {/* 히트맵 */}
      <HeatmapChart data={analysis.heatmap} />

      {/* AI 감정 분석 섹션 */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">AI 감정 분석 + 개념 설명</h3>
          {!aiResult && !isAnalyzing && (
            <button
              onClick={onAnalyze}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              AI 분석 시작
            </button>
          )}
        </div>

        {!aiResult && !isAnalyzing && !aiError && (
          <p className="text-sm text-gray-500">
            Claude API를 사용하여 대화의 감정과 어려운 용어를 분석합니다.
            <br />
            <span className="text-xs text-gray-400">
              * API 키 설정이 필요합니다 (ANTHROPIC_API_KEY 환경변수)
            </span>
          </p>
        )}

        {isAnalyzing && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600">AI 분석 중... {aiProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${aiProgress}%` }}
              />
            </div>
          </div>
        )}

        {aiError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {aiError}
          </div>
        )}

        {aiResult && (
          <div className="space-y-4">
            <SentimentChart data={aiResult.sentiments} />

            {aiResult.terms.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">추출된 용어 목록</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {aiResult.terms.map((term) => (
                    <div key={term.term} className="p-2 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-700">{term.term}</span>
                      <p className="text-xs text-gray-600 mt-0.5">{term.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <ChatView
              messages={chat.messages}
              sentiments={aiResult.sentiments}
              terms={aiResult.terms}
            />

            <p className="text-xs text-gray-400 text-center">
              * AI 분석 결과는 참고용이며, 100% 정확도를 보장하지 않습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
