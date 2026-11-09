import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { HashRouter } from 'react-router-dom';
import App from './App';
import AuthProvider from './components/common/auth-provider';
import PopupProvider from './components/common/popup-provider';
import theme from './theme';
import './index.css';

/** GitHub Pages 새로고침 404 방지를 위해 HashRouter 사용 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={ theme }>
      <CssBaseline />
      <HashRouter>
        <PopupProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </PopupProvider>
      </HashRouter>
    </ThemeProvider>
  </StrictMode>,
);
