import Button from '@mui/material/Button';

/**
 * LightButton 컴포넌트 - 흰 배경 버튼 (글자 #000000, 20px) / 마이페이지·구매 화면용
 *
 * Props:
 * @param {node} children - 버튼 문구 [Required]
 * @param {function} onClick - 클릭 시 실행 [Optional]
 * @param {number} width - 너비 [Optional, 기본값: 395]
 * @param {number} height - 높이 [Optional, 기본값: 50]
 * @param {number} fontSize - 글자 크기 [Optional, 기본값: 20]
 * @param {boolean} isActive - 선택(강조) 상태 [Optional, 기본값: false]
 *
 * Example usage:
 * <LightButton onClick={handleBuy}>구매하기</LightButton>
 */
function LightButton({ children, onClick, width = 395, height = 50, fontSize = 20, isActive = false, sx }) {
  return (
    <Button
      onClick={ onClick }
      aria-pressed={ isActive }
      sx={ {
        width: '100%',
        maxWidth: width,
        height,
        fontSize,
        color: isActive ? '#FFFFFF' : '#000000',
        bgcolor: isActive ? '#363A36' : '#FFFFFF',
        border: '1px solid #000000',
        transition: 'background-color 0.2s, color 0.2s',
        '&:hover': { bgcolor: isActive ? '#1F221F' : '#EDEDED' },
        ...sx,
      } }
    >
      { children }
    </Button>
  );
}

export default LightButton;
