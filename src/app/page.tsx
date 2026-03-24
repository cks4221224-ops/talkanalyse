'use client';

import { useFileParser } from '@/hooks/useFileParser';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import FileUpload from '@/components/FileUpload';
import Dashboard from '@/components/Dashboard';
import Disclaimer from '@/components/Disclaimer';

export default function Home() {
  const { parsedChat, analysis, isLoading, error, sizeInfo, isSampled, handleFile, reset } =
    useFileParser();
  const { aiResult, isAnalyzing, progress, error: aiError, analyze } = useAIAnalysis();

  const handleReset = () => {
    reset();
  };

  const handleAnalyze = () => {
    if (parsedChat) {
      analyze(parsedChat.messages);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">💬 TalkAnalyse</h1>
          <span className="text-xs text-gray-400">카카오톡 대화분석기</span>
        </div>
      </header>

      <main className="px-4 py-8">
        {parsedChat && analysis ? (
          <div className="max-w-5xl mx-auto space-y-4">
            {isSampled && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                대용량 파일이므로 시간대별 균등 샘플링이 적용되었습니다. 전체 추세는 유지되지만
                개별 수치는 실제와 다를 수 있습니다.
              </div>
            )}
            <Dashboard
              chat={parsedChat}
              analysis={analysis}
              aiResult={aiResult}
              isAnalyzing={isAnalyzing}
              aiProgress={progress}
              aiError={aiError}
              onAnalyze={handleAnalyze}
              onReset={handleReset}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800">카카오톡 대화를 분석해보세요</h2>
              <p className="text-gray-500 mt-2">
                대화 패턴, 답장 속도, 활동 시간대를 한눈에 확인할 수 있습니다
              </p>
            </div>
            <FileUpload onFileSelect={handleFile} isLoading={isLoading} error={error} />
            {sizeInfo && sizeInfo.message && (
              <div className="mt-4 max-w-xl w-full p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                {sizeInfo.message}
              </div>
            )}
            <div className="mt-8 max-w-xl w-full">
              <Disclaimer />
            </div>
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-gray-400">
        업로드된 대화는 브라우저에서만 처리되며, 서버에 저장되지 않습니다.
      </footer>
    </div>
  );
}
