'use client';

interface Props {
  data: number[][]; // [day(0~6)][hour(0~23)]
}

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

function getColor(value: number, max: number): string {
  if (max === 0) return '#f3f4f6';
  const ratio = value / max;
  if (ratio === 0) return '#f3f4f6';
  if (ratio < 0.25) return '#dbeafe';
  if (ratio < 0.5) return '#93c5fd';
  if (ratio < 0.75) return '#3b82f6';
  return '#1d4ed8';
}

export default function HeatmapChart({ data }: Props) {
  // 월~일 순서로 재정렬 (data: 0=일, 1=월 → 월=1, 화=2, ..., 일=0)
  const reordered = [...data.slice(1), data[0]];
  const max = Math.max(...reordered.flat());

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">활동 히트맵 (요일 x 시간)</h3>
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* 시간 헤더 */}
          <div className="flex ml-8">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="flex-1 text-center text-[10px] text-gray-400">
                {i % 3 === 0 ? `${i}` : ''}
              </div>
            ))}
          </div>
          {/* 히트맵 행 */}
          {reordered.map((row, dayIdx) => (
            <div key={dayIdx} className="flex items-center">
              <div className="w-8 text-xs text-gray-500 text-right pr-2">{DAY_LABELS[dayIdx]}</div>
              <div className="flex flex-1 gap-[1px]">
                {row.map((count, hour) => (
                  <div
                    key={hour}
                    className="flex-1 aspect-square rounded-sm transition-colors"
                    style={{ backgroundColor: getColor(count, max) }}
                    title={`${DAY_LABELS[dayIdx]} ${hour}시: ${count}개`}
                  />
                ))}
              </div>
            </div>
          ))}
          {/* 범례 */}
          <div className="flex items-center justify-end mt-2 gap-1 text-[10px] text-gray-400">
            <span>적음</span>
            {['#f3f4f6', '#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8'].map((color) => (
              <div
                key={color}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
            ))}
            <span>많음</span>
          </div>
        </div>
      </div>
    </div>
  );
}
