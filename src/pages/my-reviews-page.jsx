import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { deleteReview, getMyReviews, updateReview } from '../api/review-api';
import PageContainer from '../components/common/page-container';
import MyReviewCard from '../components/mypage/my-review-card';
import PageTitle from '../components/ui/page-title';
import StatusMessage from '../components/ui/status-message';
import useApiError from '../hooks/use-api-error';
import useAuth from '../hooks/use-auth';
import usePopup from '../hooks/use-popup';

/**
 * MyReviewsPage 컴포넌트 - 내가 쓴 리뷰 (수정 / 삭제 → 상품 상세 리뷰에도 동일 반영)
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/mypage/reviews" element={<MyReviewsPage />} />
 */
function MyReviewsPage() {
  const showPopup = usePopup();
  const handleError = useApiError();
  const { token } = useAuth();
  const [reviews, setReviews] = useState(null);

  const load = useCallback(() => {
    getMyReviews(token).then(setReviews).catch(handleError);
  }, [token, handleError]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = (review) => async (content) => {
    if (!content.trim()) {
      await showPopup({ message: '리뷰 내용을 입력해주세요.' });
      return false;
    }
    try {
      await updateReview(token, review.id, review.rating, content);
      await showPopup({ message: '리뷰가 수정되었습니다.' });
      load();
      return true;
    } catch (error) {
      handleError(error);
      return false;
    }
  };

  const handleDelete = (review) => async () => {
    try {
      await deleteReview(token, review.id);
      await showPopup({ message: '리뷰가 삭제되었습니다.' });
      load();
    } catch (error) {
      handleError(error);
    }
  };

  if (!reviews) {
    return <StatusMessage isLoading />;
  }

  return (
    <PageContainer maxWidth={ 800 } bgcolor="#F5F5F5">
      <PageTitle>내가 쓴 리뷰</PageTitle>
      { reviews.length === 0 ? (
        <StatusMessage message="작성한 리뷰가 없습니다." />
      ) : (
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.5 } }>
          { reviews.map((review) => (
            <MyReviewCard
              key={ `${review.id}-${review.content}` }
              review={ review }
              onSave={ handleSave(review) }
              onDelete={ handleDelete(review) }
            />
          )) }
        </Box>
      ) }
    </PageContainer>
  );
}

export default MyReviewsPage;
