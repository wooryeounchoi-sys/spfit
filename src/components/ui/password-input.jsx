import { forwardRef, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import FormInput from './form-input';

/**
 * PasswordInput 컴포넌트 - '*' 로 가려지고, 오른쪽 끝 아이콘으로 내용을 볼 수 있는 입력창
 *
 * Props:
 * @param {string} value - 입력값 [Required]
 * @param {function} onChange - 입력 변경 시 실행 [Required]
 * @param {string} placeholder - 안내 문구 [Optional]
 * @param {number} width - 너비 [Optional, 기본값: 390]
 *
 * Example usage:
 * <PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} placeholder="비밀번호" />
 */
const PasswordInput = forwardRef(function PasswordInput({ value, onChange, placeholder, width = 390, ...rest }, ref) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <FormInput
      ref={ ref }
      value={ value }
      onChange={ onChange }
      placeholder={ placeholder }
      width={ width }
      type={ isVisible ? 'text' : 'password' }
      endAdornment={ (
        <InputAdornment position="end">
          <IconButton
            size="small"
            aria-label={ isVisible ? '비밀번호 숨기기' : '비밀번호 보기' }
            onClick={ () => setIsVisible((prev) => !prev) }
            edge="end"
          >
            { isVisible ? <VisibilityOffOutlined fontSize="small" /> : <VisibilityOutlined fontSize="small" /> }
          </IconButton>
        </InputAdornment>
      ) }
      { ...rest }
    />
  );
});

export default PasswordInput;
