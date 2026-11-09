import Box from '@mui/material/Box';

/**
 * FormColumn 컴포넌트 - 로그인/회원가입 등 폼 페이지의 중앙 정렬 세로 영역
 *
 * Props:
 * @param {node} children - 폼 내용 [Required]
 * @param {function} onSubmit - 폼 제출 시 실행 (Enter 키 포함) [Optional]
 * @param {number} width - 영역 너비 [Optional, 기본값: 390]
 * @param {number} gap - 요소 간격 [Optional, 기본값: 1.5]
 *
 * Example usage:
 * <FormColumn onSubmit={handleLogin}>...</FormColumn>
 */
function FormColumn({ children, onSubmit, width = 390, gap = 1.5 }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.();
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={ handleSubmit }
      sx={ {
        width: '100%',
        maxWidth: width,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap,
        '& > *': { maxWidth: '100% !important' },
      } }
    >
      { children }
    </Box>
  );
}

export default FormColumn;
