import { createPublicClient, http, fallback } from 'viem';
import { meechain } from './constants/chains'; // ตรวจสอบ path อีกครั้ง

// แนะนำให้มี RPC สำรองเพื่อป้องกันหน้าเว็บค้าง/ขาวเมื่อ RPC หลักมีปัญหา
const RPC_URLS = [
  "https://bsc-dataseed.binance.org/",
  "https://binance.lava.build",
  "https://rpc.ankr.com/bsc"
];

export { meechain };

export const client = createPublicClient({
  chain: meechain,
  // ใช้ fallback เพื่อให้ถ้าตัวที่ 1 ล่ม มันจะสลับไปตัวที่ 2 อัตโนมัติ
  transport: fallback(
    RPC_URLS.map(url => http(url, {
      timeout: 10000,
      retryCount: 2,
    }))
  ),
});