import type { Message, ParsedChat } from './types';

const DATE_LINE_PATTERN = /^-+ (\d{4})년 (\d{1,2})월 (\d{1,2})일 .+ -+$/;
const MSG_PATTERN = /^\[(.+?)\] \[(오전|오후) (\d{1,2}):(\d{2})\] (.+)/;
const MEDIA_PATTERNS = [
  '사진', '동영상', '파일', '음성메시지', '카카오톡 프로필',
  'Photo', 'Video', 'File', 'Voice Message',
];
const SYSTEM_PATTERNS = [
  '님이 들어왔습니다', '님이 나갔습니다', '님을 내보냈습니다',
  '채팅방 관리자가', '님이 그룹을',
];
const DELETED_PATTERN = /삭제된 메시지입니다\.?/;

function parseTime(ampm: string, hour: string, minute: string): { hour: number; minute: number } {
  let h = parseInt(hour, 10);
  if (ampm === '오후' && h !== 12) h += 12;
  if (ampm === '오전' && h === 12) h = 0;
  return { hour: h, minute: parseInt(minute, 10) };
}

function classifyContent(content: string): Message['type'] {
  if (DELETED_PATTERN.test(content)) return 'deleted';
  if (MEDIA_PATTERNS.some((p) => content.includes(p))) return 'media';
  return 'text';
}

export function parseAndroid(text: string): ParsedChat {
  const lines = text.split('\n');
  const messages: Message[] = [];
  const participantSet = new Set<string>();

  let currentDate = { year: 2024, month: 1, day: 1 };
  let currentMsg: Message | null = null;
  let title = '';

  // 첫 줄에서 채팅방 이름 추출 시도
  const titleMatch = lines[0]?.match(/^(.+?) 님과의 대화$|^(.+?) 님과 카카오톡 대화$|^(.+?) 카카오톡 대화$/);
  if (titleMatch) {
    title = titleMatch[1] || titleMatch[2] || titleMatch[3] || '';
  }

  for (const line of lines) {
    // 날짜 구분선
    const dateMatch = line.match(DATE_LINE_PATTERN);
    if (dateMatch) {
      if (currentMsg) {
        messages.push(currentMsg);
        currentMsg = null;
      }
      currentDate = {
        year: parseInt(dateMatch[1], 10),
        month: parseInt(dateMatch[2], 10),
        day: parseInt(dateMatch[3], 10),
      };
      continue;
    }

    // 메시지 패턴
    const msgMatch = line.match(MSG_PATTERN);
    if (msgMatch) {
      if (currentMsg) {
        messages.push(currentMsg);
      }
      const sender = msgMatch[1];
      const { hour, minute } = parseTime(msgMatch[2], msgMatch[3], msgMatch[4]);
      const content = msgMatch[5];

      participantSet.add(sender);

      currentMsg = {
        sender,
        timestamp: new Date(currentDate.year, currentDate.month - 1, currentDate.day, hour, minute),
        content,
        type: classifyContent(content),
      };
      continue;
    }

    // 시스템 메시지 (이름 패턴 없는 줄)
    if (SYSTEM_PATTERNS.some((p) => line.includes(p))) {
      if (currentMsg) {
        messages.push(currentMsg);
        currentMsg = null;
      }
      messages.push({
        sender: '',
        timestamp: new Date(currentDate.year, currentDate.month - 1, currentDate.day),
        content: line.trim(),
        type: 'system',
      });
      continue;
    }

    // 빈 줄 무시
    if (line.trim() === '') continue;

    // 멀티라인: 이전 메시지에 이어붙이기
    if (currentMsg) {
      currentMsg.content += '\n' + line;
    }
  }

  // 마지막 메시지 처리
  if (currentMsg) {
    messages.push(currentMsg);
  }

  return {
    title,
    platform: 'android',
    participants: Array.from(participantSet),
    messages,
    mediaCount: messages.filter((m) => m.type === 'media').length,
    deletedCount: messages.filter((m) => m.type === 'deleted').length,
  };
}
