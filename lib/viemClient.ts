
import { createPublicClient, http, fallback } from 'viem';
import { localhost } from 'viem/chains';

const RPC_URL = process.env.VITE_RPC_URL || "http://127.0.0.1:8545";

// Default chain config for MeeChain
export const meechain = {
  ...localhost,
  id: 1337,
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
    http(RPC_URL),
    // Using a public node that is generally more lenient with rate limits/auth for simple dev demos
    http("https://ethereum-sepolia.publicnode.com")
  ], { rank: false }),
});
