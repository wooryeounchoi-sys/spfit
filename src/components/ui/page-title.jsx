import Box from '@mui/material/Box';

/**
 * PageTitle 컴포넌트 - 페이지 상단 제목
 *
 * Props:
 * @param {node} children - 제목 [Required]
 * @param {number} fontSize - 글자 크기 [Optional, 기본값: 30]
 *
 * Example usage:
 * <PageTitle>로그인</PageTitle>
 */
function PageTitle({ children, fontSize = 30 }) {
  return (
    <Box component="h1" sx={ { m: 0, mb: 4, fontSize, fontWeight: 600, color: '#000000', textAlign: 'center' } }>
      { children }
    </Box>
  );
}

export default PageTitle;
