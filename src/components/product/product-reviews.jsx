import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { deleteReview, updateReview } from '../../api/review-api';
import { hasPurchased } from '../../api/shop-api';
import useApiError from '../../hooks/use-api-error';
import useAuth from '../../hooks/use-auth';
import useLoginGuard from '../../hooks/use-login-guard';
import usePopup from '../../hooks/use-popup';
import RatingSummary from './rating-summary';
import ReviewDialog from './review-dialog';
import ReviewListCard from './review-list-card';

const POPUP_COLOR = '#3FC837';

/**
 * ProductReviews 컴포넌트 - 상품 후기 (별점 정보 / 후기 카드 목록 / 리뷰 작성하기)
 *
 * Props:
 * @param {object} product - { id, name, images } [Required]
 * @param {object} reviewData - get_product_reviews 결과 [Required]
 * @param {function} onChanged - 리뷰 수정/삭제 후 다시 조회 [Required]
 *
 * Example usage:
 * <ProductReviews product={product} reviewData={reviewData} onChanged={reload} />
 */
function ProductReviews({ product, reviewData, onChanged }) {
  const navigate = useNavigate();
  const showPopup = usePopup();
  const { token } = useAuth();
  const requireLogin = useLoginGuard(POPUP_COLOR);
  const handleError = useApiError(POPUP_COLOR);
  const [openReview, setOpenReview] = useState(null);

  const handleWriteClick = async () => {
    if (!(await requireLogin())) {
      return;
    }
    try {
      const isPurchased = await hasPurchased(token, product.id);
      if (!isPurchased) {
        await showPopup({ message: '구매하지 않은 제품입니다.', confirmColor: POPUP_COLOR });
        return;
      }
      navigate('/mypage/orders');
    } catch (error) {
      handleError(error);
    }
  };

  const handleUpdate = async (rating, content) => {
    try {
      await updateReview(token, openReview.id, rating, content);
      setOpenReview(null);
      await showPopup({ message: '리뷰가 수정되었습니다.', confirmColor: POPUP_COLOR });
      onChanged();
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReview(token, openReview.id);
      setOpenReview(null);
      await showPopup({ message: '리뷰가 삭제되었습니다.', confirmColor: POPUP_COLOR });
      onChanged();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Box component="section" id="product-reviews" sx={ { mt: { xs: 8, md: 12 } } }>
      <Box component="h2" sx={ { m: 0, mb: 3, fontSize: 24, fontWeight: 700, maxWidth: 1140, mx: 'auto' } }>
        { `상품 후기 (${reviewData.total})` }
      </Box>
      <RatingSummary average={ reviewData.average } total={ reviewData.total } distribution={ reviewData.distribution } />
      <Box sx={ { mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' } }>
        { reviewData.reviews.length === 0 && (
          <Box sx={ { py: 6, fontSize: 15, color: '#666666' } }>아직 작성된 후기가 없습니다.</Box>
        ) }
        { reviewData.reviews.map((review) => (
          <ReviewListCard key={ review.id } review={ review } onClick={ () => setOpenReview(review) } />
        )) }
        <Button
          onClick={ handleWriteClick }
          sx={ { mt: 3, width: '100%', maxWidth: 1100, height: 56, fontSize: 16, fontWeight: 700, color: '#000000', bgcolor: '#F0F0F0', '&:hover': { bgcolor: '#E2E2E2' } } }
        >
          +리뷰 작성하기
        </Button>
      </Box>
      { openReview && (
        <ReviewDialog
          isOpen
          mode="view"
          info={ {
            image_path: openReview.image_path || product.images[0]?.image_path,
            writer_name: openReview.writer_name,
            product_name: openReview.product_name,
            color: openReview.color,
            size: openReview.size,
          } }
          initialRating={ openReview.rating }
          initialContent={ openReview.content }
          isMine={ openReview.is_mine }
          onClose={ () => setOpenReview(null) }
          onSubmit={ handleUpdate }
          onDelete={ handleDelete }
        />
      ) }
    </Box>
  );
}

export default ProductReviews;
