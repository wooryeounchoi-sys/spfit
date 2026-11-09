import { forwardRef } from 'react';
import InputBase from '@mui/material/InputBase';

/**
 * FormInput 컴포넌트 - 기본 입력창 (배경 #F0F0F0, 입력 글자 15px/#000000)
 *
 * Props:
 * @param {string} value - 입력값 [Required]
 * @param {function} onChange - 입력 변경 시 실행 [Required]
 * @param {string} placeholder - 안내 문구 [Optional]
 * @param {number|string} width - 너비 [Optional, 기본값: 390]
 * @param {number} height - 높이 [Optional, 기본값: 50]
 * @param {boolean} isMultiline - 여러 줄 입력 여부 [Optional, 기본값: false]
 * @param {node} endAdornment - 오른쪽 끝 요소(아이콘 등) [Optional]
 *
 * Example usage:
 * <FormInput value={id} onChange={(e) => setId(e.target.value)} placeholder="아이디" />
 */
const FormInput = forwardRef(function FormInput({
  value,
  onChange,
  placeholder,
  width = 390,
  height = 50,
  isMultiline = false,
  endAdornment,
  type = 'text',
  sx,
  ...rest
}, ref) {
  return (
    <InputBase
      inputRef={ ref }
      value={ value }
      onChange={ onChange }
      placeholder={ placeholder }
      type={ type }
      multiline={ isMultiline }
      endAdornment={ endAdornment }
      sx={ {
        width: '100%',
        maxWidth: width,
        height,
        bgcolor: '#F0F0F0',
        px: 2,
        py: isMultiline ? 1.5 : 0,
        fontSize: 15,
        color: '#000000',
        alignItems: isMultiline ? 'flex-start' : 'center',
        overflow: 'auto',
        '& input::placeholder, & textarea::placeholder': { color: '#000000', opacity: 0.6, fontSize: 15 },
        ...sx,
      } }
      { ...rest }
    />
  );
});

export default FormInput;
