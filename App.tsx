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
import EventLogPage from './pages/EventLogPage';
import TailwindTestPage from './pages/TailwindTestPage';
import OraclePage from './pages/OraclePage';
import GlobalLoadingOverlay from './components/GlobalLoadingOverlay';
import RitualToasts from './components/RitualToasts';
import NetworkBanner from './components/NetworkBanner';
import SwapPage from './pages/SwapPage';
import { MeeBotAIEditor } from './components/ImageEditor';
import { MeeBotDefaultIcon } from './components/Icons';
import { gemini } from './functions/gemini';


const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <Router>
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
              </main>
               <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4 text-slate-200">MeeBot AI Image Editor</h2>
                  <ImageEditor 
                    provider={provider} 
                    connectedAccount={connectedAccount} 
                    onConnectWallet={connectWallet}
                    onMintSuccess={() => setRefreshKey(prev => prev + 1)}
                  />
                </div>
              <footer className="px-6 py-10 border-t border-white/5 bg-black/20">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-3 opacity-50 grayscale">
                    <div className="w-5 h-5 meebot-gradient rounded-lg flex items-center justify-center">
                      <span className="text-white font-black text-sm">MCB</span>
                    </div>
                    <span className="font-bold text-sm">MeeBot Ecosystem</span>
                  </div>
                  <div className="flex gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <a href="#" className="hover:text-white transition-colors">Documentation</a>
                    <a href="#" className="hover:text-white transition-colors">Governance</a>
                    <a href="#" className="hover:text-white transition-colors">Support</a>
                  </div>
                  <p className="text-[10px] text-slate-600 font-mono tracking-tighter">
                    &copy; {new Date().getFullYear()} MEEBOT_PROTOCOL_V3.1.4
                  </p>
                </div>
              </footer>
            </div>
          </Router>
        </AppProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
