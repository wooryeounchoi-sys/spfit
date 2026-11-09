import { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import ShoppingBagOutlined from '@mui/icons-material/ShoppingBagOutlined';
import { useNavigate } from 'react-router-dom';
import { addToCart, toggleLike } from '../../api/shop-api';
import useApiError from '../../hooks/use-api-error';
import useAuth from '../../hooks/use-auth';
import useLoginGuard from '../../hooks/use-login-guard';
import usePopup from '../../hooks/use-popup';
import { formatPrice } from '../../utils/format-price';
import DarkButton from '../ui/dark-button';
import QuantityStepper from '../ui/quantity-stepper';
import OptionSelector from './option-selector';

const POPUP_COLOR = '#3FC837';

/**
 * ProductInfoPanel 컴포넌트 - 상품 상세 우측 정보 (제품명/좋아요/장바구니/가격/후기 개수/색상/사이즈/구매)
 *
 * Props:
 * @param {object} product - get_product_detail 결과 [Required]
 * @param {number} reviewCount - 후기 개수 [Required]
 * @param {function} onReviewCountClick - 후기 개수 클릭 시 실행 (후기 영역으로 스크롤) [Optional]
 *
 * Example usage:
 * <ProductInfoPanel product={product} reviewCount={3} />
 */
function ProductInfoPanel({ product, reviewCount, onReviewCountClick }) {
  const navigate = useNavigate();
  const showPopup = usePopup();
  const { token, isLoggedIn } = useAuth();
  const requireLogin = useLoginGuard(POPUP_COLOR);
  const handleError = useApiError(POPUP_COLOR);
  const [isLiked, setIsLiked] = useState(product.is_liked);
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  const selected = product.options.find((option) => option.color === color && option.size === size);
  const isSoldOut = product.sale_status !== 'ON_SALE' || product.options.every((option) => option.stock <= 0);

  const ensureOption = async () => {
    if (selected) {
      return true;
    }
    await showPopup({ message: '색상과 사이즈를 선택해주세요.', confirmColor: POPUP_COLOR });
    return false;
  };

  const handleLike = async () => {
    if (!(await requireLogin())) {
      return;
    }
    try {
      const result = await toggleLike(token, product.id);
      setIsLiked(result.is_liked);
    } catch (error) {
      handleError(error);
    }
  };

  const handleCart = async () => {
    if (!(await requireLogin()) || !(await ensureOption())) {
      return;
    }
    try {
      await addToCart(token, selected.id, quantity);
      await showPopup({ message: '장바구니에 담았습니다.', confirmColor: POPUP_COLOR });
    } catch (error) {
      handleError(error);
    }
  };

  const handleBuy = async () => {
    if (!(await ensureOption())) {
      return;
    }
    navigate('/checkout', {
      state: {
        items: [{
          option_id: selected.id,
          product_id: product.id,
          category_id: product.category_id,
          product_name: product.name,
          color: selected.color,
          size: selected.size,
          unit_price: selected.price,
          quantity,
          image_path: product.images[0]?.image_path || null,
        }],
      },
    });
  };

  return (
    <Box sx={ { width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 3 } }>
      <Box sx={ { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 } }>
        <Box component="h1" sx={ { m: 0, fontSize: { xs: 22, md: 28 }, fontWeight: 700, lineHeight: 1.4 } }>
          { product.name }
        </Box>
        <Box sx={ { display: 'flex', flexShrink: 0 } }>
          <IconButton aria-label={ isLiked ? '좋아요 취소' : '좋아요' } onClick={ handleLike } sx={ { color: '#000000' } }>
            { isLiked ? <Favorite sx={ { color: '#F60606' } } /> : <FavoriteBorder /> }
          </IconButton>
          <IconButton aria-label="장바구니 담기" onClick={ handleCart } sx={ { color: '#000000' } } disabled={ isSoldOut }>
            <ShoppingBagOutlined />
          </IconButton>
        </Box>
      </Box>
      <Box>
        <Box sx={ { fontSize: 24, fontWeight: 700 } }>{ formatPrice(selected ? selected.price : product.price) }</Box>
        <Box
          component="button"
          type="button"
          onClick={ onReviewCountClick }
          sx={ { mt: 1, p: 0, border: 'none', bgcolor: 'transparent', font: 'inherit', fontSize: 14, color: '#666666', cursor: 'pointer', textDecoration: 'underline' } }
        >
          { `후기 ${reviewCount}개` }
        </Box>
      </Box>
      { product.description && <Box sx={ { fontSize: 15, color: '#333333', lineHeight: 1.6 } }>{ product.description }</Box> }
      { product.options.length > 0 && (
        <OptionSelector
          options={ product.options }
          color={ color }
          size={ size }
          onColorChange={ setColor }
          onSizeChange={ setSize }
        />
      ) }
      <Box sx={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }>
        <Box sx={ { fontSize: 15, fontWeight: 700 } }>수량</Box>
        <QuantityStepper value={ quantity } onChange={ setQuantity } max={ selected?.stock ?? 99 } />
      </Box>
      { isLoggedIn ? (
        <DarkButton width={ 520 } height={ 56 } onClick={ handleBuy } isDisabled={ isSoldOut }>
          { isSoldOut ? '품절' : '구매' }
        </DarkButton>
      ) : (
        <DarkButton width={ 520 } height={ 56 } onClick={ () => navigate('/login') }>로그인 하기</DarkButton>
      ) }
    </Box>
  );
}

export default ProductInfoPanel;
