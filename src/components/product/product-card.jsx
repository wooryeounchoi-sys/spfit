import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import ShoppingBagOutlined from '@mui/icons-material/ShoppingBagOutlined';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/format-price';
import ProductImage from '../ui/product-image';

const iconSx = { bgcolor: 'rgba(255,255,255,0.9)', color: '#000000', '&:hover': { bgcolor: '#FFFFFF' } };

/**
 * ProductCard 컴포넌트 - 상품 카드 (410*500px 이미지, 우측 상단 좋아요/장바구니, 하단 제품명/가격)
 *
 * Props:
 * @param {object} product - { id, name, price, image_path, category_id } [Required]
 * @param {boolean} isLiked - 좋아요 여부 [Optional, 기본값: false]
 * @param {function} onToggleLike - 좋아요 클릭 시 실행 [Required]
 * @param {function} onAddCart - 장바구니 클릭 시 실행 [Required]
 *
 * Example usage:
 * <ProductCard product={product} isLiked onToggleLike={handleLike} onAddCart={handleCart} />
 */
function ProductCard({ product, isLiked = false, onToggleLike, onAddCart }) {
  const navigate = useNavigate();
  const isSoldOut = product.sale_status === 'SOLD_OUT';

  const goDetail = () => navigate(`/products/${product.category_id}/${product.id}`);

  return (
    <Box
      sx={ {
        width: '100%',
        maxWidth: 410,
        cursor: 'pointer',
        '&:hover .product-image__img': { transform: 'scale(1.04)' },
      } }
      onClick={ goDetail }
    >
      <Box sx={ { position: 'relative' } }>
        <ProductImage path={ product.image_path } alt={ product.name } sx={ { width: '100%', aspectRatio: '410 / 500' } } />
        <Box sx={ { position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1 } }>
          <IconButton
            size="small"
            aria-label={ isLiked ? '좋아요 취소' : '좋아요' }
            sx={ iconSx }
            onClick={ (event) => {
              event.stopPropagation();
              onToggleLike(product);
            } }
          >
            { isLiked ? <Favorite fontSize="small" sx={ { color: '#F60606' } } /> : <FavoriteBorder fontSize="small" /> }
          </IconButton>
          <IconButton
            size="small"
            aria-label="장바구니 담기"
            sx={ iconSx }
            disabled={ isSoldOut }
            onClick={ (event) => {
              event.stopPropagation();
              onAddCart(product);
            } }
          >
            <ShoppingBagOutlined fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Box sx={ { mt: 2, fontSize: 15, color: '#000000', lineHeight: 1.5 } }>{ product.name }</Box>
      <Box sx={ { mt: 0.5, fontSize: 15, fontWeight: 700, color: '#000000' } }>
        { isSoldOut ? '품절' : formatPrice(product.price) }
      </Box>
    </Box>
  );
}

export default ProductCard;
