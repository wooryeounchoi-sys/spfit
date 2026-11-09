import Box from '@mui/material/Box';
import { Link as RouterLink } from 'react-router-dom';
import { imageUrl } from '../../utils/image-url';

const rowSx = { display: 'flex', gap: 2, py: 1.25, borderTop: '1px solid #EAEAEA', fontSize: 15, lineHeight: 1.5 };
const labelSx = { width: 90, flexShrink: 0, color: '#666666' };

/**
 * ShoeGuideCard 컴포넌트 - Check Your Shoes 카드 (사진 / 대표제품 / 목표 페이스 / 추천 고객)
 *
 * Props:
 * @param {object} guide - { title, representative_label, product_name, target_pace, recommended_for, image_path, category_id } [Required]
 *
 * Example usage:
 * <ShoeGuideCard guide={guide} />
 */
function ShoeGuideCard({ guide }) {
  return (
    <Box
      component={ RouterLink }
      to={ `/products/${guide.category_id}` }
      sx={ {
        display: 'block',
        color: '#000000',
        textDecoration: 'none',
        '& .shoe-guide-card__img': { transition: 'transform 0.5s' },
        '&:hover .shoe-guide-card__img': { transform: 'scale(1.06)' },
        '&:hover .shoe-guide-card__more': { gap: 1.5 },
      } }
    >
      <Box sx={ { position: 'relative', overflow: 'hidden', aspectRatio: '4 / 5', bgcolor: '#F2F2F2' } }>
        <Box
          component="img"
          className="shoe-guide-card__img"
          src={ imageUrl(guide.image_path) }
          alt={ guide.title }
          loading="lazy"
          sx={ { width: '100%', height: '100%', objectFit: 'cover', display: 'block' } }
        />
        <Box
          sx={ {
            position: 'absolute',
            inset: 'auto 0 0 0',
            p: { xs: 2, md: 3 },
            pt: 8,
            background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))',
            color: '#FFFFFF',
          } }
        >
          <Box sx={ { fontSize: { xs: 20, md: 26 }, fontWeight: 700 } }>{ guide.title }</Box>
          <Box className="shoe-guide-card__more" sx={ { display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, fontSize: 14, transition: 'gap 0.3s' } }>
            <span>FIND YOUR SHOES</span>
            <span aria-hidden="true">→</span>
          </Box>
        </Box>
      </Box>
      <Box sx={ { mt: 2 } }>
        <Box sx={ rowSx }>
          <Box sx={ labelSx }>대표 제품</Box>
          <Box sx={ { fontWeight: 700 } }>
            { guide.representative_label }
            { guide.product_name && (
              <Box component="span" sx={ { fontWeight: 400, color: '#666666' } }>{ ` (${guide.product_name})` }</Box>
            ) }
          </Box>
        </Box>
        <Box sx={ rowSx }>
          <Box sx={ labelSx }>목표 페이스</Box>
          <Box>{ guide.target_pace }</Box>
        </Box>
        <Box sx={ { ...rowSx, borderBottom: '1px solid #EAEAEA' } }>
          <Box sx={ labelSx }>추천 고객</Box>
          <Box>{ guide.recommended_for }</Box>
        </Box>
      </Box>
    </Box>
  );
}

export default ShoeGuideCard;
