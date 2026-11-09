const TOKEN_KEY = 'spfit_session';

/** 세션 정보 로컬 저장 (브라우저 저장소 차단 환경을 고려해 try/catch) */
export function loadSession() {
  try {
    const raw = window.localStorage.getItem(TOKEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    window.localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
  } catch {
    /** 저장 실패 시 현재 탭에서만 로그인 유지 */
  }
}

export function clearSession() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /** 무시 */
  }
}
