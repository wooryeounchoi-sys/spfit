import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { errorMessage } from '../utils/error-message';
import useAuth from './use-auth';
import usePopup from './use-popup';

/**
 * API 오류 공통 처리 훅
 * - 세션 만료(AUTH_REQUIRED) 시 로그아웃 후 로그인 페이지로 이동
 * - 그 외 오류는 안내 팝업 표시
 *
 * @param {string} confirmColor - 팝업 확인 버튼 색상 [Optional]
 * @returns {function} handleError(error)
 */
export default function useApiError(confirmColor) {
  const navigate = useNavigate();
  const showPopup = usePopup();
  const { signOut } = useAuth();

  return useCallback(async (error) => {
    if (error?.message?.includes('AUTH_REQUIRED')) {
      await signOut();
      await showPopup({ message: '로그인 해주세요', confirmLabel: '로그인 하러가기', confirmColor });
      navigate('/login');
      return;
    }
    await showPopup({ message: errorMessage(error), confirmColor });
  }, [confirmColor, navigate, showPopup, signOut]);
}
