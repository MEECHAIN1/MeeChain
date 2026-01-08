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
// ... (ส่วนการ import ด้านบนคงเดิม)

const queryClient = new QueryClient({
  // ... (options คงเดิม)
});

// 1. ฟังก์ชัน App ต้องเริ่มต้นด้วยปีกกา {
const App: React.FC = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <Router>
            <div className="min-h-screen flex flex-col selection:bg-amber-500/30 relative pb-safe">
               {/* ... (เนื้อหาภายในคงเดิม) ... */}
            </div>
          </Router>
        </AppProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}; // 2. ปิดปีกกาของฟังก์ชัน App ตรงนี้

// 3. ย้าย Export default มาไว้ล่างสุด
export default App;