'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import type { ParticipantStats } from '@/lib/analysis/types';

interface Props {
  data: ParticipantStats[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#14b8a6'];

export default function ParticipantChart({ data }: Props) {
  const chartData = data.map((p) => ({
    name: p.name,
    value: p.messageCount,
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">참여자별 메시지 비율</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={90}
            dataKey="value"
            label={(props: PieLabelRenderProps) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value}개`, '메시지']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
