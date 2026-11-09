import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { withdrawMember } from '../api/member-api';
import FormColumn from '../components/common/form-column';
import PageContainer from '../components/common/page-container';
import DarkButton from '../components/ui/dark-button';
import FormInput from '../components/ui/form-input';
import PageTitle from '../components/ui/page-title';
import PasswordInput from '../components/ui/password-input';
import useApiError from '../hooks/use-api-error';
import useAuth from '../hooks/use-auth';
import usePopup from '../hooks/use-popup';

/**
 * WithdrawPage 컴포넌트 - 회원 탈퇴 (아이디/비밀번호 확인 → status WITHDRAWN 변경)
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/mypage/account/withdraw" element={<WithdrawPage />} />
 */
function WithdrawPage() {
  const navigate = useNavigate();
  const showPopup = usePopup();
  const handleError = useApiError();
  const { token, signOut } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const handleWithdraw = async () => {
    if (!loginId.trim() || !password) {
      await showPopup({ message: '아이디와 비밀번호를 입력해주세요.' });
      return;
    }
    try {
      const result = await withdrawMember(token, loginId, password);
      if (!result.ok) {
        await showPopup({ message: '아이디/비밀번호를 다시 입력해 주세요' });
        return;
      }
      await signOut();
      await showPopup({ message: '회원 탈퇴 되셨습니다.' });
      navigate('/');
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <PageContainer>
      <PageTitle>회원 탈퇴</PageTitle>
      <FormColumn onSubmit={ handleWithdraw }>
        <FormInput value={ loginId } onChange={ (e) => setLoginId(e.target.value) } placeholder="아이디" autoComplete="username" />
        <PasswordInput value={ password } onChange={ (e) => setPassword(e.target.value) } placeholder="비밀번호" autoComplete="current-password" />
        <DarkButton type="submit" sx={ { mt: 2 } }>탈퇴하기</DarkButton>
      </FormColumn>
    </PageContainer>
  );
}

export default WithdrawPage;
