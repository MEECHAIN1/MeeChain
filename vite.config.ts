import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nodePolyfills } from 'vite-plugin-node-polyfills'; // ต้องลงเพิ่ม

export default defineConfig({
  plugins: [
    tailwindcss(), 
    reactRouter(), 
    tsconfigPaths(),
    // เพิ่มตัวนี้เข้าไปเพื่อแก้ปัญหา createHash และ Buffer ที่ทำให้จอดำ
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  // ป้องกันปัญหาการ Resolve module ของ Web3 บางตัว
  resolve: {
    alias: {
      // ช่วยให้ Library เก่าๆ หา Buffer เจอ
      buffer: 'buffer',
    },
  },
});