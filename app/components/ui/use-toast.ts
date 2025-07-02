import { useCallback } from 'react';

export function toast(msg: string) {
  alert(msg);
}

export function useToast() {
  // 임시: 실제 토스트 라이브러리 연동 필요
  const show = useCallback((msg: string) => {
    toast(msg);
  }, []);
  return { toast: show };
}
