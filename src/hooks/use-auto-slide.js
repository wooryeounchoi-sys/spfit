import { useEffect } from 'react';

/**
 * 일정 시간마다 콜백 실행 (자동 슬라이드용)
 *
 * @param {function} onTick - 실행할 함수
 * @param {number} delay - 간격(ms)
 * @param {boolean} isPaused - 일시정지 여부
 */
export default function useAutoSlide(onTick, delay, isPaused) {
  useEffect(() => {
    if (isPaused) {
      return undefined;
    }
    const timer = window.setInterval(onTick, delay);
    return () => window.clearInterval(timer);
  }, [onTick, delay, isPaused]);
}
