import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Link as RouterLink } from 'react-router-dom';

const columnTitleSx = { fontSize: 15, fontWeight: 700, color: '#FFFFFF', mb: 2 };
const textSx = { fontSize: 13, color: '#BDBDBD', lineHeight: 1.9 };
const linkSx = { ...textSx, display: 'block', textDecoration: 'none', '&:hover': { color: '#FFFFFF' } };

/**
 * SiteFooter 컴포넌트 - 모든 페이지 공통 푸터 (고정 정보이므로 DB 에 저장하지 않음)
 *
 * Props: 없음
 *
 * Example usage:
 * <SiteFooter />
 */
function SiteFooter() {
  return (
    <Box component="footer" sx={ { width: '100%', bgcolor: '#111111', px: { xs: 2, md: '50px' }, py: { xs: 5, md: 7 } } }>
      <Box
        component="img"
        src={ `${import.meta.env.BASE_URL}img_spfit/logo_spfit.png` }
        alt="SPFIT"
        sx={ { height: 32, mb: 4, filter: 'invert(1)' } }
      />
      <Grid container spacing={ 4 }>
        <Grid size={ { xs: 12, sm: 6, md: 3 } }>
          <Box sx={ columnTitleSx }>고객센터</Box>
          <Box component={ RouterLink } to="/mypage/orders" sx={ linkSx }>주문조회</Box>
          <Box sx={ textSx }>QnA</Box>
          <Box sx={ textSx }>전화번호 1588-0000</Box>
          <Box sx={ textSx }>평일 10:00 ~ 17:00 (주말/공휴일 휴무)</Box>
        </Grid>
        <Grid size={ { xs: 12, sm: 6, md: 3 } }>
          <Box sx={ columnTitleSx }>반품 배송지</Box>
          <Box sx={ textSx }>서울특별시 가상구 스핏로 123</Box>
          <Box sx={ textSx }>SPFIT 물류센터</Box>
        </Grid>
        <Grid size={ { xs: 12, sm: 6, md: 3 } }>
          <Box sx={ columnTitleSx }>회사 정보</Box>
          <Box sx={ textSx }>회사명 (주)스핏</Box>
          <Box sx={ textSx }>사업자등록번호 000-00-00000</Box>
        </Grid>
        <Grid size={ { xs: 12, sm: 6, md: 3 } }>
          <Box sx={ columnTitleSx }>매장안내</Box>
          <Box sx={ textSx }>SPFIT 성수 플래그십 스토어</Box>
          <Box sx={ textSx }>매일 11:00 ~ 21:00</Box>
        </Grid>
      </Grid>
      <Box sx={ { mt: 5, pt: 3, borderTop: '1px solid #333333', fontSize: 12, color: '#8A8A8A', lineHeight: 1.8 } }>
        본 사이트는 포트폴리오용으로 제작된 가상 쇼핑몰이며, 실제 상품 판매 및 결제가 이루어지지 않습니다.
        <br />
        © SPFIT. All rights reserved.
      </Box>
    </Box>
  );
}

export default SiteFooter;
