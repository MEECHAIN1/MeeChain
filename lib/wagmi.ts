import { http, createConfig } from 'wagmi';
import { meechain } from './viemClient';
import { injected, walletConnect } from 'wagmi/connectors';

const metadata = {
  name: 'MeeBot Chain',
  description: 'MeeBot Ecosystem Ritual Portal',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://127.0.0.1:8545',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

// เปลี่ยนชื่อจาก config เป็น wagmiConfig เพื่อให้ตรงกับ App.tsx
export const wagmiConfig = createConfig({
  chains: [meechain as any],
  multiInjectedProviderDiscovery: true,
  connectors: [
    injected(),
    walletConnect({
      projectId: 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
      metadata,
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'dark',
      },
    }),
  ],
  transports: {
    [meechain.id]: http(),
  },
});
