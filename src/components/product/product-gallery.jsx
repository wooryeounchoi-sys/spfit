import { useState } from 'react';
import Box from '@mui/material/Box';
import ProductImage from '../ui/product-image';

/**
 * ProductGallery 컴포넌트 - 상품 상세 좌측 이미지 카드 (600*700px) + 썸네일
 *
 * Props:
 * @param {Array} images - [{ image_path }] [Required]
 * @param {string} name - 상품명 (대체 텍스트) [Required]
 *
 * Example usage:
 * <ProductGallery images={product.images} name={product.name} />
 */
function ProductGallery({ images, name }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <Box sx={ { width: '100%', maxWidth: 600 } }>
      <ProductImage path={ active?.image_path } alt={ name } sx={ { width: '100%', aspectRatio: '600 / 700' } } />
      { images.length > 1 && (
        <Box sx={ { display: 'flex', gap: 1, mt: 1.5 } }>
          { images.map((image, index) => (
            <Box
              key={ image.image_path }
              component="button"
              type="button"
              aria-label={ `${index + 1}번째 이미지 보기` }
              onClick={ () => setActiveIndex(index) }
              sx={ {
                p: 0,
                border: 'none',
                cursor: 'pointer',
                opacity: index === activeIndex ? 1 : 0.5,
                transition: 'opacity 0.2s',
                '&:hover': { opacity: 1 },
              } }
            >
              <ProductImage path={ image.image_path } alt="" sx={ { width: 80, height: 93 } } />
            </Box>
          )) }
        </Box>
      ) }
    </Box>
  );
}

export default ProductGallery;
