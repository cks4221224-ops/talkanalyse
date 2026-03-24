'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { HourlyActivity } from '@/lib/analysis/types';

interface Props {
  data: HourlyActivity[];
}

export default function HourlyChart({ data }: Props) {
  const chartData = data.map((d) => ({
    hour: `${d.hour}시`,
    count: d.count,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">시간대별 활동량</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={2} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="메시지 수" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
