import Button from '@mui/material/Button';

/**
 * DarkButton 컴포넌트 - 기본 버튼 (배경 #363A36, 글자 #FFFFFF, 20px)
 *
 * Props:
 * @param {node} children - 버튼 문구 [Required]
 * @param {function} onClick - 클릭 시 실행 [Optional]
 * @param {number} width - 너비 [Optional, 기본값: 390]
 * @param {number} height - 높이 [Optional, 기본값: 50]
 * @param {boolean} isDisabled - 비활성화 여부 [Optional, 기본값: false]
 * @param {string} type - 버튼 타입 [Optional, 기본값: 'button']
 *
 * Example usage:
 * <DarkButton onClick={handleLogin}>로그인</DarkButton>
 */
function DarkButton({ children, onClick, width = 390, height = 50, isDisabled = false, type = 'button', sx }) {
  return (
    <Button
      type={ type }
      onClick={ onClick }
      disabled={ isDisabled }
      sx={ {
        width: '100%',
        maxWidth: width,
        height,
        fontSize: 20,
        color: '#FFFFFF',
        bgcolor: '#363A36',
        transition: 'background-color 0.2s',
        '&:hover': { bgcolor: '#1F221F' },
        '&.Mui-disabled': { color: '#FFFFFF', bgcolor: '#9A9C9A' },
        ...sx,
      } }
    >
      { children }
    </Button>
  );
}

export default DarkButton;
