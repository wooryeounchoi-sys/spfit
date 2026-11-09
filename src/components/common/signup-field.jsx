import Box from '@mui/material/Box';
import SideLabel from '../ui/side-label';

/**
 * SignupField 컴포넌트 - 회원가입 입력 항목 (라벨 10px Bold, 필수 '*' #3E98EC, 우측 안내 문구)
 *
 * Props:
 * @param {string} label - 항목 이름 [Required]
 * @param {boolean} isRequired - 필수 입력 여부 [Optional, 기본값: false]
 * @param {string} sideText - 입력창 우측 안내 문구 [Optional]
 * @param {boolean} isSidePositive - 안내 문구 긍정(초록) 여부 [Optional, 기본값: false]
 * @param {node} children - 입력창 [Required]
 *
 * Example usage:
 * <SignupField label="아이디" isRequired sideText="아이디 사용가능" isSidePositive><FormInput /></SignupField>
 */
function SignupField({ label, isRequired = false, sideText, isSidePositive = false, children }) {
  return (
    <Box>
      <Box component="label" sx={ { display: 'block', mb: 0.75, fontSize: 10, fontWeight: 700, color: '#000000' } }>
        { label }
        { isRequired && <Box component="span" sx={ { ml: 0.5, fontSize: 10, color: '#3E98EC' } }>*</Box> }
      </Box>
      <Box sx={ { position: 'relative', width: '100%', maxWidth: 390 } }>
        { children }
        <SideLabel text={ sideText } isPositive={ isSidePositive } />
      </Box>
    </Box>
  );
}

export default SignupField;
