import { useCallback, useState } from 'react';
import Grid from '@mui/material/Grid';
import { toggleLike } from '../../api/shop-api';
import useApiError from '../../hooks/use-api-error';
import useAuth from '../../hooks/use-auth';
import useLoginGuard from '../../hooks/use-login-guard';
import StatusMessage from '../ui/status-message';
import AddCartDialog from './add-cart-dialog';
import ProductCard from './product-card';

/**
 * ProductGrid 컴포넌트 - 상품 카드 4열 그리드 + 좋아요/장바구니 처리
 * 좋아요를 취소해도 목록에서 바로 사라지지 않고 아이콘만 변경 (새로고침 시 반영)
 *
 * Props:
 * @param {Array} products - 상품 목록 [Required]
 * @param {boolean} isLoading - 로딩 여부 [Optional, 기본값: false]
 * @param {string} emptyMessage - 상품이 없을 때 문구 [Optional, 기본값: '등록된 제품이 없습니다.']
 *
 * Example usage:
 * <ProductGrid products={products} isLoading={isLoading} />
 */
function ProductGrid({ products, isLoading = false, emptyMessage = '등록된 제품이 없습니다.' }) {
  const { token } = useAuth();
  const requireLogin = useLoginGuard();
  const handleError = useApiError();
  const [likeOverrides, setLikeOverrides] = useState({});
  const [cartProductId, setCartProductId] = useState(null);

  const handleToggleLike = async (product) => {
    if (!(await requireLogin())) {
      return;
    }
    try {
      const result = await toggleLike(token, product.id);
      setLikeOverrides((prev) => ({ ...prev, [product.id]: result.is_liked }));
    } catch (error) {
      handleError(error);
    }
  };

  const handleAddCart = async (product) => {
    if (await requireLogin()) {
      setCartProductId(product.id);
    }
  };

  const closeCartDialog = useCallback(() => setCartProductId(null), []);

  if (isLoading) {
    return <StatusMessage isLoading />;
  }
  if (!products.length) {
    return <StatusMessage message={ emptyMessage } />;
  }

  return (
    <>
      <Grid container columnSpacing={ { xs: 2, md: 3, xl: '55px' } } rowSpacing={ { xs: 4, md: 6 } }>
        { products.map((product) => (
          <Grid key={ product.id } size={ { xs: 6, md: 4, lg: 3 } } sx={ { display: 'flex', justifyContent: 'center' } }>
            <ProductCard
              product={ product }
              isLiked={ likeOverrides[product.id] ?? product.is_liked }
              onToggleLike={ handleToggleLike }
              onAddCart={ handleAddCart }
            />
          </Grid>
        )) }
      </Grid>
      <AddCartDialog productId={ cartProductId } onClose={ closeCartDialog } />
    </>
  );
}

export default ProductGrid;
