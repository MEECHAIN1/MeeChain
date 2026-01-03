import { bsc } from 'viem/chains';
import { http, createConfig } from 'wagmi';
import { meechain } from './viemClient';
import { injected, walletConnect } from 'wagmi/connectors';

const metadata = {
  name: 'MeeBot Chain',
  description: 'MeeBot Ecosystem Ritual Portal',
  url: typeof window !== 'undefined' ? window.location.origin : ['https://mcb-chain.bolt.host'],
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

export const config = createConfig({
  chains: [meechain as any, bsc],
  multiInjectedProviderDiscovery: true,
  connectors: [
    injected(),
    walletConnect({
      projectId: '2e0008e23308df1a8278a35195822b65', 
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