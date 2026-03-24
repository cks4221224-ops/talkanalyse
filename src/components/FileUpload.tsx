'use client';

import { useCallback, useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

export default function FileUpload({ onFileSelect, isLoading, error }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect],
  );

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${isLoading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".txt"
          onChange={handleChange}
          className="hidden"
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 text-sm">대화를 분석하고 있습니다...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="text-4xl">💬</div>
            <p className="text-gray-700 font-medium">
              카카오톡 대화 파일을 드래그하거나 클릭하세요
            </p>
            <p className="text-gray-400 text-sm">.txt 파일 (최대 100MB)</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="mt-6 text-center">
        <details className="text-sm text-gray-400">
          <summary className="cursor-pointer hover:text-gray-600">
            카카오톡 대화 내보내기 방법
          </summary>
          <div className="mt-2 text-left bg-gray-50 rounded-lg p-4 space-y-1">
            <p>1. 카카오톡 앱에서 채팅방 열기</p>
            <p>2. 우측 상단 ≡ 메뉴 탭</p>
            <p>3. 하단 설정(⚙️) → 대화 내보내기</p>
            <p>4. 저장된 .txt 파일을 여기에 업로드</p>
          </div>
        </details>
      </div>
    </div>
  );
}
