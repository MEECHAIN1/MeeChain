import { createPublicClient, http } from 'viem';
import { mainnet, bsc } from 'viem/chains';

/** 🟢 นิยาม MeeChain ให้สมบูรณ์ */
export const meechain = {
  id: 1337, // หรือ ID จริงของ MeeChain
  name: 'MeeChain',
  nativeCurrency: { decimals: 18, name: 'MeeChain Bot', symbol: 'MCB' },
  rpcUrls: {
    public: { http: ['https://shape-mainnet.g.alchemy.com/v2/J1HfoMSvISZdnANVlkTA6'] },
    default: { http: ['https://mcb-chain.bolt.host'] },
  },
};

/** 🟢 ฟังก์ชันดึง Client แบบ Dynamic ตาม Chain ID */
export const getClient = (chainId?: number) => {
  const isBSC = chainId === 56;
  return createPublicClient({
    // ถ้าเป็น 56 ให้เลือก BSC ถ้าไม่ใช่ให้เลือก MeeChain
    chain: isBSC ? bsc :  as any, 
    transport: http(isBSC ? 'https://bsc-dataseed.binance.org/' : meechain.rpcUrls.public.http[0]),
  });
};

/** 🔴 จุดสำคัญ: ส่งออก 'client' ตัวหลักเพื่อป้องกัน Error ตอน Build */
export const client = getClient();