import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Close from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../../utils/format-price';
import ProductImage from '../ui/product-image';
import QuantityStepper from '../ui/quantity-stepper';

/**
 * CartItemCard 컴포넌트 - 장바구니/구매 상품 카드 (800*150px)
 * 체크박스 / 사진(140*140) / 제품명·가격·색상·사이즈·수량 / 삭제(X)
 *
 * Props:
 * @param {object} item - { product_id, category_id, product_name, unit_price, color, size, quantity, stock, image_path, is_available } [Required]
 * @param {boolean} isEditable - 체크/수량변경/삭제 가능 여부 [Optional, 기본값: true]
 * @param {boolean} isChecked - 체크 여부 [Optional, 기본값: false]
 * @param {function} onCheck - 체크 변경 시 실행 [Optional]
 * @param {function} onQuantityChange - 수량 변경 시 실행 [Optional]
 * @param {function} onRemove - 삭제 클릭 시 실행 [Optional]
 *
 * Example usage:
 * <CartItemCard item={item} isChecked onCheck={toggle} onQuantityChange={change} onRemove={remove} />
 */
function CartItemCard({ item, isEditable = true, isChecked = false, onCheck, onQuantityChange, onRemove }) {
  const navigate = useNavigate();
  const isUnavailable = isEditable && item.is_available === false;

  const goDetail = () => {
    if (item.product_id && item.category_id) {
      navigate(`/products/${item.category_id}/${item.product_id}`);
    }
  };

  return (
    <Box
      onClick={ goDetail }
      sx={ {
        position: 'relative',
        width: '100%',
        maxWidth: 800,
        minHeight: 150,
        mx: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: '5px',
        bgcolor: '#FFFFFF',
        cursor: 'pointer',
        '&:hover': { bgcolor: '#FCFCFC' },
      } }
    >
      { isEditable && (
        <Checkbox
          checked={ isChecked }
          disabled={ isUnavailable }
          onClick={ (event) => event.stopPropagation() }
          onChange={ (event) => onCheck(event.target.checked) }
          slotProps={ { input: { 'aria-label': `${item.product_name} 선택` } } }
          sx={ { color: '#000000', '&.Mui-checked': { color: '#000000' } } }
        />
      ) }
      <ProductImage path={ item.image_path } alt={ item.product_name } sx={ { width: 140, height: 140 } } isEmptyText={ false } />
      <Box sx={ { flex: 1, minWidth: 0, fontSize: 15, lineHeight: 1.6, pr: isEditable ? 4 : 0 } }>
        <Box sx={ { fontWeight: 700 } }>{ item.product_name }</Box>
        <Box>{ formatPrice(item.unit_price) }</Box>
        <Box sx={ { color: '#666666' } }>{ `색상: ${item.color} / 사이즈: ${item.size}` }</Box>
        { isEditable ? (
          <Box sx={ { display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 } }>
            <span>수량</span>
            <QuantityStepper value={ item.quantity } onChange={ onQuantityChange } max={ item.stock } />
            { isUnavailable && <Box component="span" sx={ { fontSize: 13, color: '#F60606' } }>구매 불가 (재고 부족/판매 중지)</Box> }
          </Box>
        ) : (
          <Box>{ `수량: ${item.quantity}개` }</Box>
        ) }
      </Box>
      { isEditable && (
        <IconButton
          aria-label={ `${item.product_name} 삭제` }
          onClick={ (event) => {
            event.stopPropagation();
            onRemove();
          } }
          sx={ { position: 'absolute', top: 8, right: 8 } }
        >
          <Close />
        </IconButton>
      ) }
    </Box>
  );
}

export default CartItemCard;
