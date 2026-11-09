import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/common/page-container';
import MenuCard from '../components/mypage/menu-card';
import WhiteCard from '../components/mypage/white-card';
import PageTitle from '../components/ui/page-title';
import useAuth from '../hooks/use-auth';

const MENUS = [
  { label: '계정 관리', to: '/mypage/account' },
  { label: '장바구니', to: '/mypage/cart' },
  { label: "'좋아요' 누른 품목", to: '/mypage/likes' },
  { label: '주문내역', to: '/mypage/orders' },
  { label: '내가 쓴 리뷰', to: '/mypage/reviews' },
];

/**
 * MyPage 컴포넌트 - 마이페이지 (인사 카드 + 메뉴 카드 1열)
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/mypage" element={<MyPage />} />
 */
function MyPage() {
  const navigate = useNavigate();
  const { member, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <PageContainer maxWidth={ 800 } bgcolor="#F5F5F5">
      <PageTitle>마이페이지</PageTitle>
      <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.5 } }>
        <WhiteCard minHeight={ 120 } sx={ { display: 'flex', alignItems: 'center', fontSize: 20 } }>
          <Box>
            <Box component="span" sx={ { fontWeight: 700 } }>{ member?.name }</Box>
            님 반갑습니다.
          </Box>
        </WhiteCard>
        { MENUS.map((menu) => (
          <MenuCard key={ menu.to } label={ menu.label } to={ menu.to } />
        )) }
        <Button onClick={ handleLogout } sx={ { alignSelf: 'flex-end', mt: 1, fontSize: 13, color: '#666666' } }>
          로그아웃
        </Button>
      </Box>
    </PageContainer>
  );
}

export default MyPage;
