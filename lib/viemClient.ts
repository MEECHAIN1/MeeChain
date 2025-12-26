
import { localhost } from 'viem/chains';
import { createPublicClient, http } from 'viem';
import { mainnet, bsc } from 'viem/chains';

const RPC_URL = process.env.VITE_RPC_URL || "https://shape-mainnet.g.alchemy.com/v2/J1HfoMSvISZdnANVlkTA6";

export const meechain = {
  ...localhost,
  id: 1337,
  name: 'MeeChain Bot',
  network: 'MeeChain Bot',
  nativeCurrency: {
    decimals: 18,
    name: 'MeeChain Bot',
    symbol: 'MCB',
  },
  rpcUrls: {
    public: { http: ['https://mcb-chain.bolt.host'] },
    default: { http: ['https://mcb-chain.bolt.host'] },
  },
};

export const getClient = (chainId?: number) => {
  return createPublicClient({
    chain: chainId === 56 ? bsc : mainnet,
    transport: http(chainId === 56 ? 'https://bsc-dataseed.binance.org/' : undefined),
  });
};