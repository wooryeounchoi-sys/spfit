import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from './use-auth';
import usePopup from './use-popup';

/**
 * 로그인 필요 기능 실행 전 확인 훅
 * 비로그인 시 "로그인 해주세요" 팝업 (버튼: 로그인 하러가기) -> 로그인 페이지 이동
 *
 * @param {string} confirmColor - 팝업 버튼 색상 [Optional]
 * @returns {function} requireLogin() -> 로그인 상태면 true
 */
export default function useLoginGuard(confirmColor) {
  const navigate = useNavigate();
  const showPopup = usePopup();
  const { isLoggedIn } = useAuth();

  return useCallback(async () => {
    if (isLoggedIn) {
      return true;
    }
    await showPopup({ message: '로그인 해주세요', confirmLabel: '로그인 하러가기', confirmColor });
    navigate('/login');
    return false;
  }, [confirmColor, isLoggedIn, navigate, showPopup]);
}
