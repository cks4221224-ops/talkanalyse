export interface ParticipantStats {
  name: string;
  messageCount: number;
  textCount: number;
  mediaCount: number;
  deletedCount: number;
  averageLength: number;
  longestMessage: number;
  conversationStarts: number;
}

export interface HourlyActivity {
  hour: number;
  count: number;
}

export interface DailyActivity {
  day: number; // 0=일, 1=월, ..., 6=토
  dayName: string;
  count: number;
}

export interface ReplySpeed {
  name: string;
  averageSeconds: number;
  medianSeconds: number;
  maxSeconds: number;
}

export interface AnalysisResult {
  totalMessages: number;
  totalDays: number;
  dateRange: { start: Date; end: Date };
  participantStats: ParticipantStats[];
  hourlyActivity: HourlyActivity[];
  dailyActivity: DailyActivity[];
  replySpeeds: ReplySpeed[];
  heatmap: number[][]; // [day][hour] = count
}
