import Box from '@mui/material/Box';
import { isSupabaseConfigured } from '../../lib/supabase';

/**
 * DbNotice 컴포넌트 - Supabase 환경변수가 없을 때 상단 안내 문구 표시
 *
 * Props: 없음
 *
 * Example usage:
 * <DbNotice />
 */
function DbNotice() {
  if (isSupabaseConfigured) {
    return null;
  }
  return (
    <Box sx={ { width: '100%', bgcolor: '#FFF4E5', color: '#663C00', fontSize: 14, textAlign: 'center', py: 1.25, px: 2 } }>
      데이터베이스(Supabase)가 아직 연결되지 않아 상품/회원 데이터가 표시되지 않습니다.
      환경변수 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 를 설정해주세요.
    </Box>
  );
}

export default DbNotice;
