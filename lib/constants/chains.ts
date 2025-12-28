
import { Chain } from 'viem';

// MeeChain Configuration updated with provided QuikNode RPC
export const meechain: Chain = {
  id: 137, // Mapping to Polygon Mainnet as per QuikNode URL
  name: 'MeeChain Ritual (Polygon)',
  nativeCurrency: {
    decimals: 18,
    name: 'POL',
    symbol: 'POL',
  },
  rpcUrls: {
    default: { http: ['https://dimensional-newest-film.matic.quiknode.pro/8296e7105d470d5d73b51b19556495493c8f1033'] },
    public: { http: ['https://dimensional-newest-film.matic.quiknode.pro/8296e7105d470d5d73b51b19556495493c8f1033'] },
  },
  blockExplorers: {
    default: { name: 'PolygonScan', url: 'https://polygonscan.com' },
  },
};
