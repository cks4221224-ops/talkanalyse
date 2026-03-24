'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { DailyActivity } from '@/lib/analysis/types';

interface Props {
  data: DailyActivity[];
}

export default function DailyChart({ data }: Props) {
  // 월~일 순서로 정렬
  const reordered = [...data.slice(1), data[0]];
  const chartData = reordered.map((d) => ({
    day: d.dayName,
    count: d.count,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">요일별 활동량</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="메시지 수" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
