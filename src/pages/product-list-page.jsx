import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import { getProducts } from '../api/catalog-api';
import PageContainer from '../components/common/page-container';
import CategoryDropdowns from '../components/product/category-dropdowns';
import ProductGrid from '../components/product/product-grid';
import StatusMessage from '../components/ui/status-message';
import useAuth from '../hooks/use-auth';
import useCategories from '../hooks/use-categories';
import { errorMessage } from '../utils/error-message';

/**
 * ProductListPage 컴포넌트 - 카테고리별 제품 목록 (모든 카테고리가 같은 양식, 데이터만 다름)
 *
 * Props: 없음 (URL 의 categoryId 사용)
 *
 * Example usage:
 * <Route path="/products/:categoryId" element={<ProductListPage />} />
 */
function ProductListPage() {
  const { categoryId } = useParams();
  const id = Number(categoryId);
  const { token } = useAuth();
  const { categories, error: categoryError } = useCategories();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setError(null);
    getProducts(id, token)
      .then((data) => {
        if (isActive) {
          setProducts(data || []);
        }
      })
      .catch((err) => {
        if (isActive) {
          setError(err);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });
    return () => {
      isActive = false;
    };
  }, [id, token]);

  const isKnownCategory = categories.some((category) => category.id === id);

  return (
    <PageContainer>
      <Box sx={ { mb: { xs: 3, md: 5 }, minHeight: 40 } }>
        { isKnownCategory && <CategoryDropdowns categories={ categories } categoryId={ id } /> }
      </Box>
      { error || categoryError ? (
        <StatusMessage message={ errorMessage(error || categoryError) } />
      ) : (
        <ProductGrid products={ products } isLoading={ isLoading } />
      ) }
    </PageContainer>
  );
}

export default ProductListPage;
