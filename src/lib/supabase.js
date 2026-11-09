import { createClient } from '@supabase/supabase-js';

/**
 * 환경변수 값 정리
 * - Secret 등록 시 "api: sb_publishable_..." 처럼 라벨/공백/따옴표가 함께 들어간 경우를 대비해
 *   실제 URL / 키 부분만 추출한다.
 */
function cleanUrl(value) {
  const matched = String(value || '').match(/https:\/\/[^\s'"]+/);
  return matched ? matched[0].replace(/\/+$/, '') : '';
}

function cleanKey(value) {
  const text = String(value || '');
  const matched = text.match(/sb_publishable_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
  return matched ? matched[0] : text.trim();
}

const supabaseUrl = cleanUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = cleanKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

/** 환경변수가 설정되어 있는지 여부 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Supabase 클라이언트
 * - anon(publishable) 키만 사용 (테이블 직접 접근은 RLS 로 차단, RPC 함수로만 데이터 접근)
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } })
  : null;
