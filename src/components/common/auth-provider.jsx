import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMe, logout } from '../../api/member-api';
import AuthContext from '../../hooks/auth-context';
import { clearSession, loadSession, saveSession } from '../../utils/token-storage';

/**
 * AuthProvider 컴포넌트 - 로그인 세션(토큰 + 회원 이름)을 앱 전체에 제공
 *
 * Props:
 * @param {node} children - 하위 컴포넌트 [Required]
 *
 * Example usage:
 * <AuthProvider><App /></AuthProvider>
 */
function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession());

  const signIn = useCallback((token, member) => {
    const next = { token, member };
    saveSession(next);
    setSession(next);
  }, []);

  const signOut = useCallback(async () => {
    const token = session?.token;
    clearSession();
    setSession(null);
    if (token) {
      try {
        await logout(token);
      } catch {
        /** 서버 세션 삭제 실패는 무시 (만료 시 자동 무효) */
      }
    }
  }, [session]);

  /** 저장된 토큰이 유효한지 서버에서 확인 */
  useEffect(() => {
    const saved = loadSession();
    if (!saved?.token) {
      return;
    }
    getMe(saved.token)
      .then((me) => {
        const next = { token: saved.token, member: { login_id: me.login_id, name: me.name } };
        saveSession(next);
        setSession(next);
      })
      .catch((error) => {
        if (error.message.includes('AUTH_REQUIRED')) {
          clearSession();
          setSession(null);
        }
      });
  }, []);

  const value = useMemo(() => ({
    token: session?.token || null,
    member: session?.member || null,
    isLoggedIn: Boolean(session?.token),
    signIn,
    signOut,
  }), [session, signIn, signOut]);

  return <AuthContext.Provider value={ value }>{ children }</AuthContext.Provider>;
}

export default AuthProvider;
