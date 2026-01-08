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
        '@': path.resolve(__dirname, './src'),
      },
      dedupe: ['ox'], // 🔮 Deduplicate ox across nested dependencies
    },
    plugins: [react()],
    define: {
      'import.meta.env.VITE_RPC_URL': JSON.stringify(env.VITE_RPC_URL),
      'import.meta.env.VITE_WALLETCONNECT_PROJECT_ID': JSON.stringify(env.VITE_WALLETCONNECT_PROJECT_ID),
      'import.meta.env.VITE_API_KEY': JSON.stringify(env.VITE_API_KEY),
    },
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          },
        },
      },
    },
});