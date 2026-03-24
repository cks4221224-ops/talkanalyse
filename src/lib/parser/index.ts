import type { ParsedChat } from './types';
import { detectPlatform } from './detector';
import { parseAndroid } from './android';
import { parseIOS } from './ios';

export type { ParsedChat, Message, MessageType, Platform } from './types';

export function parseKakaoTalk(text: string): ParsedChat {
  const platform = detectPlatform(text);

  if (platform === 'ios') {
    return parseIOS(text);
  }

  return parseAndroid(text);
}
