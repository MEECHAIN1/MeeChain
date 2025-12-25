
// Fix: Removed 'reconnect' from 'wagmi' imports as it is not exported from this entry point in wagmi v2 and remains unused in this configuration.
import { http, createConfig } from 'wagmi';
import { meechain } from './viemClient';
import { injected, walletConnect } from 'wagmi/connectors';

const metadata = {
  name: 'MeeBot Chain',
  description: 'MeeBot Ecosystem Ritual Portal',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://meechain.netlify.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

export const config = createConfig({
  chains: [meechain as any],
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
    [meechain.id]: http(),
  },
});
