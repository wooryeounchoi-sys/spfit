import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';

/**
 * RatingSummary 컴포넌트 - 별점 정보 카드 (1140*220px)
 * 좌측(340px) 평균 별점 / 우측(800px) 5점~1점 막대 지표
 *
 * Props:
 * @param {number} average - 평균 별점 [Required]
 * @param {number} total - 전체 리뷰 수 [Required]
 * @param {Array} distribution - [{ rating, label, count }] (5점 → 1점 순) [Required]
 *
 * Example usage:
 * <RatingSummary average={4.5} total={10} distribution={distribution} />
 */
function RatingSummary({ average, total, distribution }) {
  return (
    <Box
      sx={ {
        width: '100%',
        maxWidth: 1140,
        minHeight: 220,
        mx: 'auto',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        bgcolor: '#F7F7F7',
      } }
    >
      <Box
        sx={ {
          width: { xs: '100%', md: 340 },
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 3,
        } }
      >
        <Box sx={ { fontSize: 15, color: '#666666' } }>평균 별점</Box>
        <Box sx={ { fontSize: 48, fontWeight: 700, lineHeight: 1.2 } }>{ Number(average).toFixed(1) }</Box>
        <Rating value={ Number(average) } precision={ 0.1 } readOnly sx={ { color: '#000000' } } />
        <Box sx={ { mt: 1, fontSize: 13, color: '#666666' } }>{ `리뷰 ${total}개` }</Box>
      </Box>
      <Box
        sx={ {
          width: { xs: '100%', md: 800 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 1.25,
          px: { xs: 3, md: 5 },
          py: 3,
        } }
      >
        { distribution.map((item) => {
          const ratio = total ? (item.count / total) * 100 : 0;
          return (
            <Box key={ item.rating } sx={ { display: 'flex', alignItems: 'center', gap: 2, fontSize: 13 } }>
              <Box sx={ { width: 36, flexShrink: 0, fontWeight: 700 } }>{ `${item.rating}점` }</Box>
              <Box sx={ { width: 100, flexShrink: 0 } }>{ item.label }</Box>
              <Box sx={ { flex: 1, height: 8, bgcolor: '#E2E2E2' } }>
                <Box sx={ { width: `${ratio}%`, height: '100%', bgcolor: '#000000', transition: 'width 0.4s' } } />
              </Box>
              <Box sx={ { width: 28, flexShrink: 0, textAlign: 'right' } }>{ item.count }</Box>
            </Box>
          );
        }) }
      </Box>
    </Box>
  );
}

export default RatingSummary;
