'use client';

export default function Disclaimer() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
      <p className="font-medium mb-1">개인정보 보호 안내</p>
      <ul className="list-disc list-inside text-xs text-blue-700 space-y-0.5">
        <li>업로드된 대화 파일은 브라우저에서만 처리되며, 서버에 저장되지 않습니다.</li>
        <li>AI 감정 분석 시 대화 내용이 Claude API로 전송되며, 분석 완료 후 즉시 폐기됩니다.</li>
        <li>감정 분석 및 개념 설명은 AI 참고 의견이며, 100% 정확도를 보장하지 않습니다.</li>
      </ul>
    </div>
  );
}
