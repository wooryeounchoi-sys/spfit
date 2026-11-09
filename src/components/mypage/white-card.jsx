import Box from '@mui/material/Box';

/**
 * WhiteCard 컴포넌트 - 마이페이지 정보 카드 (흰 배경, 윤곽선 없음)
 *
 * Props:
 * @param {node} children - 카드 내용 [Required]
 * @param {number} width - 최대 너비 [Optional, 기본값: 800]
 * @param {number} minHeight - 최소 높이 [Optional, 기본값: 0]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <WhiteCard width={600} minHeight={100}>홍길동</WhiteCard>
 */
function WhiteCard({ children, width = 800, minHeight = 0, sx }) {
  return (
    <Box
      sx={ {
        width: '100%',
        maxWidth: width,
        minHeight,
        mx: 'auto',
        bgcolor: '#FFFFFF',
        p: 3,
        fontSize: 15,
        color: '#000000',
        ...sx,
      } }
    >
      { children }
    </Box>
  );
}

export default WhiteCard;
