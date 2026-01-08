import { http, createConfig } from 'wagmi';
import { meechain } from './viemClient';
import { injected, walletConnect } from 'wagmi/connectors';

const metadata = {
  name: 'MeeBot Chain',
  description: 'MeeBot Ecosystem Ritual Portal',
  url: typeof window !== 'undefined' ? window.location.origin : ['https://127.0.0.1:8545']
};

export const config = createConfig({
  chains: [meechain as any],
  multiInjectedProviderDiscovery: true,
  connectors: [
    injected(),
    walletConnect({
      projectId: ['b0d81328f8ab0541fdede7db9ff25cb1'], 
      metadata,
      showQrModal: true,
      qrModalOptions: {
     // themeMode: 'dark'
      }
    }),
  ],
  transports: {
    [meechain.id]: http(),
  },
});
