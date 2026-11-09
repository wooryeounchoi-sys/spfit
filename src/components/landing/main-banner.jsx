import Box from '@mui/material/Box';
import { imageUrl } from '../../utils/image-url';

/**
 * MainBanner 컴포넌트 - 메인 풀페이지 배너 (1905*800px, 우측 중간 슬로건)
 *
 * Props:
 * @param {object} banner - 배너 데이터 { image_path, headline, sub_headline } [Required]
 *
 * Example usage:
 * <MainBanner banner={mainBanner} />
 */
function MainBanner({ banner }) {
  return (
    <Box
      component="section"
      aria-label="메인 배너"
      sx={ {
        position: 'relative',
        width: '100%',
        height: { xs: 420, md: 800 },
        backgroundImage: `url(${imageUrl(banner.image_path)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } }
    >
      <Box
        sx={ {
          position: 'absolute',
          right: { xs: 16, md: 50 },
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: { xs: 24, md: 35 },
          fontWeight: 700,
          color: '#000000',
          lineHeight: 1.4,
        } }
      >
        <Box>{ banner.headline }</Box>
        <Box>{ banner.sub_headline }</Box>
      </Box>
    </Box>
  );
}

export default MainBanner;
