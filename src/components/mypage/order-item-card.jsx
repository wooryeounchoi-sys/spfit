import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { DELIVERY_STATUS_LABEL } from '../../utils/delivery-status';
import { formatPrice } from '../../utils/format-price';
import ProductImage from '../ui/product-image';

/**
 * OrderItemCard 컴포넌트 - 구매 내역 카드 (800*200px)
 * 사진(190*190) / 제품명·가격·색상·사이즈·수량·배송 현황 / 오른쪽 "리뷰 쓰기"
 *
 * Props:
 * @param {object} item - 주문 상품 { product_name, unit_price, color, size, quantity, image_path, review_id, product_id, category_id } [Required]
 * @param {string} deliveryStatus - READY | SHIPPING | DELIVERED [Required]
 * @param {function} onWriteReview - 리뷰 쓰기 클릭 시 실행 [Required]
 *
 * Example usage:
 * <OrderItemCard item={item} deliveryStatus="DELIVERED" onWriteReview={open} />
 */
function OrderItemCard({ item, deliveryStatus, onWriteReview }) {
  const navigate = useNavigate();
  const isReviewed = Boolean(item.review_id);
  const canOpenDetail = item.product_id && item.category_id;

  return (
    <Box
      sx={ {
        width: '100%',
        maxWidth: 800,
        minHeight: 200,
        mx: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 2.5,
        p: '5px',
        pr: 3,
        bgcolor: '#FFFFFF',
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
      } }
    >
      <Box
        onClick={ () => canOpenDetail && navigate(`/products/${item.category_id}/${item.product_id}`) }
        sx={ { cursor: canOpenDetail ? 'pointer' : 'default' } }
      >
        <ProductImage path={ item.image_path } alt={ item.product_name } sx={ { width: 190, height: 190 } } isEmptyText={ false } />
      </Box>
      <Box sx={ { flex: 1, minWidth: 0, fontSize: 15, lineHeight: 1.7 } }>
        <Box sx={ { fontWeight: 700 } }>{ item.product_name }</Box>
        <Box>{ `${formatPrice(item.unit_price)} · ${item.quantity}개` }</Box>
        <Box sx={ { color: '#666666' } }>{ `색상: ${item.color} / 사이즈: ${item.size}` }</Box>
        <Box sx={ { mt: 0.5, fontWeight: 700, color: deliveryStatus === 'DELIVERED' ? '#3FC837' : '#000000' } }>
          { DELIVERY_STATUS_LABEL[deliveryStatus] }
        </Box>
      </Box>
      <Button
        onClick={ onWriteReview }
        disabled={ isReviewed }
        sx={ {
          flexShrink: 0,
          width: 120,
          height: 44,
          fontSize: 15,
          color: '#FFFFFF',
          bgcolor: '#363A36',
          '&:hover': { bgcolor: '#1F221F' },
          '&.Mui-disabled': { color: '#666666', bgcolor: '#EDEDED' },
        } }
      >
        { isReviewed ? '리뷰 완료' : '리뷰 쓰기' }
      </Button>
    </Box>
  );
}

export default OrderItemCard;
