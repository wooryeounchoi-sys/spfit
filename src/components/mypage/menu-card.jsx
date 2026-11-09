import Box from '@mui/material/Box';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { Link as RouterLink } from 'react-router-dom';

/**
 * MenuCard 컴포넌트 - 마이페이지 메뉴 카드 (흰 배경, 15px, 클릭 시 이동)
 *
 * Props:
 * @param {string} label - 메뉴 이름 [Required]
 * @param {string} to - 이동 경로 [Optional]
 * @param {function} onClick - 클릭 시 실행 (to 가 없을 때) [Optional]
 * @param {number} width - 카드 너비 [Optional, 기본값: 800]
 * @param {number} height - 카드 높이 [Optional, 기본값: 80]
 *
 * Example usage:
 * <MenuCard label="계정 관리" to="/mypage/account" />
 */
function MenuCard({ label, to, onClick, width = 800, height = 80 }) {
  const linkProps = to ? { component: RouterLink, to } : { component: 'button', type: 'button', onClick };
  return (
    <Box
      { ...linkProps }
      sx={ {
        width: '100%',
        maxWidth: width,
        height,
        mx: 'auto',
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: '#FFFFFF',
        border: 'none',
        font: 'inherit',
        fontSize: 15,
        color: '#000000',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover': { bgcolor: '#FAFAFA' },
      } }
    >
      <span>{ label }</span>
      <ChevronRight sx={ { color: '#9A9A9A' } } />
    </Box>
  );
}

export default MenuCard;
