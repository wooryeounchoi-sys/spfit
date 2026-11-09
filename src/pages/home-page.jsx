import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { getMainContents } from '../api/catalog-api';
import AdBanner from '../components/landing/ad-banner';
import CheckYourShoes from '../components/landing/check-your-shoes';
import MainBanner from '../components/landing/main-banner';
import ReviewHighlight from '../components/landing/review-highlight';
import StyleMagazine from '../components/landing/style-magazine';
import StatusMessage from '../components/ui/status-message';
import { errorMessage } from '../utils/error-message';

/**
 * HomePage 컴포넌트 - 메인 페이지 (배너 / Style Magazine / 광고 배너 / Check Your Shoes / Review)
 * 모든 콘텐츠는 DB(get_main_contents)에서 조회
 *
 * Props: 없음
 *
 * Example usage:
 * <HomePage />
 */
function HomePage() {
  const [contents, setContents] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMainContents()
      .then(setContents)
      .catch(setError);
  }, []);

  if (error) {
    return <StatusMessage message={ errorMessage(error) } />;
  }
  if (!contents) {
    return <StatusMessage isLoading />;
  }

  const mainBanner = contents.banners.find((banner) => banner.banner_type === 'MAIN');
  const adBanner = contents.banners.find((banner) => banner.banner_type === 'AD');

  return (
    <Box sx={ { width: '100%' } }>
      { mainBanner && <MainBanner banner={ mainBanner } /> }
      { contents.magazines.length > 0 && <StyleMagazine magazines={ contents.magazines } /> }
      { adBanner && <AdBanner banner={ adBanner } /> }
      { contents.shoe_guides.length > 0 && <CheckYourShoes guides={ contents.shoe_guides } /> }
      <ReviewHighlight reviews={ contents.recent_reviews } />
    </Box>
  );
}

export default HomePage;
