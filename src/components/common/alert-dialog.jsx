import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';

/**
 * AlertDialog 컴포넌트 - 공통 팝업창 (500*300px)
 *
 * Props:
 * @param {boolean} isOpen - 표시 여부 [Required]
 * @param {string} message - 안내 문구 [Required]
 * @param {string} confirmLabel - 버튼 문구 [Optional, 기본값: '확인']
 * @param {string} confirmColor - 버튼 배경색 [Optional, 기본값: '#363A36']
 * @param {function} onConfirm - 버튼 클릭 시 실행 [Required]
 *
 * Example usage:
 * <AlertDialog isOpen message="회원가입 완료" onConfirm={handleClose} />
 */
function AlertDialog({ isOpen, message, confirmLabel = '확인', confirmColor = '#363A36', onConfirm }) {
  return (
    <Dialog
      open={ isOpen }
      onClose={ onConfirm }
      slotProps={ { paper: { sx: { width: 500, maxWidth: 'calc(100% - 32px)', height: 300, m: 2, borderRadius: 0 } } } }
    >
      <Box
        sx={ {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          px: 3,
        } }
      >
        <Box
          sx={ {
            fontSize: 15,
            fontWeight: 700,
            color: '#000000',
            textAlign: 'center',
            whiteSpace: 'pre-line',
            lineHeight: 1.6,
          } }
        >
          { message }
        </Box>
        <Button
          onClick={ onConfirm }
          autoFocus
          sx={ {
            minWidth: 100,
            height: 50,
            px: 2,
            fontSize: 15,
            color: '#FFFFFF',
            bgcolor: confirmColor,
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: confirmColor, opacity: 0.85 },
          } }
        >
          { confirmLabel }
        </Button>
      </Box>
    </Dialog>
  );
}

export default AlertDialog;
