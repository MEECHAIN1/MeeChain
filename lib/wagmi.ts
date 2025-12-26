import { bsc } from 'viem/chains';
import { http, createConfig } from 'wagmi';
import { meechain } from './viemClient';
import { injected, walletConnect } from 'wagmi/connectors';

const metadata = {
  name: 'MeeBot Chain',
  description: 'MeeBot Ecosystem Ritual Portal',
  url: typeof window !== 'undefined' ? window.location.origin : '"https://shape-mainnet.g.alchemy.com/v2/J1HfoMSvISZdnANVlkTA6',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

export const config = createConfig({
  chains: [meechain as any, bsc],
  multiInjectedProviderDiscovery: true,
  connectors: [
    injected(),
    walletConnect({
      projectId: '663c25b58c5d2037993b7b5d5d35f3aa', 
      metadata,
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'dark',
      },
    }),
  ],
  transports: {
    [meechain.id]: http('https://shape-mainnet.g.alchemy.com/v2/J1HfoMSvISZdnANVlkTA6'),
    [bsc.id]: http('https://bnb-mainnet.g.alchemy.com/v2/J1HfoMSvISZdnANVlkTA6'),
  },
});