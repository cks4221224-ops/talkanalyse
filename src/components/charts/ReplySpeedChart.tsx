'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { ReplySpeed } from '@/lib/analysis/types';

interface Props {
  data: ReplySpeed[];
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}초`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}분`;
  return `${(seconds / 3600).toFixed(1)}시간`;
}

export default function ReplySpeedChart({ data }: Props) {
  const chartData = data.map((d) => ({
    name: d.name,
    평균: Math.round(d.averageSeconds / 60),
    중앙값: Math.round(d.medianSeconds / 60),
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">평균 답장 속도 (분)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={60} />
          <Tooltip formatter={(value) => [`${value}분`]} />
          <Bar dataKey="평균" fill="#f59e0b" radius={[0, 4, 4, 0]} />
          <Bar dataKey="중앙값" fill="#10b981" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
        {data.map((d) => (
          <div key={d.name} className="flex justify-between">
            <span>{d.name}</span>
            <span>
              평균 {formatTime(d.averageSeconds)} / 최대 {formatTime(d.maxSeconds)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
