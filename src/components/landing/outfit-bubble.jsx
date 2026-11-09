import Box from '@mui/material/Box';
import { Link as RouterLink } from 'react-router-dom';
import { formatPrice } from '../../utils/format-price';

/** 착장 구분 표시 문구 */
const SLOT_LABEL = { TOP: 'TOP', BOTTOM: 'Pants&Tights', SHOES: 'Shoes' };

/** 착장 구분별 말풍선 세로 위치 */
const SLOT_TOP = { TOP: '26%', BOTTOM: '50%', SHOES: '82%' };

/**
 * OutfitBubble 컴포넌트 - Style Magazine 카드의 착장 말풍선 (카드 테두리 밖까지 표시)
 *
 * Props:
 * @param {object} item - 착장 상품 { slot, product_id, category_id, name, price } [Required]
 *
 * Example usage:
 * <OutfitBubble item={item} />
 */
function OutfitBubble({ item }) {
  return (
    <Box
      component={ RouterLink }
      to={ `/products/${item.category_id}/${item.product_id}` }
      sx={ {
        position: 'absolute',
        left: '52%',
        top: SLOT_TOP[item.slot],
        transform: 'translateY(-50%)',
        bgcolor: '#FFFFFF',
        color: '#000000',
        textDecoration: 'none',
        px: 1.25,
        py: 0.75,
        whiteSpace: 'nowrap',
        lineHeight: 1.5,
        zIndex: 3,
        '&::before': {
          content: '""',
          position: 'absolute',
          left: -6,
          top: '50%',
          transform: 'translateY(-50%)',
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderRight: '6px solid #FFFFFF',
        },
        '&:hover': { bgcolor: '#F5F5F5' },
        '&:hover::before': { borderRightColor: '#F5F5F5' },
      } }
    >
      <Box sx={ { fontSize: 11, fontWeight: 700 } }>{ SLOT_LABEL[item.slot] }</Box>
      <Box sx={ { fontSize: 10 } }>{ item.name }</Box>
      <Box sx={ { fontSize: 10 } }>{ `가격:${formatPrice(item.price)}` }</Box>
    </Box>
  );
}

export default OutfitBubble;
