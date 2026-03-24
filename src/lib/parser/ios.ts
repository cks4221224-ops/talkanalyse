import type { Message, ParsedChat } from './types';

const DATE_LINE_PATTERN = /^-+ (\d{4})년 (\d{1,2})월 (\d{1,2})일 .+ -+$/;
const MSG_PATTERN_V1 =
  /^(\d{4})\. (\d{1,2})\. (\d{1,2})\. (오전|오후) (\d{1,2}):(\d{2}), (.+?) : (.+)/;
const MSG_PATTERN_V2 =
  /^(\d{4})년 (\d{1,2})월 (\d{1,2})일 (오전|오후) (\d{1,2}):(\d{2}), (.+?) : (.+)/;
const DATE_PREFIX_PATTERN =
  /^(\d{4})년 (\d{1,2})월 (\d{1,2})일 (오전|오후) (\d{1,2}):(\d{2}), (.+)/;
const SAVED_DATE_PATTERN = /^저장한 날짜 :/;
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

export function parseIOS(text: string): ParsedChat {
  const lines = text.split('\n');
  const messages: Message[] = [];
  const participantSet = new Set<string>();

  let currentMsg: Message | null = null;
  let title = '';

  // 첫 줄에서 채팅방 이름 추출 시도
  const titleMatch = lines[0]?.match(/^(.+?) 님과의 대화$|^(.+?) 님과 카카오톡 대화$|^(.+?) 카카오톡 대화$/);
  if (titleMatch) {
    title = titleMatch[1] || titleMatch[2] || titleMatch[3] || '';
  }

  for (const line of lines) {
    // 날짜 구분선 (iOS도 동일 패턴 사용)
    const dateMatch = line.match(DATE_LINE_PATTERN);
    if (dateMatch) {
      if (currentMsg) {
        messages.push(currentMsg);
        currentMsg = null;
      }
      continue;
    }

    // 저장 날짜 줄 스킵
    if (SAVED_DATE_PATTERN.test(line)) continue;

    // 메시지 패턴 (V1: 점 구분, V2: 한글 구분)
    const msgMatch = line.match(MSG_PATTERN_V1) || line.match(MSG_PATTERN_V2);
    if (msgMatch) {
      if (currentMsg) {
        messages.push(currentMsg);
      }
      const year = parseInt(msgMatch[1], 10);
      const month = parseInt(msgMatch[2], 10);
      const day = parseInt(msgMatch[3], 10);
      const { hour, minute } = parseTime(msgMatch[4], msgMatch[5], msgMatch[6]);
      const sender = msgMatch[7];
      const content = msgMatch[8];

      participantSet.add(sender);

      currentMsg = {
        sender,
        timestamp: new Date(year, month - 1, day, hour, minute),
        content,
        type: classifyContent(content),
      };
      continue;
    }

    // 시스템 메시지
    if (SYSTEM_PATTERNS.some((p) => line.includes(p))) {
      if (currentMsg) {
        messages.push(currentMsg);
        currentMsg = null;
      }
      // V2 형식: 날짜 접두사에서 타임스탬프 추출
      const datePrefixMatch = line.match(DATE_PREFIX_PATTERN);
      let sysTimestamp: Date;
      let sysContent: string;
      if (datePrefixMatch) {
        const year = parseInt(datePrefixMatch[1], 10);
        const month = parseInt(datePrefixMatch[2], 10);
        const day = parseInt(datePrefixMatch[3], 10);
        const { hour, minute } = parseTime(datePrefixMatch[4], datePrefixMatch[5], datePrefixMatch[6]);
        sysTimestamp = new Date(year, month - 1, day, hour, minute);
        sysContent = datePrefixMatch[7];
      } else {
        sysTimestamp = new Date();
        sysContent = line.trim();
      }
      messages.push({
        sender: '',
        timestamp: sysTimestamp,
        content: sysContent,
        type: 'system',
      });
      continue;
    }

    // 빈 줄 무시
    if (line.trim() === '') continue;

    // 멀티라인
    if (currentMsg) {
      currentMsg.content += '\n' + line;
    }
  }

  if (currentMsg) {
    messages.push(currentMsg);
  }

  return {
    title,
    platform: 'ios',
    participants: Array.from(participantSet),
    messages,
    mediaCount: messages.filter((m) => m.type === 'media').length,
    deletedCount: messages.filter((m) => m.type === 'deleted').length,
  };
}
