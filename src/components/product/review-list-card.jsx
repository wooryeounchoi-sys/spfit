import Box from '@mui/material/Box';
import Rating from '@mui/material/Rating';
import ProductImage from '../ui/product-image';

/**
 * ReviewListCard 컴포넌트 - 상품 후기 카드 (1100*200px), 내용이 길면 (...) 처리
 *
 * Props:
 * @param {object} review - { rating, content, writer_name, created_at, color, size, image_path } [Required]
 * @param {function} onClick - 카드 클릭 시 실행 (리뷰 상세 팝업) [Required]
 *
 * Example usage:
 * <ReviewListCard review={review} onClick={() => setOpenReview(review)} />
 */
function ReviewListCard({ review, onClick }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={ onClick }
      sx={ {
        width: '100%',
        maxWidth: 1100,
        height: { xs: 'auto', md: 200 },
        mx: 'auto',
        display: 'flex',
        gap: 3,
        p: 3,
        border: 'none',
        bgcolor: '#FFFFFF',
        borderBottom: '1px solid #EAEAEA',
        textAlign: 'left',
        font: 'inherit',
        cursor: 'pointer',
        '&:hover': { bgcolor: '#FAFAFA' },
      } }
    >
      <Box sx={ { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 } }>
        <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' } }>
          <Rating value={ review.rating } readOnly size="small" sx={ { color: '#000000' } } />
          <Box sx={ { fontSize: 13, fontWeight: 700 } }>{ review.writer_name }</Box>
          <Box sx={ { fontSize: 13, color: '#666666' } }>{ new Date(review.created_at).toLocaleDateString('ko-KR') }</Box>
          { review.is_mine && <Box sx={ { fontSize: 12, color: '#3FC837', fontWeight: 700 } }>내 리뷰</Box> }
        </Box>
        <Box sx={ { fontSize: 13, color: '#666666' } }>{ `옵션: ${review.color} / ${review.size}` }</Box>
        <Box
          sx={ {
            fontSize: 15,
            lineHeight: 1.6,
            color: '#000000',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          } }
        >
          { review.content }
        </Box>
      </Box>
      { review.image_path && (
        <ProductImage path={ review.image_path } alt="리뷰 사진" sx={ { width: 150, height: 150 } } />
      ) }
    </Box>
  );
}

export default ReviewListCard;
