
import { Chain } from 'viem';

// MeeChain Configuration updated to use BNB Smart Chain (BSC) as the primary protocol
export const meechain: Chain = {
  id: 13390, // Binance Smart Chain Mainnet
  name: 'MeeChain Ritual (BSC)',
  nativeCurrency: {
    decimals: 18,
    name: 'MeeChain',
    symbol: 'MCB',
  },
  rpcUrls: {
    default: { http: ['https://meechain.run.place/', 'https://meechain.llamarpc.com'] },
    public: { http: ['https://meechain.run.place/', 'https://meechain.llamarpc.com'] },
  },
  blockExplorers: {
    default: { name: 'mcbScan', url: 'https://meechainscan.com' },
  },
};
