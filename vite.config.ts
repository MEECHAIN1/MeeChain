import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'; // Ensure this import is correct

      export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['ox'], // 🔮 Deduplicate ox across nested dependencies
    },
    plugins: [react()],
    define: {
    },
    build: {
      sourcemap: true,
       rollupOptions: {
         output: {
          }
        }
      }
    }
  });