import { useState } from 'react';
import Box from '@mui/material/Box';
import { Navigate, Route, Routes } from 'react-router-dom';
import DbNotice from './components/common/db-notice';
import RequireAuth from './components/common/require-auth';
import ScrollToTop from './components/common/scroll-to-top';
import SiteFooter from './components/common/site-footer';
import SiteHeader from './components/common/site-header';
import AccountPage from './pages/account-page';
import AddressPage from './pages/address-page';
import CartPage from './pages/cart-page';
import ChangePasswordPage from './pages/change-password-page';
import CheckoutPage from './pages/checkout-page';
import FindAccountPage from './pages/find-account-page';
import FindIdPage from './pages/find-id-page';
import HomePage from './pages/home-page';
import LikesPage from './pages/likes-page';
import LoginPage from './pages/login-page';
import MyPage from './pages/my-page';
import MyReviewsPage from './pages/my-reviews-page';
import OrdersPage from './pages/orders-page';
import ProductDetailPage from './pages/product-detail-page';
import ProductListPage from './pages/product-list-page';
import ResetPasswordPage from './pages/reset-password-page';
import SearchPage from './pages/search-page';
import SignupPage from './pages/signup-page';
import WithdrawPage from './pages/withdraw-page';

/** 로그인이 필요한 페이지 */
const PRIVATE_ROUTES = [
  { path: '/mypage', element: <MyPage /> },
  { path: '/mypage/account', element: <AccountPage /> },
  { path: '/mypage/account/password', element: <ChangePasswordPage /> },
  { path: '/mypage/account/address', element: <AddressPage /> },
  { path: '/mypage/account/withdraw', element: <WithdrawPage /> },
  { path: '/mypage/cart', element: <CartPage /> },
  { path: '/mypage/orders', element: <OrdersPage /> },
  { path: '/mypage/likes', element: <LikesPage /> },
  { path: '/mypage/reviews', element: <MyReviewsPage /> },
  { path: '/checkout', element: <CheckoutPage /> },
];

/**
 * App 컴포넌트 - 전체 레이아웃 (헤더 / 본문 / 푸터) 및 라우팅
 * GNB 하위 메뉴가 열리면 본문과 푸터를 투명도 50% 로 흐리게 처리
 *
 * Props: 없음
 *
 * Example usage:
 * <App />
 */
function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Box sx={ { width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF' } }>
      <ScrollToTop />
      <SiteHeader onMenuOpenChange={ setIsMenuOpen } />
      <Box
        sx={ {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          opacity: isMenuOpen ? 0.5 : 1,
          transition: 'opacity 0.25s',
        } }
      >
        <DbNotice />
        <Box component="main" sx={ { flex: 1, display: 'flex', flexDirection: 'column' } }>
          <Routes>
            <Route path="/" element={ <HomePage /> } />
            <Route path="/login" element={ <LoginPage /> } />
            <Route path="/find" element={ <FindAccountPage /> } />
            <Route path="/find/id" element={ <FindIdPage /> } />
            <Route path="/find/password" element={ <ResetPasswordPage /> } />
            <Route path="/signup" element={ <SignupPage /> } />
            <Route path="/products/:categoryId" element={ <ProductListPage /> } />
            <Route path="/products/:categoryId/:productId" element={ <ProductDetailPage /> } />
            <Route path="/search" element={ <SearchPage /> } />
            { PRIVATE_ROUTES.map((route) => (
              <Route key={ route.path } path={ route.path } element={ <RequireAuth>{ route.element }</RequireAuth> } />
            )) }
            <Route path="*" element={ <Navigate to="/" replace /> } />
          </Routes>
        </Box>
        <SiteFooter />
      </Box>
    </Box>
  );
}

export default App;
