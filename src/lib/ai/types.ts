export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface SentimentResult {
  messageIndex: number;
  sentiment: Sentiment;
  score: number; // -1 ~ 1
}

export interface TermResult {
  term: string;
  explanation: string;
  messageIndices: number[];
}

export interface AIAnalysisResult {
  sentiments: SentimentResult[];
  terms: TermResult[];
}
