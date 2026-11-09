import Box from '@mui/material/Box';
import { Link as RouterLink } from 'react-router-dom';
import { getChildren } from '../../utils/category-tree';

/**
 * MegaMenu 컴포넌트 - GNB 마우스오버 시 펼쳐지는 하위 메뉴 패널 (1905*400px, 전체 너비)
 *
 * Props:
 * @param {Array} categories - 전체 카테고리 목록 [Required]
 * @param {object} topCategory - 마우스오버된 상위 카테고리 [Optional]
 * @param {function} onNavigate - 메뉴 클릭 시 실행 [Required]
 *
 * Example usage:
 * <MegaMenu categories={categories} topCategory={hovered} onNavigate={closeMenu} />
 */
function MegaMenu({ categories, topCategory, onNavigate }) {
  const isOpen = Boolean(topCategory);
  const subCategories = topCategory ? getChildren(categories, topCategory.id) : [];

  return (
    <Box
      className="mega-menu"
      sx={ {
        position: 'absolute',
        top: '100%',
        left: 0,
        width: '100%',
        height: isOpen ? 400 : 0,
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
        borderTop: isOpen ? '1px solid #EAEAEA' : 'none',
        transition: 'height 0.25s ease',
        zIndex: 1200,
      } }
    >
      { isOpen && (
        <Box sx={ { display: 'flex', gap: { xs: 4, md: 10 }, px: '50px', py: 5 } }>
          { subCategories.map((sub) => {
            const leaves = getChildren(categories, sub.id);
            return (
              <Box key={ sub.id } sx={ { minWidth: 160 } }>
                <Box
                  component={ RouterLink }
                  to={ `/products/${sub.id}` }
                  onClick={ onNavigate }
                  sx={ {
                    display: 'block',
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#000000',
                    textDecoration: 'none',
                    mb: 2,
                    '&:hover': { textDecoration: 'underline' },
                  } }
                >
                  { sub.name }
                </Box>
                { leaves.map((leaf) => (
                  <Box
                    key={ leaf.id }
                    component={ RouterLink }
                    to={ `/products/${leaf.id}` }
                    onClick={ onNavigate }
                    sx={ {
                      display: 'block',
                      fontSize: 15,
                      color: '#000000',
                      textDecoration: 'none',
                      mb: 1.25,
                      '&:hover': { textDecoration: 'underline' },
                    } }
                  >
                    { leaf.name }
                  </Box>
                )) }
              </Box>
            );
          }) }
        </Box>
      ) }
    </Box>
  );
}

export default MegaMenu;
