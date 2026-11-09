import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

/**
 * StatusMessage 컴포넌트 - 로딩 / 빈 목록 / 오류 문구 표시
 *
 * Props:
 * @param {boolean} isLoading - 로딩 중 여부 [Optional, 기본값: false]
 * @param {string} message - 표시할 문구 [Optional]
 *
 * Example usage:
 * <StatusMessage message="등록된 제품이 없습니다." />
 */
function StatusMessage({ isLoading = false, message }) {
  return (
    <Box sx={ { py: 10, display: 'flex', justifyContent: 'center', fontSize: 15, color: '#000000' } }>
      { isLoading ? <CircularProgress size={ 28 } sx={ { color: '#363A36' } } /> : message }
    </Box>
  );
}

export default StatusMessage;
