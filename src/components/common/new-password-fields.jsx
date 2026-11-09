import Box from '@mui/material/Box';
import PasswordInput from '../ui/password-input';
import SideLabel from '../ui/side-label';

/**
 * NewPasswordFields 컴포넌트 - "변경 비밀번호" + "변경 비밀번호 확인" 입력 + 일치 여부 표시
 * (마이페이지 비밀번호 변경 / 비밀번호 재설정 에서 공통 사용)
 *
 * Props:
 * @param {string} password - 변경 비밀번호 [Required]
 * @param {string} confirm - 변경 비밀번호 확인 [Required]
 * @param {function} onPasswordChange - 변경 비밀번호 입력 시 실행 [Required]
 * @param {function} onConfirmChange - 확인 입력 시 실행 [Required]
 * @param {object} passwordRef - 변경 비밀번호 입력창 ref [Optional]
 * @param {object} confirmRef - 확인 입력창 ref [Optional]
 *
 * Example usage:
 * <NewPasswordFields password={pw} confirm={pw2} onPasswordChange={setPw} onConfirmChange={setPw2} />
 */
function NewPasswordFields({ password, confirm, onPasswordChange, onConfirmChange, passwordRef, confirmRef }) {
  const isMatchVisible = password.length > 0 && confirm.length > 0;
  const isMatch = password === confirm;

  return (
    <>
      <Box sx={ { position: 'relative' } }>
        <PasswordInput
          ref={ passwordRef }
          value={ password }
          onChange={ (e) => onPasswordChange(e.target.value) }
          placeholder="변경 비밀번호"
          autoComplete="new-password"
        />
        { isMatchVisible && <SideLabel text={ isMatch ? '비밀번호 일치.' : '비밀번호 불일치.' } isPositive={ isMatch } /> }
      </Box>
      <PasswordInput
        ref={ confirmRef }
        value={ confirm }
        onChange={ (e) => onConfirmChange(e.target.value) }
        placeholder="변경 비밀번호 확인"
        autoComplete="new-password"
      />
    </>
  );
}

export default NewPasswordFields;
