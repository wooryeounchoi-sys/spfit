import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Rating from '@mui/material/Rating';
import { Link as RouterLink } from 'react-router-dom';
import { imageUrl } from '../../utils/image-url';
import SectionTitle from '../ui/section-title';

/**
 * ReviewHighlight 컴포넌트 - 메인 페이지 Review 섹션 (최신 포토 리뷰 4개)
 *
 * Props:
 * @param {Array} reviews - 최신 리뷰 목록 [Required]
 *
 * Example usage:
 * <ReviewHighlight reviews={contents.recent_reviews} />
 */
function ReviewHighlight({ reviews }) {
  if (!reviews.length) {
    return null;
  }
  return (
    <Box component="section" sx={ { px: { xs: 2, md: '50px' }, py: { xs: 6, md: 10 } } }>
      <SectionTitle subtitle="SPFIT 러너들이 직접 남긴 후기">Review</SectionTitle>
      <Grid container spacing={ 3 }>
        { reviews.map((review) => (
          <Grid key={ review.id } size={ { xs: 12, sm: 6, lg: 3 } }>
            <Box
              component={ RouterLink }
              to={ `/products/${review.category_id}/${review.product_id}` }
              sx={ {
                display: 'block',
                color: '#000000',
                textDecoration: 'none',
                '&:hover .review-highlight__img': { transform: 'scale(1.04)' },
              } }
            >
              <Box sx={ { aspectRatio: '1 / 1', overflow: 'hidden', bgcolor: '#F2F2F2' } }>
                { review.image_path && (
                  <Box
                    component="img"
                    className="review-highlight__img"
                    src={ imageUrl(review.image_path) }
                    alt={ `${review.product_name} 리뷰 사진` }
                    loading="lazy"
                    sx={ { width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' } }
                  />
                ) }
              </Box>
              <Rating value={ review.rating } readOnly size="small" sx={ { mt: 2, color: '#000000' } } />
              <Box
                sx={ {
                  mt: 1,
                  fontSize: 15,
                  lineHeight: 1.6,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                } }
              >
                { review.content }
              </Box>
              <Box sx={ { mt: 1.5, fontSize: 13, color: '#666666' } }>
                { `${review.product_name} · ${review.writer_name}` }
              </Box>
            </Box>
          </Grid>
        )) }
      </Grid>
    </Box>
  );
}

export default ReviewHighlight;
