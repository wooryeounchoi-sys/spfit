import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** GitHub Pages 저장소 경로(spfit)에 맞춘 base 설정 */
export default defineConfig({
  base: '/spfit/',
  plugins: [react()],
});
