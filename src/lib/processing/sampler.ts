import type { Message } from '@/lib/parser/types';

const TARGET_SAMPLE_SIZE = 30000; // 샘플링 후 목표 메시지 수

/**
 * 시간대별 균등 샘플링
 * 전체 기간을 N개 구간으로 나눠 각 구간에서 동일한 수의 메시지를 추출
 */
export function sampleMessages(messages: Message[]): Message[] {
  const textMessages = messages.filter((m) => m.type !== 'system');

  if (textMessages.length <= TARGET_SAMPLE_SIZE) {
    return messages;
  }

  // 시간 범위 계산
  const timestamps = textMessages.map((m) => m.timestamp.getTime());
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const timeRange = maxTime - minTime;

  if (timeRange === 0) {
    return messages.slice(0, TARGET_SAMPLE_SIZE);
  }

  // 구간 수 = 100, 각 구간에서 TARGET/100 개씩 추출
  const numBuckets = 100;
  const bucketSize = timeRange / numBuckets;
  const perBucket = Math.ceil(TARGET_SAMPLE_SIZE / numBuckets);

  const sampled = new Set<number>();
  const messageIndices = messages.map((m, i) => ({
    index: i,
    time: m.timestamp.getTime(),
    isSystem: m.type === 'system',
  }));

  for (let b = 0; b < numBuckets; b++) {
    const bucketStart = minTime + b * bucketSize;
    const bucketEnd = bucketStart + bucketSize;

    const inBucket = messageIndices.filter(
      (m) => !m.isSystem && m.time >= bucketStart && m.time < bucketEnd,
    );

    // 각 구간에서 균등 간격으로 추출
    if (inBucket.length <= perBucket) {
      inBucket.forEach((m) => sampled.add(m.index));
    } else {
      const step = inBucket.length / perBucket;
      for (let i = 0; i < perBucket; i++) {
        sampled.add(inBucket[Math.floor(i * step)].index);
      }
    }
  }

  // 시스템 메시지는 모두 포함
  messageIndices.filter((m) => m.isSystem).forEach((m) => sampled.add(m.index));

  // 원래 순서 유지
  const sortedIndices = Array.from(sampled).sort((a, b) => a - b);
  return sortedIndices.map((i) => messages[i]);
}
