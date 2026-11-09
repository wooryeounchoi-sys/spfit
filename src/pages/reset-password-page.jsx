import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset, resetPassword } from '../api/member-api';
import FormColumn from '../components/common/form-column';
import NewPasswordFields from '../components/common/new-password-fields';
import PageContainer from '../components/common/page-container';
import ResultCard from '../components/common/result-card';
import DarkButton from '../components/ui/dark-button';
import FormInput from '../components/ui/form-input';
import PageTitle from '../components/ui/page-title';
import usePopup from '../hooks/use-popup';
import { errorMessage } from '../utils/error-message';
import { withJosa } from '../utils/josa';

/**
 * ResetPasswordPage 컴포넌트 - 비밀번호 재설정
 * 1단계: 이름/아이디/이메일로 본인 확인 → 2단계: 새 비밀번호 설정 → 3단계: 완료 카드
 * (보안상 기존 비밀번호를 알려주지 않고 새 비밀번호를 설정하는 방식)
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/find/password" element={<ResetPasswordPage />} />
 */
function ResetPasswordPage() {
  const navigate = useNavigate();
  const showPopup = usePopup();
  const [step, setStep] = useState('verify');
  const [name, setName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const nameRef = useRef(null);
  const idRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const handleVerify = async () => {
    const fields = [
      { label: '이름', value: name, ref: nameRef },
      { label: '아이디', value: loginId, ref: idRef },
      { label: '이메일', value: email, ref: emailRef },
    ];
    const missing = fields.find((field) => !field.value.trim());
    if (missing) {
      await showPopup({ message: `${withJosa(missing.label, '을/를')} 입력하세요.` });
      missing.ref.current?.focus();
      return;
    }
    try {
      const result = await requestPasswordReset(name, loginId, email);
      if (!result.ok) {
        await showPopup({ message: '일치하는 회원 정보가 없습니다.' });
        return;
      }
      setResetToken(result.reset_token);
      setStep('password');
    } catch (error) {
      await showPopup({ message: errorMessage(error) });
    }
  };

  const handleReset = async () => {
    if (!password || !confirm || password !== confirm) {
      await showPopup({ message: '다시 입력해주세요.' });
      passwordRef.current?.focus();
      return;
    }
    try {
      const result = await resetPassword(resetToken, password);
      if (!result.ok) {
        await showPopup({ message: errorMessage(result.error) });
        return;
      }
      setStep('done');
    } catch (error) {
      await showPopup({ message: error.message.includes('AUTH_REQUIRED') ? '인증 시간이 만료되었습니다. 다시 시도해주세요.' : errorMessage(error) });
      setStep('verify');
    }
  };

  return (
    <PageContainer>
      <PageTitle>비밀번호 재설정</PageTitle>
      { step === 'verify' && (
        <FormColumn onSubmit={ handleVerify }>
          <FormInput ref={ nameRef } value={ name } onChange={ (e) => setName(e.target.value) } placeholder="이름" />
          <FormInput ref={ idRef } value={ loginId } onChange={ (e) => setLoginId(e.target.value) } placeholder="아이디" />
          <FormInput ref={ emailRef } value={ email } onChange={ (e) => setEmail(e.target.value) } placeholder="이메일" type="email" />
          <DarkButton type="submit" sx={ { mt: 2 } }>비밀번호 재설정</DarkButton>
        </FormColumn>
      ) }
      { step === 'password' && (
        <FormColumn onSubmit={ handleReset }>
          <Box sx={ { fontSize: 15, mb: 1, textAlign: 'center' } }>본인 확인이 완료되었습니다. 새 비밀번호를 입력해주세요.</Box>
          <NewPasswordFields
            password={ password }
            confirm={ confirm }
            onPasswordChange={ setPassword }
            onConfirmChange={ setConfirm }
            passwordRef={ passwordRef }
          />
          <DarkButton type="submit" sx={ { mt: 2 } }>비밀번호 재설정</DarkButton>
        </FormColumn>
      ) }
      { step === 'done' && (
        <Box sx={ { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 } }>
          <ResultCard title="비밀번호 재설정 완료!">변경된 비밀번호로 로그인 해주세요</ResultCard>
          <DarkButton onClick={ () => navigate('/login') }>로그인 하기</DarkButton>
        </Box>
      ) }
    </PageContainer>
  );
}

export default ResetPasswordPage;
