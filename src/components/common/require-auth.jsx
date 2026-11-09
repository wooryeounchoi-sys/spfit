import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/use-auth';

/**
 * RequireAuth 컴포넌트 - 로그인하지 않은 경우 로그인 페이지로 이동
 *
 * Props:
 * @param {node} children - 로그인 후 보여줄 페이지 [Required]
 *
 * Example usage:
 * <RequireAuth><MyPage /></RequireAuth>
 */
function RequireAuth({ children }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default RequireAuth;
