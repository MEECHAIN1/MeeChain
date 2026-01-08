
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './context/AppState';
import { config } from './lib/wagmi';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import GalleryPage from './pages/GalleryPage';
import StakingPage from './pages/StakingPage';
import SwapPage from './pages/SwapPage';
import MintPage from './pages/MintPage';
import SummonPage from './pages/SummonPage';
import EventLogPage from './pages/EventLogPage';
import TailwindTestPage from './pages/TailwindTestPage';
import OraclePage from './pages/OraclePage';
import GlobalLoadingOverlay from './components/GlobalLoadingOverlay';
import RitualToasts from './components/RitualToasts';
import NetworkBanner from './components/NetworkBanner';
import { CONFIG } from './lib/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
export default App;
return (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        {/* ลองปิดคอมโพเนนต์ที่มีความเสี่ยงออกให้หมดก่อน */}
        <div className="text-white p-10">Testing: If you see this, the Providers are working!</div>
        {/* <GlobalLoadingOverlay /> */}
        {/* <RitualToasts /> */}
        {/* <Navbar /> */}
      </AppProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
  export default App;