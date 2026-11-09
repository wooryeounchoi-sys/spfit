import { callRpc } from './rpc';

/** 리뷰 API */
export const getProductReviews = (productId, token) => callRpc('get_product_reviews', {
  p_product_id: productId,
  p_token: token || null,
});

export const createReview = (token, orderItemId, rating, content) => callRpc('create_review', {
  p_token: token,
  p_order_item_id: orderItemId,
  p_rating: rating,
  p_content: content,
});

export const updateReview = (token, reviewId, rating, content) => callRpc('update_review', {
  p_token: token,
  p_review_id: reviewId,
  p_rating: rating,
  p_content: content,
});

export const deleteReview = (token, reviewId) => callRpc('delete_review', {
  p_token: token,
  p_review_id: reviewId,
});

export const getMyReviews = (token) => callRpc('get_my_reviews', { p_token: token });
