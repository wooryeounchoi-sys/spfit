import { useContext } from 'react';
import AuthContext from './auth-context';

/** 로그인 상태 / 로그인·로그아웃 함수 사용 훅 */
export default function useAuth() {
  return useContext(AuthContext);
}
