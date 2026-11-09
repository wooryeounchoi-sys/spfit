import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Close from '@mui/icons-material/Close';
import { getProductDetail } from '../../api/catalog-api';
import { addToCart } from '../../api/shop-api';
import useApiError from '../../hooks/use-api-error';
import useAuth from '../../hooks/use-auth';
import usePopup from '../../hooks/use-popup';
import { formatPrice } from '../../utils/format-price';
import DarkButton from '../ui/dark-button';
import QuantityStepper from '../ui/quantity-stepper';
import StatusMessage from '../ui/status-message';
import OptionSelector from './option-selector';

const POPUP_COLOR = '#3FC837';

/**
 * AddCartDialog 컴포넌트 - 상품 카드의 장바구니 아이콘 클릭 시 옵션 선택 후 담기
 *
 * Props:
 * @param {number} productId - 담을 상품 ID (null 이면 닫힘) [Optional]
 * @param {function} onClose - 닫기 시 실행 [Required]
 *
 * Example usage:
 * <AddCartDialog productId={selectedId} onClose={() => setSelectedId(null)} />
 */
function AddCartDialog({ productId, onClose }) {
  const { token } = useAuth();
  const showPopup = usePopup();
  const handleError = useApiError(POPUP_COLOR);
  const [product, setProduct] = useState(null);
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!productId) {
      return undefined;
    }
    let isActive = true;
    setProduct(null);
    setColor('');
    setSize('');
    setQuantity(1);
    getProductDetail(productId, token)
      .then((data) => {
        if (isActive) {
          setProduct(data);
        }
      })
      .catch((error) => {
        onClose();
        handleError(error);
      });
    return () => {
      isActive = false;
    };
  }, [productId, token, onClose, handleError]);

  const selected = product?.options.find((option) => option.color === color && option.size === size);

  const handleSubmit = async () => {
    if (!selected) {
      await showPopup({ message: '색상과 사이즈를 선택해주세요.', confirmColor: POPUP_COLOR });
      return;
    }
    try {
      await addToCart(token, selected.id, quantity);
      onClose();
      await showPopup({ message: '장바구니에 담았습니다.', confirmColor: POPUP_COLOR });
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Dialog
      open={ Boolean(productId) }
      onClose={ onClose }
      slotProps={ { paper: { sx: { width: 480, maxWidth: 'calc(100% - 32px)', m: 2, p: { xs: 3, md: 4 } } } } }
    >
      <IconButton aria-label="닫기" onClick={ onClose } sx={ { position: 'absolute', top: 8, right: 8 } }>
        <Close />
      </IconButton>
      { !product ? (
        <StatusMessage isLoading />
      ) : (
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 3 } }>
          <Box>
            <Box sx={ { fontSize: 20, fontWeight: 700, pr: 4 } }>{ product.name }</Box>
            <Box sx={ { mt: 0.5, fontSize: 15 } }>{ formatPrice(selected ? selected.price : product.price) }</Box>
          </Box>
          <OptionSelector
            options={ product.options }
            color={ color }
            size={ size }
            onColorChange={ setColor }
            onSizeChange={ setSize }
          />
          <Box sx={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }>
            <Box sx={ { fontSize: 15, fontWeight: 700 } }>수량</Box>
            <QuantityStepper value={ quantity } onChange={ setQuantity } max={ selected?.stock ?? 99 } />
          </Box>
          <DarkButton width={ 480 } onClick={ handleSubmit }>장바구니 담기</DarkButton>
        </Box>
      ) }
    </Dialog>
  );
}

export default AddCartDialog;
