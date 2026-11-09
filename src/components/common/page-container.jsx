import Box from '@mui/material/Box';

/**
 * PageContainer 컴포넌트 - 페이지 본문 영역 (양쪽 여백 50px, 콘텐츠 중앙 정렬)
 *
 * Props:
 * @param {node} children - 페이지 내용 [Required]
 * @param {number} maxWidth - 콘텐츠 최대 너비 [Optional, 기본값: 1805]
 * @param {string} bgcolor - 배경색 [Optional, 기본값: '#FFFFFF']
 *
 * Example usage:
 * <PageContainer maxWidth={800} bgcolor="#F5F5F5">...</PageContainer>
 */
function PageContainer({ children, maxWidth = 1805, bgcolor = '#FFFFFF' }) {
  return (
    <Box
      sx={ {
        width: '100%',
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        bgcolor,
        px: { xs: 2, md: '50px' },
        py: { xs: 4, md: 8 },
      } }
    >
      <Box sx={ { width: '100%', maxWidth } }>{ children }</Box>
    </Box>
  );
}

export default PageContainer;
