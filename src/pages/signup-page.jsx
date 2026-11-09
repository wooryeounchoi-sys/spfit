import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';
import { checkLoginId, signUp } from '../api/member-api';
import PageContainer from '../components/common/page-container';
import SignupField from '../components/common/signup-field';
import DarkButton from '../components/ui/dark-button';
import FormInput from '../components/ui/form-input';
import PageTitle from '../components/ui/page-title';
import PasswordInput from '../components/ui/password-input';
import usePopup from '../hooks/use-popup';
import { errorMessage } from '../utils/error-message';
import { withJosa } from '../utils/josa';

const LOGIN_ID_PATTERN = /^[A-Za-z0-9_]{4,20}$/;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const splitRowSx = { display: 'flex', gap: '15px' };

/** 숫자만 남기고 최대 길이로 자르기 */
const onlyDigits = (value, maxLength) => value.replace(/\D/g, '').slice(0, maxLength);

/** 생년월일 유효성 검사 (yyyy-mm-dd 반환, 잘못되면 null) */
function toBirthDate(year, month, day) {
  if (year.length !== 4 || !month || !day) {
    return null;
  }
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const isValid = date.getFullYear() === Number(year)
    && date.getMonth() === Number(month) - 1
    && date.getDate() === Number(day)
    && date <= new Date();
  return isValid ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : null;
}

/**
 * SignupPage 컴포넌트 - 회원가입
 * 팝업 우선순위: 1. 누락된 필수정보 → 2. 아이디 중복 → 3. 비밀번호 불일치
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/signup" element={<SignupPage />} />
 */
function SignupPage() {
  const navigate = useNavigate();
  const showPopup = usePopup();
  const [form, setForm] = useState({
    loginId: '',
    password: '',
    passwordConfirm: '',
    name: '',
    email: '',
    phone1: '010',
    phone2: '',
    phone3: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
  });
  const [idStatus, setIdStatus] = useState(null);
  const refs = {
    loginId: useRef(null),
    password: useRef(null),
    passwordConfirm: useRef(null),
    name: useRef(null),
    email: useRef(null),
    phone1: useRef(null),
    phone2: useRef(null),
    phone3: useRef(null),
    birthYear: useRef(null),
  };

  const setField = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const setDigits = (key, maxLength) => (event) => setForm((prev) => ({ ...prev, [key]: onlyDigits(event.target.value, maxLength) }));

  /** 아이디 입력 후 0.4초 뒤 DB 에서 중복 확인 */
  useEffect(() => {
    const loginId = form.loginId.trim();
    if (!loginId) {
      setIdStatus(null);
      return undefined;
    }
    if (!LOGIN_ID_PATTERN.test(loginId)) {
      setIdStatus('invalid');
      return undefined;
    }
    let isActive = true;
    const timer = window.setTimeout(() => {
      checkLoginId(loginId)
        .then((isAvailable) => isActive && setIdStatus(isAvailable ? 'available' : 'duplicate'))
        .catch(() => isActive && setIdStatus(null));
    }, 400);
    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [form.loginId]);

  const focusTo = (key) => {
    const target = refs[key]?.current;
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target?.focus();
  };

  const alertAndFocus = async (message, key) => {
    await showPopup({ message });
    focusTo(key);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    /** 1. 누락된 필수정보 */
    const phoneMissingKey = ['phone1', 'phone2', 'phone3'].find((key) => !form[key]);
    const required = [
      { key: 'loginId', label: '아이디', isEmpty: !form.loginId.trim() },
      { key: 'password', label: '비밀번호', isEmpty: !form.password },
      { key: 'passwordConfirm', label: '비밀번호 확인', isEmpty: !form.passwordConfirm },
      { key: 'name', label: '이름', isEmpty: !form.name.trim() },
      { key: 'email', label: '이메일', isEmpty: !form.email.trim() },
      { key: phoneMissingKey || 'phone1', label: '휴대폰 번호', isEmpty: Boolean(phoneMissingKey) },
    ];
    const missing = required.find((field) => field.isEmpty);
    if (missing) {
      await alertAndFocus(`${withJosa(missing.label, '을/를')} 입력해주세요.`, missing.key);
      return;
    }

    /** 2. 아이디 중복 (제출 시점에 다시 확인) */
    try {
      const isAvailable = await checkLoginId(form.loginId.trim());
      if (!isAvailable) {
        setIdStatus('duplicate');
        await alertAndFocus('중복된 아이디 입니다. 다시 입력해주세요.', 'loginId');
        return;
      }
    } catch (error) {
      await showPopup({ message: errorMessage(error) });
      return;
    }

    /** 3. 비밀번호 불일치 */
    if (form.password !== form.passwordConfirm) {
      await alertAndFocus('비밀번호가 일치하지 않습니다.\n다시 입력해주세요.', 'passwordConfirm');
      return;
    }

    /** 형식 검사 */
    if (!LOGIN_ID_PATTERN.test(form.loginId.trim())) {
      await alertAndFocus(errorMessage('INVALID_LOGIN_ID'), 'loginId');
      return;
    }
    if (form.password.length < 4) {
      await alertAndFocus(errorMessage('WEAK_PASSWORD'), 'password');
      return;
    }
    if (!EMAIL_PATTERN.test(form.email.trim())) {
      await alertAndFocus(errorMessage('INVALID_EMAIL'), 'email');
      return;
    }
    const hasBirthInput = form.birthYear || form.birthMonth || form.birthDay;
    const birthDate = toBirthDate(form.birthYear, form.birthMonth, form.birthDay);
    if (hasBirthInput && !birthDate) {
      await alertAndFocus('생년월일을 정확히 입력해주세요.\n(년도 4자리)', 'birthYear');
      return;
    }

    try {
      const result = await signUp({
        loginId: form.loginId.trim(),
        password: form.password,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: `${form.phone1}-${form.phone2}-${form.phone3}`,
        birthDate,
      });
      if (!result.ok) {
        await showPopup({ message: errorMessage(result.error) });
        return;
      }
      await showPopup({ message: '회원가입 완료' });
      navigate('/login');
    } catch (error) {
      await showPopup({ message: errorMessage(error) });
    }
  };

  const isPasswordCompared = form.password.length > 0 && form.passwordConfirm.length > 0;
  const isPasswordMatch = form.password === form.passwordConfirm;
  const idSideText = {
    duplicate: '아이디 중복',
    available: '아이디 사용가능',
    invalid: '영문/숫자/_ 4~20자',
  }[idStatus];

  return (
    <PageContainer>
      <PageTitle>회원가입</PageTitle>
      <Box
        component="form"
        noValidate
        onSubmit={ handleSubmit }
        sx={ { width: '100%', maxWidth: 480, mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 } }
      >
        <Box sx={ { width: '100%', maxWidth: 390, display: 'flex', flexDirection: 'column', gap: 2.5 } }>
          <SignupField label="아이디" isRequired sideText={ idSideText } isSidePositive={ idStatus === 'available' }>
            <FormInput ref={ refs.loginId } value={ form.loginId } onChange={ setField('loginId') } autoComplete="username" />
          </SignupField>
          <SignupField
            label="비밀번호"
            isRequired
            sideText={ isPasswordCompared ? (isPasswordMatch ? '비밀번호 일치.' : '비밀번호 불일치.') : '' }
            isSidePositive={ isPasswordMatch }
          >
            <PasswordInput ref={ refs.password } value={ form.password } onChange={ setField('password') } autoComplete="new-password" />
          </SignupField>
          <SignupField label="비밀번호 확인" isRequired>
            <PasswordInput ref={ refs.passwordConfirm } value={ form.passwordConfirm } onChange={ setField('passwordConfirm') } autoComplete="new-password" />
          </SignupField>
          <SignupField label="이름" isRequired>
            <FormInput ref={ refs.name } value={ form.name } onChange={ setField('name') } autoComplete="name" />
          </SignupField>
          <SignupField label="이메일" isRequired>
            <FormInput ref={ refs.email } value={ form.email } onChange={ setField('email') } type="email" autoComplete="email" />
          </SignupField>
          <SignupField label="휴대폰 번호" isRequired>
            <Box sx={ splitRowSx }>
              <FormInput ref={ refs.phone1 } width={ 120 } value={ form.phone1 } onChange={ setDigits('phone1', 3) } inputMode="numeric" aria-label="휴대폰 번호 앞자리" />
              <FormInput ref={ refs.phone2 } width={ 120 } value={ form.phone2 } onChange={ setDigits('phone2', 4) } inputMode="numeric" aria-label="휴대폰 번호 가운데 자리" />
              <FormInput ref={ refs.phone3 } width={ 120 } value={ form.phone3 } onChange={ setDigits('phone3', 4) } inputMode="numeric" aria-label="휴대폰 번호 끝자리" />
            </Box>
          </SignupField>
          <SignupField label="생년월일">
            <Box sx={ splitRowSx }>
              <FormInput ref={ refs.birthYear } width={ 120 } value={ form.birthYear } onChange={ setDigits('birthYear', 4) } placeholder="년도" inputMode="numeric" />
              <FormInput width={ 120 } value={ form.birthMonth } onChange={ setDigits('birthMonth', 2) } placeholder="월" inputMode="numeric" />
              <FormInput width={ 120 } value={ form.birthDay } onChange={ setDigits('birthDay', 2) } placeholder="일" inputMode="numeric" />
            </Box>
          </SignupField>
        </Box>
        <DarkButton type="submit" width={ 480 } height={ 60 } sx={ { mt: 3 } }>회원가입 하기</DarkButton>
      </Box>
    </PageContainer>
  );
}

export default SignupPage;
