import Box from '@mui/material/Box';

/**
 * SectionTitle 컴포넌트 - 메인 페이지 섹션 제목
 *
 * Props:
 * @param {node} children - 제목 [Required]
 * @param {string} subtitle - 보조 설명 [Optional]
 *
 * Example usage:
 * <SectionTitle subtitle="러너들의 데일리 룩">Style Magazine</SectionTitle>
 */
function SectionTitle({ children, subtitle }) {
  return (
    <Box sx={ { mb: { xs: 3, md: 5 } } }>
      <Box component="h2" sx={ { m: 0, fontSize: { xs: 24, md: 32 }, fontWeight: 700, color: '#000000', lineHeight: 1.3 } }>
        { children }
      </Box>
      { subtitle && (
        <Box sx={ { mt: 1, fontSize: { xs: 14, md: 16 }, color: '#666666' } }>{ subtitle }</Box>
      ) }
    </Box>
  );
}

export default SectionTitle;
