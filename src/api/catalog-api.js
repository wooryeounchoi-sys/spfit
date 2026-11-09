import { callRpc } from './rpc';

/** 카테고리 / 상품 / 메인 콘텐츠 조회 API */
export const getCategories = () => callRpc('get_categories');

export const getProducts = (categoryId, token) => callRpc('get_products', {
  p_category_id: categoryId,
  p_token: token || null,
});

export const searchProducts = (keyword, token) => callRpc('search_products', {
  p_keyword: keyword,
  p_token: token || null,
});

export const getProductDetail = (productId, token) => callRpc('get_product_detail', {
  p_product_id: productId,
  p_token: token || null,
});

export const getMainContents = () => callRpc('get_main_contents');
