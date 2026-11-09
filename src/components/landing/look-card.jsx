import Box from '@mui/material/Box';
import { imageUrl } from '../../utils/image-url';
import OutfitBubble from './outfit-bubble';

/**
 * LookCard 컴포넌트 - Style Magazine 카드 (430*600px), hover 시 착장 말풍선 표시
 *
 * Props:
 * @param {object} magazine - { id, image_path, items: [{ slot, name, price, ... }] } [Required]
 *
 * Example usage:
 * <LookCard magazine={magazine} />
 */
function LookCard({ magazine }) {
  return (
    <Box
      className="look-card"
      sx={ {
        position: 'relative',
        width: '100%',
        aspectRatio: '430 / 600',
        '& .look-card__bubbles': { opacity: 0, visibility: 'hidden', transition: 'opacity 0.25s' },
        '&:hover': { zIndex: 5 },
        '&:hover .look-card__bubbles': { opacity: 1, visibility: 'visible' },
        '&:hover .look-card__img': { transform: 'scale(1.03)' },
      } }
    >
      <Box sx={ { width: '100%', height: '100%', overflow: 'hidden', bgcolor: '#F2F2F2' } }>
        <Box
          component="img"
          className="look-card__img"
          src={ imageUrl(magazine.image_path) }
          alt="Style Magazine 착장"
          loading="lazy"
          sx={ { width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' } }
        />
      </Box>
      <Box className="look-card__bubbles">
        { magazine.items.map((item) => (
          <OutfitBubble key={ item.slot } item={ item } />
        )) }
      </Box>
    </Box>
  );
}

export default LookCard;
