'use client';

interface Props {
  progress: number;
  label?: string;
}

export default function ProgressBar({ progress, label }: Props) {
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-600">{label}</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 text-right">{progress}%</p>
    </div>
  );
}
