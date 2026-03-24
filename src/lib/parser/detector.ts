import type { Platform } from './types';

const ANDROID_MSG_PATTERN = /^\[.+?\] \[(오전|오후) \d{1,2}:\d{2}\]/;
const IOS_MSG_PATTERN_V1 = /^\d{4}\. \d{1,2}\. \d{1,2}\. (오전|오후) \d{1,2}:\d{2},/;
const IOS_MSG_PATTERN_V2 = /^\d{4}년 \d{1,2}월 \d{1,2}일 (오전|오후) \d{1,2}:\d{2},/;

export function detectPlatform(text: string): Platform {
  const lines = text.split('\n').slice(0, 30);

  for (const line of lines) {
    if (ANDROID_MSG_PATTERN.test(line)) return 'android';
    if (IOS_MSG_PATTERN_V1.test(line)) return 'ios';
    if (IOS_MSG_PATTERN_V2.test(line)) return 'ios';
  }

  return 'android';
}
