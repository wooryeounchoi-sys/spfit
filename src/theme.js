import { createTheme } from '@mui/material/styles';

/**
 * SPFIT 디자인 시스템
 * - 폰트: Noto Sans KR
 * - 기본 색상: 블랙 / 화이트, 버튼 #363A36
 * - 그림자 효과 사용하지 않음
 */
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#363A36', contrastText: '#FFFFFF' },
    secondary: { main: '#000000' },
    success: { main: '#3FC837' },
    error: { main: '#F60606' },
    text: { primary: '#000000', secondary: '#666666' },
    background: { default: '#FFFFFF', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Noto Sans KR", sans-serif',
    button: { textTransform: 'none' },
  },
  shape: { borderRadius: 0 },
  shadows: Array(25).fill('none'),
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
    },
  },
});

export default theme;
