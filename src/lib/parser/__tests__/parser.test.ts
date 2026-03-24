import { describe, it, expect } from 'vitest';
import { parseKakaoTalk } from '../index';
import { detectPlatform } from '../detector';

const ANDROID_SAMPLE = `홍길동 님과의 대화
저장한 날짜 : 2024-03-15

--------------- 2024년 3월 15일 금요일 ---------------
[홍길동] [오후 2:30] 오늘 회의 몇 시야?
[김철수] [오후 2:31] 3시로 바뀌었어
[홍길동] [오후 2:31] ㅇㅋ
[김철수] [오후 2:35] 사진
[홍길동] [오후 2:36] 삭제된 메시지입니다.
[김철수] [오후 2:40] 이건 좀 긴 메시지인데
여러 줄에 걸쳐서
작성된 내용이야
[홍길동] [오후 2:41] 알겠어

--------------- 2024년 3월 16일 토요일 ---------------
[홍길동] [오전 9:00] 좋은 아침!
김영희님이 들어왔습니다.
[김영희] [오전 9:05] 안녕하세요~`;

const IOS_SAMPLE = `홍길동 님과의 대화
저장한 날짜 : 2024-03-15

--------------- 2024년 3월 15일 금요일 ---------------
2024. 3. 15. 오후 2:30, 홍길동 : 오늘 회의 몇 시야?
2024. 3. 15. 오후 2:31, 김철수 : 3시로 바뀌었어
2024. 3. 15. 오후 2:31, 홍길동 : ㅇㅋ
2024. 3. 15. 오후 2:35, 김철수 : 사진
2024. 3. 15. 오후 2:36, 홍길동 : 삭제된 메시지입니다.
2024. 3. 15. 오후 2:40, 김철수 : 이건 좀 긴 메시지인데
여러 줄에 걸쳐서
작성된 내용이야
2024. 3. 15. 오후 2:41, 홍길동 : 알겠어`;

const IOS_SAMPLE_V2 = `🌏 역사 44 님과 카카오톡 대화
저장한 날짜 : 2026년 3월 24일 오전 11:38

2025년 12월 5일 오후 3:35, 몬헌정보학과님이 들어왔습니다.
2025년 12월 5일 오후 3:35, 팬다 Jr. : 환영합니다!
2025년 12월 5일 오후 3:35, 몬헌정보학과 : 안녕하세요
2025년 12월 5일 오후 3:36, Hesse : 이모티콘
2025년 12월 5일 오후 4:26, 혐오지능 목사 : ㅎㅇ
2025년 12월 5일 오후 4:30, 팬다 Jr. : 이건 긴 메시지인데
여러 줄에 걸쳐서
작성된 내용이야
2025년 12월 5일 오후 4:35, Hesse : 사진
2025년 12월 5일 오후 4:36, 몬헌정보학과 : 삭제된 메시지입니다.`;

describe('detectPlatform', () => {
  it('Android 포맷을 감지한다', () => {
    expect(detectPlatform(ANDROID_SAMPLE)).toBe('android');
  });

  it('iOS 포맷을 감지한다', () => {
    expect(detectPlatform(IOS_SAMPLE)).toBe('ios');
  });

  it('iOS V2 포맷(한글 날짜)을 감지한다', () => {
    expect(detectPlatform(IOS_SAMPLE_V2)).toBe('ios');
  });
});

describe('parseKakaoTalk - Android', () => {
  const result = parseKakaoTalk(ANDROID_SAMPLE);

  it('플랫폼을 android로 식별한다', () => {
    expect(result.platform).toBe('android');
  });

  it('참여자를 정확히 추출한다', () => {
    expect(result.participants).toContain('홍길동');
    expect(result.participants).toContain('김철수');
    expect(result.participants).toContain('김영희');
  });

  it('텍스트 메시지를 파싱한다', () => {
    const textMsgs = result.messages.filter((m) => m.type === 'text');
    expect(textMsgs.length).toBeGreaterThanOrEqual(5);
  });

  it('미디어 메시지를 감지한다', () => {
    expect(result.mediaCount).toBe(1);
  });

  it('삭제된 메시지를 감지한다', () => {
    expect(result.deletedCount).toBe(1);
  });

  it('시스템 메시지를 감지한다', () => {
    const systemMsgs = result.messages.filter((m) => m.type === 'system');
    expect(systemMsgs.length).toBe(1);
    expect(systemMsgs[0].content).toContain('들어왔습니다');
  });

  it('멀티라인 메시지를 올바르게 처리한다', () => {
    const multiline = result.messages.find((m) => m.content.includes('여러 줄'));
    expect(multiline).toBeDefined();
    expect(multiline!.content).toContain('이건 좀 긴 메시지인데');
    expect(multiline!.content).toContain('작성된 내용이야');
  });

  it('시간을 올바르게 파싱한다', () => {
    const firstMsg = result.messages.find((m) => m.sender === '홍길동' && m.type === 'text');
    expect(firstMsg!.timestamp.getHours()).toBe(14);
    expect(firstMsg!.timestamp.getMinutes()).toBe(30);
  });

  it('오전 시간을 올바르게 파싱한다', () => {
    const morningMsg = result.messages.find(
      (m) => m.sender === '홍길동' && m.content === '좋은 아침!',
    );
    expect(morningMsg!.timestamp.getHours()).toBe(9);
  });

  it('날짜가 변경되면 새 날짜를 적용한다', () => {
    const morningMsg = result.messages.find((m) => m.content === '좋은 아침!');
    expect(morningMsg!.timestamp.getDate()).toBe(16);
  });
});

describe('parseKakaoTalk - iOS', () => {
  const result = parseKakaoTalk(IOS_SAMPLE);

  it('플랫폼을 ios로 식별한다', () => {
    expect(result.platform).toBe('ios');
  });

  it('참여자를 정확히 추출한다', () => {
    expect(result.participants).toContain('홍길동');
    expect(result.participants).toContain('김철수');
  });

  it('미디어 메시지를 감지한다', () => {
    expect(result.mediaCount).toBe(1);
  });

  it('삭제된 메시지를 감지한다', () => {
    expect(result.deletedCount).toBe(1);
  });

  it('멀티라인 메시지를 올바르게 처리한다', () => {
    const multiline = result.messages.find((m) => m.content.includes('여러 줄'));
    expect(multiline).toBeDefined();
    expect(multiline!.content).toContain('작성된 내용이야');
  });

  it('날짜와 시간을 올바르게 파싱한다', () => {
    const firstMsg = result.messages.find((m) => m.sender === '홍길동' && m.type === 'text');
    expect(firstMsg!.timestamp.getFullYear()).toBe(2024);
    expect(firstMsg!.timestamp.getMonth()).toBe(2); // 0-indexed
    expect(firstMsg!.timestamp.getDate()).toBe(15);
    expect(firstMsg!.timestamp.getHours()).toBe(14);
    expect(firstMsg!.timestamp.getMinutes()).toBe(30);
  });
});

describe('parseKakaoTalk - iOS V2 (한글 날짜)', () => {
  const result = parseKakaoTalk(IOS_SAMPLE_V2);

  it('플랫폼을 ios로 식별한다', () => {
    expect(result.platform).toBe('ios');
  });

  it('채팅방 제목을 추출한다', () => {
    expect(result.title).toBe('🌏 역사 44');
  });

  it('참여자를 정확히 추출한다', () => {
    expect(result.participants).toContain('팬다 Jr.');
    expect(result.participants).toContain('몬헌정보학과');
    expect(result.participants).toContain('Hesse');
    expect(result.participants).toContain('혐오지능 목사');
  });

  it('텍스트 메시지를 파싱한다', () => {
    const textMsgs = result.messages.filter((m) => m.type === 'text');
    expect(textMsgs.length).toBeGreaterThanOrEqual(4);
  });

  it('시스템 메시지를 감지한다', () => {
    const systemMsgs = result.messages.filter((m) => m.type === 'system');
    expect(systemMsgs.length).toBe(1);
    expect(systemMsgs[0].content).toContain('들어왔습니다');
  });

  it('시스템 메시지의 타임스탬프를 추출한다', () => {
    const systemMsg = result.messages.find((m) => m.type === 'system');
    expect(systemMsg!.timestamp.getFullYear()).toBe(2025);
    expect(systemMsg!.timestamp.getMonth()).toBe(11); // 12월 = 11 (0-indexed)
    expect(systemMsg!.timestamp.getDate()).toBe(5);
  });

  it('날짜와 시간을 올바르게 파싱한다', () => {
    const firstMsg = result.messages.find((m) => m.sender === '팬다 Jr.' && m.type === 'text');
    expect(firstMsg!.timestamp.getFullYear()).toBe(2025);
    expect(firstMsg!.timestamp.getMonth()).toBe(11);
    expect(firstMsg!.timestamp.getDate()).toBe(5);
    expect(firstMsg!.timestamp.getHours()).toBe(15);
    expect(firstMsg!.timestamp.getMinutes()).toBe(35);
  });

  it('미디어 메시지를 감지한다', () => {
    expect(result.mediaCount).toBe(1);
  });

  it('삭제된 메시지를 감지한다', () => {
    expect(result.deletedCount).toBe(1);
  });

  it('멀티라인 메시지를 올바르게 처리한다', () => {
    const multiline = result.messages.find((m) => m.content.includes('여러 줄'));
    expect(multiline).toBeDefined();
    expect(multiline!.content).toContain('작성된 내용이야');
  });

  it('저장한 날짜 줄을 무시한다', () => {
    const allContent = result.messages.map((m) => m.content).join(' ');
    expect(allContent).not.toContain('저장한 날짜');
  });
});
