import { useEffect, useState } from 'react';
import { getLikedProducts } from '../api/shop-api';
import PageContainer from '../components/common/page-container';
import ProductGrid from '../components/product/product-grid';
import PageTitle from '../components/ui/page-title';
import useApiError from '../hooks/use-api-error';
import useAuth from '../hooks/use-auth';

/**
 * LikesPage 컴포넌트 - '좋아요' 누른 상품 (제품 목록과 같은 양식)
 * 좋아요를 취소하면 아이콘만 바뀌고, 새로고침 후 목록에서 사라짐
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/mypage/likes" element={<LikesPage />} />
 */
function LikesPage() {
  const { token } = useAuth();
  const handleError = useApiError();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getLikedProducts(token)
      .then(setProducts)
      .catch(handleError)
      .finally(() => setIsLoading(false));
  }, [token, handleError]);

  return (
    <PageContainer>
      <PageTitle>'좋아요' 누른 품목</PageTitle>
      <ProductGrid products={ products } isLoading={ isLoading } emptyMessage="'좋아요' 누른 상품이 없습니다." />
    </PageContainer>
  );
}

export default LikesPage;
