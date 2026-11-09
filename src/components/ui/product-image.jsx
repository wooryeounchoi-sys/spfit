import Box from '@mui/material/Box';
import { imageUrl } from '../../utils/image-url';

/**
 * ProductImage 컴포넌트 - 상품 이미지 (이미지가 없으면 빈 영역 + "이미지 준비중")
 *
 * Props:
 * @param {string} path - DB 이미지 경로 [Optional]
 * @param {string} alt - 대체 텍스트 [Required]
 * @param {object} sx - 영역 스타일 [Optional]
 * @param {boolean} isEmptyText - 이미지 없을 때 안내 문구 표시 여부 [Optional, 기본값: true]
 *
 * Example usage:
 * <ProductImage path={product.image_path} alt={product.name} sx={{ width: 410, height: 500 }} />
 */
function ProductImage({ path, alt, sx, isEmptyText = true }) {
  return (
    <Box
      sx={ {
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#F2F2F2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...sx,
      } }
    >
      { path ? (
        <Box
          component="img"
          src={ imageUrl(path) }
          alt={ alt }
          loading="lazy"
          className="product-image__img"
          sx={ { width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' } }
        />
      ) : (
        isEmptyText && <Box sx={ { fontSize: 13, color: '#9A9A9A', letterSpacing: 1 } }>이미지 준비중</Box>
      ) }
    </Box>
  );
}

export default ProductImage;
