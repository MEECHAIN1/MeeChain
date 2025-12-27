import React, { useState } from 'react'; // เติม useState เพื่อใช้ refreshKey
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiProvider, useAccount, usePublicClient } from 'wagmi'; // เพิ่ม Hooks จาก wagmi
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './context/AppState';
import { config } from './lib/wagmi';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import GalleryPage from './pages/GalleryPage';
import StakingPage from './pages/StakingPage';
import EventLogPage from './pages/EventLogPage';
import TailwindTestPage from './pages/TailwindTestPage';
import OraclePage from './pages/OraclePage';
import GlobalLoadingOverlay from './components/GlobalLoadingOverlay';
import RitualToasts from './components/RitualToasts';
import NetworkBanner from './components/NetworkBanner';
import SwapPage from './pages/SwapPage';
import { MeeBotAIEditor } from './components/ImageEditor';

const queryClient = new QueryClient();

// แยกส่วน Content ออกมาเพื่อให้ใช้ Hooks จาก Wagmi ได้
const AppContent: React.FC = () => {
  const { address: connectedAccount, isConnected } = useAccount();
  const provider = usePublicClient();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen flex flex-col selection:bg-sky-500/30 relative">
      <GlobalLoadingOverlay />
      <RitualToasts />
      <NetworkBanner />
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/staking" element={<StakingPage />} />
          <Route path="/Swap" element={<SwapPage />} />
          <Route path="/oracle" element={<OraclePage />} />
          <Route path="/logs" element={<EventLogPage />} />
          <Route path="/debug" element={<TailwindTestPage />} />
        </Routes>

        {/* 🟢 ย้าย Editor มาไว้ใน main เพื่อความสวยงาม และเรียกชื่อให้ถูก */}
        <div className="mt-12 mb-6 border-t border-white/5 pt-10">
          <h2 className="text-xl font-black italic mb-6 text-sky-400 uppercase tracking-tighter">
            MeeBot AI Genesis Laboratory
          </h2>
          <MeeBotAIEditor 
            provider={provider as any} 
            connectedAccount={connectedAccount || null} 
            onConnectWallet={() => {}} // ปกติ Navbar จัดการส่วนนี้
            onMintSuccess={() => setRefreshKey(prev => prev + 1)}
          />
        </div>
      </main>

      <footer className="px-6 py-10 border-t border-white/5 bg-black/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 opacity-50 grayscale">
            <div className="w-5 h-5 meebot-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-[10px]">MCB</span>
            </div>
            <span className="font-bold text-sm">MeeBot Ecosystem</span>
          </div>
          <p className="text-[10px] text-slate-600 font-mono tracking-tighter uppercase">
            &copy; {new Date().getFullYear()} MEEBOT_PROTOCOL_V3.1.4_STABLE
          </p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <Router>
            <AppContent />
          </Router>
        </AppProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;