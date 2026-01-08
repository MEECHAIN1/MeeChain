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

// แก้ไข QueryClient ให้ถูกต้อง
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
    },
  },
});

const App: React.FC = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <Router>
            <div className="min-h-screen flex flex-col selection:bg-amber-500/30 relative pb-safe bg-[#05080f]">
              <GlobalLoadingOverlay />
              <RitualToasts />
              <NetworkBanner />
              <Navbar />
              
              <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 md:py-10">
                {/* ต้องมี Routes ครอบ Route เสมอ */}
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/mint" element={<MintPage />} />
                  <Route path="/summon" element={<SummonPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/staking" element={<StakingPage />} />
                  <Route path="/swap" element={<SwapPage />} />
                  <Route path="/oracle" element={<OraclePage />} />
                  <Route path="/logs" element={<EventLogPage />} />
                  <Route path="/debug" element={<TailwindTestPage />} />
                </Routes>
              </main>

              <footer className="p-6 text-center text-[10px] text-slate-600 uppercase tracking-widest border-t border-white/5">
                MeeBot Protocol Integrity Secured
              </footer>
            </div>
          </Router>
        </AppProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;