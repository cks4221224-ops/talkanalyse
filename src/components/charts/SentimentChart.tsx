'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import type { SentimentResult } from '@/lib/ai/types';

interface Props {
  data: SentimentResult[];
}

export default function SentimentChart({ data }: Props) {
  // 10개 단위로 이동 평균
  const windowSize = Math.min(10, Math.max(1, Math.floor(data.length / 20)));
  const smoothed = data.map((_, i) => {
    const start = Math.max(0, i - windowSize);
    const end = Math.min(data.length, i + windowSize + 1);
    const slice = data.slice(start, end);
    const avg = slice.reduce((sum, d) => sum + d.score, 0) / slice.length;
    return { index: i, score: parseFloat(avg.toFixed(2)) };
  });

  // 감정 분포
  const positive = data.filter((d) => d.sentiment === 'positive').length;
  const negative = data.filter((d) => d.sentiment === 'negative').length;
  const neutral = data.filter((d) => d.sentiment === 'neutral').length;
  const total = data.length || 1;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">감정 분석</h3>

      {/* 감정 분포 바 */}
      <div className="flex gap-3 mb-4 text-xs">
        <span className="text-green-600">긍정 {Math.round((positive / total) * 100)}%</span>
        <span className="text-gray-500">중립 {Math.round((neutral / total) * 100)}%</span>
        <span className="text-red-500">부정 {Math.round((negative / total) * 100)}%</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden mb-6">
        <div className="bg-green-400" style={{ width: `${(positive / total) * 100}%` }} />
        <div className="bg-gray-300" style={{ width: `${(neutral / total) * 100}%` }} />
        <div className="bg-red-400" style={{ width: `${(negative / total) * 100}%` }} />
      </div>

      {/* 감정 추이 그래프 */}
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={smoothed}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="index" tick={false} />
          <YAxis domain={[-1, 1]} tick={{ fontSize: 10 }} ticks={[-1, -0.5, 0, 0.5, 1]} />
          <Tooltip
            formatter={(value) => [Number(value).toFixed(2), '감정 점수']}
            labelFormatter={(label) => `메시지 #${label}`}
          />
          <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
          <defs>
            <linearGradient id="sentimentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#f3f4f6" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="score"
            stroke="#6366f1"
            fill="url(#sentimentGrad)"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-gray-400 mt-2 text-center">
        ← 대화 시작 · · · 대화 끝 → (이동 평균)
      </p>
    </div>
  );
}
