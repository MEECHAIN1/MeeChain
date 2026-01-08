import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './context/AppState';
import { config } from './lib/wagmi';
// ... import หน้าต่างๆ ของคุณ ...

// ย้ายการตั้งค่า queryClient มาไว้ตรงนี้ให้ถูกต้อง
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
            <div className="min-h-screen flex flex-col bg-[#05080f] text-white">
              {/* ตรวจสอบว่า Navbar และ Overlay อยู่ในลำดับที่ถูกต้อง */}
              <GlobalLoadingOverlay />
              <Navbar />
              
              <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-10">
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
            </div>
          </Router>
        </AppProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;