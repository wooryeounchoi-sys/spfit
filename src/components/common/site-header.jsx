import { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import ShoppingBagOutlined from '@mui/icons-material/ShoppingBagOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/use-auth';
import useCategories from '../../hooks/use-categories';
import usePopup from '../../hooks/use-popup';
import { getChildren } from '../../utils/category-tree';
import HeaderSearch from './header-search';
import MegaMenu from './mega-menu';

/**
 * SiteHeader 컴포넌트 - 로고 / GNB / 검색·장바구니·로그인 (모든 페이지 공통)
 *
 * Props:
 * @param {function} onMenuOpenChange - 하위 메뉴 열림 상태 변경 시 실행 (본문 흐림 처리용) [Required]
 *
 * Example usage:
 * <SiteHeader onMenuOpenChange={setIsMenuOpen} />
 */
function SiteHeader({ onMenuOpenChange }) {
  const navigate = useNavigate();
  const showPopup = usePopup();
  const { isLoggedIn } = useAuth();
  const { categories } = useCategories();
  const [hoveredTop, setHoveredTop] = useState(null);

  const topCategories = getChildren(categories, null);

  const openMenu = (category) => {
    setHoveredTop(category);
    onMenuOpenChange(true);
  };

  const closeMenu = () => {
    setHoveredTop(null);
    onMenuOpenChange(false);
  };

  const handleCartClick = async () => {
    if (isLoggedIn) {
      navigate('/mypage/cart');
      return;
    }
    await showPopup({ message: '로그인 해주세요', confirmLabel: '로그인 하러가기' });
    navigate('/login');
  };

  return (
    <Box
      component="header"
      onMouseLeave={ closeMenu }
      sx={ { position: 'sticky', top: 0, zIndex: 1100, width: '100%', bgcolor: '#FFFFFF' } }
    >
      <Box
        sx={ {
          height: 100,
          px: { xs: 2, md: '50px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #EAEAEA',
        } }
      >
        <Box sx={ { display: 'flex', alignItems: 'center', gap: { xs: 2, md: 7 }, height: '100%' } }>
          <Box component={ RouterLink } to="/" onClick={ closeMenu } onMouseEnter={ closeMenu } sx={ { display: 'flex' } }>
            <Box
              component="img"
              src={ `${import.meta.env.BASE_URL}img_spfit/logo_spfit.png` }
              alt="SPFIT"
              sx={ { height: { xs: 32, md: 44 }, display: 'block' } }
            />
          </Box>
          <Box component="nav" aria-label="주요 메뉴" sx={ { display: 'flex', gap: { xs: 2, md: 5 }, height: '100%' } }>
            { topCategories.map((category) => (
              <Box
                key={ category.id }
                component={ RouterLink }
                to={ `/products/${category.id}` }
                onClick={ closeMenu }
                onMouseEnter={ () => openMenu(category) }
                sx={ {
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                  fontSize: { xs: 16, md: 25 },
                  fontWeight: 700,
                  color: '#000000',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  borderBottom: hoveredTop?.id === category.id ? '3px solid #000000' : '3px solid transparent',
                } }
              >
                { category.name }
              </Box>
            )) }
          </Box>
        </Box>

        <Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } } onMouseEnter={ closeMenu }>
          <HeaderSearch />
          <IconButton aria-label="장바구니" onClick={ handleCartClick } sx={ { color: '#000000' } }>
            <ShoppingBagOutlined sx={ { fontSize: 30 } } />
          </IconButton>
          { isLoggedIn ? (
            <IconButton aria-label="마이페이지" component={ RouterLink } to="/mypage" sx={ { color: '#000000' } }>
              <PersonOutlined sx={ { fontSize: 32 } } />
            </IconButton>
          ) : (
            <Box
              component={ RouterLink }
              to="/login"
              sx={ { fontSize: 18, fontWeight: 700, color: '#000000', textDecoration: 'none', px: 1 } }
            >
              login
            </Box>
          ) }
        </Box>
      </Box>

      <MegaMenu categories={ categories } topCategory={ hoveredTop } onNavigate={ closeMenu } />
    </Box>
  );
}

export default SiteHeader;
