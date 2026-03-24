import type { ParsedChat, Message } from '@/lib/parser/types';
import type {
  AnalysisResult,
  ParticipantStats,
  HourlyActivity,
  DailyActivity,
  ReplySpeed,
} from './types';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
const CONVERSATION_GAP_MS = 3 * 60 * 60 * 1000; // 3시간 이상 간격 → 새 대화 시작

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calcParticipantStats(messages: Message[], participants: string[]): ParticipantStats[] {
  return participants.map((name) => {
    const msgs = messages.filter((m) => m.sender === name);
    const textMsgs = msgs.filter((m) => m.type === 'text');
    const lengths = textMsgs.map((m) => m.content.length);

    // 대화 시작 횟수: 3시간 이상 간격 후 첫 메시지
    let conversationStarts = 0;
    const nonSystemMsgs = messages.filter((m) => m.type !== 'system');
    for (let i = 0; i < nonSystemMsgs.length; i++) {
      if (nonSystemMsgs[i].sender !== name) continue;
      if (i === 0) {
        conversationStarts++;
        continue;
      }
      const gap = nonSystemMsgs[i].timestamp.getTime() - nonSystemMsgs[i - 1].timestamp.getTime();
      if (gap >= CONVERSATION_GAP_MS) {
        conversationStarts++;
      }
    }

    return {
      name,
      messageCount: msgs.length,
      textCount: textMsgs.length,
      mediaCount: msgs.filter((m) => m.type === 'media').length,
      deletedCount: msgs.filter((m) => m.type === 'deleted').length,
      averageLength: lengths.length > 0 ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : 0,
      longestMessage: lengths.length > 0 ? Math.max(...lengths) : 0,
      conversationStarts,
    };
  });
}

function calcHourlyActivity(messages: Message[]): HourlyActivity[] {
  const counts = new Array(24).fill(0);
  for (const msg of messages) {
    if (msg.type === 'system') continue;
    counts[msg.timestamp.getHours()]++;
  }
  return counts.map((count, hour) => ({ hour, count }));
}

function calcDailyActivity(messages: Message[]): DailyActivity[] {
  const counts = new Array(7).fill(0);
  for (const msg of messages) {
    if (msg.type === 'system') continue;
    counts[msg.timestamp.getDay()]++;
  }
  return counts.map((count, day) => ({ day, dayName: DAY_NAMES[day], count }));
}

function calcHeatmap(messages: Message[]): number[][] {
  // [day(0~6)][hour(0~23)] = count
  const heatmap: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
  for (const msg of messages) {
    if (msg.type === 'system') continue;
    heatmap[msg.timestamp.getDay()][msg.timestamp.getHours()]++;
  }
  return heatmap;
}

function calcReplySpeeds(messages: Message[], participants: string[]): ReplySpeed[] {
  const nonSystemMsgs = messages.filter((m) => m.type !== 'system');

  return participants.map((name) => {
    const delays: number[] = [];

    for (let i = 1; i < nonSystemMsgs.length; i++) {
      if (nonSystemMsgs[i].sender !== name) continue;
      if (nonSystemMsgs[i - 1].sender === name) continue; // 연속 메시지 스킵

      const gap =
        (nonSystemMsgs[i].timestamp.getTime() - nonSystemMsgs[i - 1].timestamp.getTime()) / 1000;

      // 12시간 이상 간격은 답장이 아닌 새 대화로 간주
      if (gap > 0 && gap < 43200) {
        delays.push(gap);
      }
    }

    return {
      name,
      averageSeconds: delays.length > 0 ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length) : 0,
      medianSeconds: Math.round(median(delays)),
      maxSeconds: delays.length > 0 ? Math.round(Math.max(...delays)) : 0,
    };
  });
}

export function analyzeChat(chat: ParsedChat): AnalysisResult {
  const nonSystemMsgs = chat.messages.filter((m) => m.type !== 'system');
  const timestamps = nonSystemMsgs.map((m) => m.timestamp.getTime());

  const start = new Date(Math.min(...timestamps));
  const end = new Date(Math.max(...timestamps));
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    totalMessages: nonSystemMsgs.length,
    totalDays,
    dateRange: { start, end },
    participantStats: calcParticipantStats(chat.messages, chat.participants),
    hourlyActivity: calcHourlyActivity(chat.messages),
    dailyActivity: calcDailyActivity(chat.messages),
    replySpeeds: calcReplySpeeds(chat.messages, chat.participants),
    heatmap: calcHeatmap(chat.messages),
  };
}
