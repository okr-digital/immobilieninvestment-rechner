import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Wir nutzen './' (relativ), damit die App unabhängig vom Repository-Namen funktioniert.
  // Das verhindert Fehler, falls Sie vergessen haben, 'REPO_NAME' zu ersetzen.
  base: './',
  
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