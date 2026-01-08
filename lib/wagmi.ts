import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// Define the RitualChain (MeeChain) ⚡
export const ritualChain = defineChain({
  id: 13390,
  name: "RitualChain Local",
  nativeCurrency: { name: "MeeBot Coin", symbol: "MCB", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] }
  },
  blockExplorers: {
    default: { name: "RitualScan", url: "https://localhost:3000" }
  }
});

// Supported chains
export const config = getDefaultConfig({
  appName: "RitualChain",
  projectId: "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
  chains: [ritualChain],
  ssr: false,
});
