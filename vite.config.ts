import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'import.meta.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'import.meta.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      rollupOptions: { 
         output: { 
         manualChunks: { 
           'vendor-react': ['react', 'react-dom', 'react-router-dom'], 
           'vendor-web3': ['wagmi', 'viem', '@wagmi/core', '@tanstack/react-query'], 
           'vendor-ui': ['framer-motion', 'lucide-react', 'canvas-confetti'], 
           'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          }
       }
    }
);

