import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true, // ป้องกันการเปลี่ยน Port ไปเรื่อยๆ
    },
    plugins: [
      react(),
      nodePolyfills({
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
    ],
    define: {
      // วิธีที่ปลอดภัยกว่าในการส่ง Environment Variables
      'process.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      target: 'esnext', // สำคัญสำหรับ Web3
      outDir: 'dist',
    },
  };
});