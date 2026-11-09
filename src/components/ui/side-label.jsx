import Box from '@mui/material/Box';

/**
 * SideLabel 컴포넌트 - 입력창 우측 옆 작은 안내 문구 (10px, 긍정=초록 / 부정=빨강)
 * 부모 요소는 position: relative 여야 한다.
 *
 * Props:
 * @param {string} text - 표시 문구 [Optional]
 * @param {boolean} isPositive - 긍정(초록) 여부 [Optional, 기본값: false]
 *
 * Example usage:
 * <SideLabel text="비밀번호 일치." isPositive />
 */
function SideLabel({ text, isPositive = false }) {
  if (!text) {
    return null;
  }
  return (
    <Box
      component="span"
      sx={ {
        position: { xs: 'static', md: 'absolute' },
        left: { md: 'calc(100% + 10px)' },
        top: { md: '50%' },
        transform: { md: 'translateY(-50%)' },
        display: 'block',
        mt: { xs: 0.5, md: 0 },
        fontSize: 10,
        whiteSpace: 'nowrap',
        color: isPositive ? '#22FF00' : '#F60606',
      } }
    >
      { text }
    </Box>
  );
}

export default SideLabel;
