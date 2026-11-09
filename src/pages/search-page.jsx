import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { useSearchParams } from 'react-router-dom';
import { searchProducts } from '../api/catalog-api';
import PageContainer from '../components/common/page-container';
import ProductGrid from '../components/product/product-grid';
import StatusMessage from '../components/ui/status-message';
import useAuth from '../hooks/use-auth';
import { errorMessage } from '../utils/error-message';

/**
 * SearchPage 컴포넌트 - 헤더 검색창 검색 결과 (상품명/카테고리명 검색)
 *
 * Props: 없음 (URL 의 q 파라미터 사용)
 *
 * Example usage:
 * <Route path="/search" element={<SearchPage />} />
 */
function SearchPage() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '';
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError(null);
    searchProducts(keyword, token)
      .then((data) => isActive && setProducts(data || []))
      .catch((err) => isActive && setError(err))
      .finally(() => isActive && setIsLoading(false));
    return () => {
      isActive = false;
    };
  }, [keyword, token]);

  return (
    <PageContainer>
      <Box sx={ { mb: 5, fontSize: 20, fontWeight: 700 } }>{ `'${keyword}' 검색 결과` }</Box>
      { error ? (
        <StatusMessage message={ errorMessage(error) } />
      ) : (
        <ProductGrid products={ products } isLoading={ isLoading } emptyMessage="검색 결과가 없습니다." />
      ) }
    </PageContainer>
  );
}

export default SearchPage;
