import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import SectionTitle from '../ui/section-title';
import ShoeGuideCard from './shoe-guide-card';

/**
 * CheckYourShoes 컴포넌트 - 러닝 방식별 추천 러닝화 카드 3개 (3*1)
 *
 * Props:
 * @param {Array} guides - Check Your Shoes 콘텐츠 목록 [Required]
 *
 * Example usage:
 * <CheckYourShoes guides={contents.shoe_guides} />
 */
function CheckYourShoes({ guides }) {
  return (
    <Box component="section" sx={ { px: { xs: 2, md: '50px' }, py: { xs: 6, md: 10 } } }>
      <SectionTitle subtitle="즐겨 하는 러닝 방식에 맞는 러닝화를 찾아보세요">Check Your Shoes</SectionTitle>
      <Grid container spacing={ { xs: 4, md: 3 } }>
        { guides.map((guide) => (
          <Grid key={ guide.id } size={ { xs: 12, md: 4 } }>
            <ShoeGuideCard guide={ guide } />
          </Grid>
        )) }
      </Grid>
    </Box>
  );
}

export default CheckYourShoes;
