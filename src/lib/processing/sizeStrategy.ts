export type SizeCategory = 'small' | 'medium' | 'large' | 'rejected';

interface SizeStrategyResult {
  category: SizeCategory;
  needsSampling: boolean;
  message: string;
}

const MB = 1024 * 1024;

export function getSizeStrategy(fileSize: number): SizeStrategyResult {
  if (fileSize > 100 * MB) {
    return {
      category: 'rejected',
      needsSampling: false,
      message: '100MB 이하의 파일만 업로드할 수 있습니다. 카카오톡에서 기간을 나눠 내보내기해 주세요.',
    };
  }

  if (fileSize > 30 * MB) {
    return {
      category: 'large',
      needsSampling: true,
      message: '파일이 큽니다. 정확도를 유지하면서 시간대별 균등 샘플링을 적용합니다.',
    };
  }

  if (fileSize > 10 * MB) {
    return {
      category: 'medium',
      needsSampling: false,
      message: '배치 분할로 처리합니다. 잠시 시간이 걸릴 수 있습니다.',
    };
  }

  return {
    category: 'small',
    needsSampling: false,
    message: '',
  };
}
