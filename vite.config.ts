import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(() => {
  return {
    // Dynamically sets base path for GitHub Actions environment vs local
    base: process.env.GITHUB_ACTIONS === 'true' ? '/PortfolioCastilloJV/' : '/',
    
    plugins: [
      react(), 
      tailwindcss()
    ],
    
    resolve: {
      alias: {
        // Safe cross-platform way to resolve the root folder mapping
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
