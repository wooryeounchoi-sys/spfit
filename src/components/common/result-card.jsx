import Box from '@mui/material/Box';

/**
 * ResultCard 컴포넌트 - 아이디 찾기 / 비밀번호 재설정 결과 카드 (420*200px)
 *
 * Props:
 * @param {string} title - 결과 제목 [Required]
 * @param {node} children - 결과 내용 [Optional]
 *
 * Example usage:
 * <ResultCard title="아이디 찾기 성공!">spfit01</ResultCard>
 */
function ResultCard({ title, children }) {
  return (
    <Box
      sx={ {
        width: '100%',
        maxWidth: 420,
        minHeight: 200,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        bgcolor: '#F5F5F5',
        px: 3,
        textAlign: 'center',
      } }
    >
      <Box sx={ { fontSize: 20, fontWeight: 700 } }>{ title }</Box>
      { children && <Box sx={ { fontSize: 15, lineHeight: 1.6 } }>{ children }</Box> }
    </Box>
  );
}

export default ResultCard;
