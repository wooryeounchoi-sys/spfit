import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../api/member-api';
import FormColumn from '../components/common/form-column';
import NewPasswordFields from '../components/common/new-password-fields';
import PageContainer from '../components/common/page-container';
import LightButton from '../components/ui/light-button';
import PageTitle from '../components/ui/page-title';
import PasswordInput from '../components/ui/password-input';
import useApiError from '../hooks/use-api-error';
import useAuth from '../hooks/use-auth';
import usePopup from '../hooks/use-popup';

/**
 * ChangePasswordPage 컴포넌트 - 비밀번호 변경 (기존 / 변경 / 변경 확인)
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/mypage/account/password" element={<ChangePasswordPage />} />
 */
function ChangePasswordPage() {
  const navigate = useNavigate();
  const showPopup = usePopup();
  const handleError = useApiError();
  const { token } = useAuth();
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const currentRef = useRef(null);

  const handleSubmit = async () => {
    if (!current || !password || !confirm || password !== confirm) {
      await showPopup({ message: '다시 입력해주세요.' });
      return;
    }
    try {
      const result = await changePassword(token, current, password);
      if (!result.ok) {
        await showPopup({ message: '다시 입력해주세요.' });
        currentRef.current?.focus();
        return;
      }
      await showPopup({ message: '비밀번호 변경이 완료되었습니다' });
      navigate('/mypage/account');
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <PageContainer maxWidth={ 800 }>
      <PageTitle>비밀번호 변경</PageTitle>
      <FormColumn onSubmit={ handleSubmit }>
        <PasswordInput ref={ currentRef } value={ current } onChange={ (e) => setCurrent(e.target.value) } placeholder="기존 비밀번호" autoComplete="current-password" />
        <NewPasswordFields password={ password } confirm={ confirm } onPasswordChange={ setPassword } onConfirmChange={ setConfirm } />
        <Box sx={ { display: 'flex', gap: 1.5, mt: 2 } }>
          <LightButton width={ 195 } onClick={ () => navigate('/mypage/account') }>변경 취소</LightButton>
          <LightButton width={ 195 } onClick={ handleSubmit } isActive>변경하기</LightButton>
        </Box>
      </FormColumn>
    </PageContainer>
  );
}

export default ChangePasswordPage;
