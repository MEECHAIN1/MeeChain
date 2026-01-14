import { Chain } from 'viem';

export const meechain: Chain = {
  id: 13390, // MeeChain
  name: 'MeeChain Ritual (MCB)',
  nativeCurrency: {
    decimals: 18,
    name: 'MeeChain',
    symbol: 'MCB',
  },
  rpcUrls: {
    default: { http: ['https://meechain.run.place'] },
    public: { http: ['https://meechain.run.plac'] },
  },
  blockExplorers: {
    default: { name: 'mcbScan', url: 'https://meechainScan.run.place' },
  },
};
