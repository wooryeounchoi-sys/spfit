import { isSupabaseConfigured, supabase } from '../lib/supabase';

/**
 * 서버 측 데이터 접근 계층(RPC 함수) 호출 공통 함수
 * - 실패 시 서버가 보낸 오류 코드(AUTH_REQUIRED 등)를 message 로 가진 Error 를 던진다.
 *
 * @param {string} fn - RPC 함수 이름
 * @param {object} args - 함수 인자 (p_ 접두사 이름)
 * @returns {Promise<any>} 함수 반환값
 */
export async function callRpc(fn, args = {}) {
  if (!isSupabaseConfigured) {
    throw new Error('DB_NOT_CONFIGURED');
  }
  const { data, error } = await supabase.rpc(fn, args);
  if (error) {
    throw new Error(error.message || 'UNKNOWN_ERROR');
  }
  return data;
}
