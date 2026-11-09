import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop 컴포넌트 - 페이지 이동 시 스크롤을 맨 위로
 *
 * Props: 없음
 *
 * Example usage:
 * <ScrollToTop />
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default ScrollToTop;
