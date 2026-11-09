import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { getProductDetail } from '../api/catalog-api';
import { getProductReviews } from '../api/review-api';
import PageContainer from '../components/common/page-container';
import ProductGallery from '../components/product/product-gallery';
import ProductInfoPanel from '../components/product/product-info-panel';
import ProductReviews from '../components/product/product-reviews';
import StatusMessage from '../components/ui/status-message';
import useAuth from '../hooks/use-auth';
import { errorMessage } from '../utils/error-message';

/**
 * ProductDetailPage 컴포넌트 - 제품 상세 (모든 상품 공통 양식)
 *
 * Props: 없음 (URL 의 productId 사용)
 *
 * Example usage:
 * <Route path="/products/:categoryId/:productId" element={<ProductDetailPage />} />
 */
function ProductDetailPage() {
  const { productId } = useParams();
  const id = Number(productId);
  const { token } = useAuth();
  const [product, setProduct] = useState(undefined);
  const [reviewData, setReviewData] = useState(null);
  const [error, setError] = useState(null);

  const loadReviews = useCallback(() => {
    getProductReviews(id, token).then(setReviewData).catch(setError);
  }, [id, token]);

  useEffect(() => {
    let isActive = true;
    setProduct(undefined);
    setError(null);
    getProductDetail(id, token)
      .then((data) => isActive && setProduct(data))
      .catch((err) => isActive && setError(err));
    loadReviews();
    return () => {
      isActive = false;
    };
  }, [id, token, loadReviews]);

  const scrollToReviews = () => {
    document.getElementById('product-reviews')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (error) {
    return <StatusMessage message={ errorMessage(error) } />;
  }
  if (product === undefined) {
    return <StatusMessage isLoading />;
  }
  if (!product) {
    return <StatusMessage message="등록된 제품이 없습니다." />;
  }

  return (
    <PageContainer maxWidth={ 1240 }>
      <Box sx={ { display: 'flex', gap: 1, mb: 3, fontSize: 14, color: '#666666' } }>
        { product.category_path.map((category, index) => (
          <Box key={ category.id } sx={ { display: 'flex', gap: 1 } }>
            { index > 0 && <span>/</span> }
            <Box component={ RouterLink } to={ `/products/${category.id}` } sx={ { color: 'inherit', textDecoration: 'none', '&:hover': { color: '#000000' } } }>
              { category.name }
            </Box>
          </Box>
        )) }
      </Box>
      <Box sx={ { display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 4, md: 8 }, alignItems: 'flex-start' } }>
        <ProductGallery key={ product.id } images={ product.images } name={ product.name } />
        <ProductInfoPanel
          key={ product.id }
          product={ product }
          reviewCount={ reviewData?.total ?? product.review_count }
          onReviewCountClick={ scrollToReviews }
        />
      </Box>
      { reviewData && <ProductReviews product={ product } reviewData={ reviewData } onChanged={ loadReviews } /> }
    </PageContainer>
  );
}

export default ProductDetailPage;
