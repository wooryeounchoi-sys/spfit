import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { login } from '../api/member-api';
import FormColumn from '../components/common/form-column';
import PageContainer from '../components/common/page-container';
import DarkButton from '../components/ui/dark-button';
import FormInput from '../components/ui/form-input';
import PageTitle from '../components/ui/page-title';
import PasswordInput from '../components/ui/password-input';
import useAuth from '../hooks/use-auth';
import usePopup from '../hooks/use-popup';
import { errorMessage } from '../utils/error-message';

/**
 * LoginPage 컴포넌트 - 로그인 (아이디 / 비밀번호)
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/login" element={<LoginPage />} />
 */
function LoginPage() {
  const navigate = useNavigate();
  const showPopup = usePopup();
  const { signIn } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const idRef = useRef(null);
  const passwordRef = useRef(null);

  const handleLogin = async () => {
    if (!loginId.trim()) {
      await showPopup({ message: '아이디를 입력하세요.' });
      idRef.current?.focus();
      return;
    }
    if (!password) {
      await showPopup({ message: '비밀번호를 입력하세요.' });
      passwordRef.current?.focus();
      return;
    }
    try {
      const result = await login(loginId, password);
      if (result.status === 'NO_MEMBER') {
        await showPopup({ message: '회원가입 해주세요' });
        return;
      }
      if (result.status === 'WRONG_PASSWORD') {
        await showPopup({ message: '아이디/비밀번호를 다시 입력해 주세요' });
        passwordRef.current?.focus();
        return;
      }
      signIn(result.token, result.member);
      await showPopup({ message: `${result.member.name}님 환영합니다.` });
      navigate('/');
    } catch (error) {
      await showPopup({ message: errorMessage(error) });
    }
  };

  return (
    <PageContainer>
      <PageTitle>로그인</PageTitle>
      <FormColumn onSubmit={ handleLogin }>
        <FormInput ref={ idRef } value={ loginId } onChange={ (e) => setLoginId(e.target.value) } placeholder="아이디" autoComplete="username" />
        <PasswordInput ref={ passwordRef } value={ password } onChange={ (e) => setPassword(e.target.value) } placeholder="비밀번호" autoComplete="current-password" />
        <Box
          component={ RouterLink }
          to="/find"
          sx={ { alignSelf: 'flex-start', fontSize: 10, color: '#000000', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } } }
        >
          아이디/비밀번호 찾기
        </Box>
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 } }>
          <DarkButton type="submit">로그인</DarkButton>
          <DarkButton onClick={ () => navigate('/signup') }>회원가입</DarkButton>
        </Box>
      </FormColumn>
    </PageContainer>
  );
}

export default LoginPage;
