
import { Chain } from 'viem';

export const meechain: Chain = {
  id: 56,
  name: 'MeeChain Ritual (ฺฺฺBSC)',
  nativeCurrency: {
    decimals: 18,
    name: 'MeeChain',
    symbol: 'MCB',
  },
  rpcUrls: {
    default: { http: ['https://dimensional-newest-film.bsc.quiknode.pro/8296e7105d470d5d73b51b19556495493c8f1033'] },
    public: { http: ['https://dimensional-newest-film.bsc.quiknode.pro/8296e7105d470d5d73b51b19556495493c8f1033'] },
  },
  blockExplorers: {
    default: { name: 'bscscan', url: 'https://bscscan.com' },
  },
};
