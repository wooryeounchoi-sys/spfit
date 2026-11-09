import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { imageUrl } from '../../utils/image-url';

/**
 * AdBanner 컴포넌트 - 광고 배너 (1905*600px, 좌측 중간 문구 + 10px 아래 버튼)
 *
 * Props:
 * @param {object} banner - { image_path, headline, button_label, link_category_id, link_product_id } [Required]
 *
 * Example usage:
 * <AdBanner banner={adBanner} />
 */
function AdBanner({ banner }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (banner.link_product_id && banner.link_product_category_id) {
      navigate(`/products/${banner.link_product_category_id}/${banner.link_product_id}`);
    } else if (banner.link_category_id) {
      navigate(`/products/${banner.link_category_id}`);
    }
  };

  return (
    <Box
      component="section"
      aria-label="광고 배너"
      sx={ {
        position: 'relative',
        width: '100%',
        height: { xs: 360, md: 600 },
        backgroundImage: `url(${imageUrl(banner.image_path)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } }
    >
      <Box
        sx={ {
          position: 'absolute',
          left: { xs: 16, md: 50 },
          top: '50%',
          transform: 'translateY(-50%)',
        } }
      >
        <Box sx={ { fontSize: { xs: 24, md: 35 }, fontWeight: 700, color: '#000000', lineHeight: 1.3 } }>
          { banner.headline }
        </Box>
        { banner.button_label && (
          <Button
            onClick={ handleClick }
            sx={ {
              mt: '10px',
              width: { xs: 260, md: 350 },
              height: 50,
              fontSize: { xs: 28, md: 40 },
              fontWeight: 200,
              lineHeight: 1,
              color: '#FFFFFF',
              bgcolor: '#000000',
              '&:hover': { bgcolor: '#363A36' },
            } }
          >
            { banner.button_label }
          </Button>
        ) }
      </Box>
    </Box>
  );
}

export default AdBanner;
