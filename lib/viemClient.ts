
import { createPublicClient, http, fallback } from 'viem';
import { localhost } from 'viem/chains';

const RPC_URL = process.env.VITE_RPC_URL || "https://shape-mainnet.g.alchemy.com/v2/J1HfoMSvISZdnANVlkTA6";

export const meechain = {
  ...localhost,
  id: 222222,
  name: 'MeeChain',
  network: 'meechain',
  nativeCurrency: {
    decimals: 18,
    name: 'MeeChain Bot',
    symbol: 'MCB',
  },
  rpcUrls: {
    public: { http: [RPC_URL] },
    default: { http: [RPC_URL] },
  },
};

export const client = createPublicClient({
  chain: meechain,
  transport: fallback([
    http(RPC_URL), http()
  ], { rank: false }),
});
