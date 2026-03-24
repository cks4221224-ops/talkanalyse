export type MessageType = 'text' | 'media' | 'system' | 'deleted';
export type Platform = 'android' | 'ios';

export interface Message {
  sender: string;
  timestamp: Date;
  content: string;
  type: MessageType;
}

export interface ParsedChat {
  title: string;
  platform: Platform;
  participants: string[];
  messages: Message[];
  mediaCount: number;
  deletedCount: number;
}
