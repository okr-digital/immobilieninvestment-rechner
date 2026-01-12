import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // WICHTIG: Ersetzen Sie 'REPO_NAME' durch den exakten Namen Ihres GitHub-Repositories!
  // Beispiel: Wenn Ihr Repo https://github.com/User/immo-calc ist, dann setzen Sie base: '/immo-calc/'
  // Wenn Sie eine Custom Domain (z.B. www.meineseite.com) nutzen, setzen Sie base: '/'
  base: '/REPO_NAME/',
  
  // Cloud Run Settings (auskommentiert für GitHub Pages)
  /*
  server: {
    host: '0.0.0.0',
    port: 8080,
  },
  preview: {
    host: '0.0.0.0',
    port: 8080,
  },
  */
});