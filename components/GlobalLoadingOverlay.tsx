
import React, { useMemo } from 'react';
import { useApp } from '../context/AppState';

const GlobalLoadingOverlay: React.FC = () => {
  const { state } = useApp();
  const { staking, claiming, general, balances } = state.loadingStates;
  
  const active = staking || claiming || general || (balances && state.account === null);

  const status = useMemo(() => {
    if (staking) return { title: 'Neural Core Sync', desc: 'Activating Manifestation Rig...', icon: '⚡' };
    if (claiming) return { title: 'Energy Harvest', desc: 'Extracting MCB Flux from Ledger...', icon: '🌾' };
    if (balances) return { title: 'Telemetry Sync', desc: 'Calibrating Neural Balances...', icon: '📡' };
    return { title: 'Processing Ritual', desc: 'Submitting Data Packet to RitualChain...', icon: '🌀' };
  }, [staking, claiming, balances]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#05080f]/90 backdrop-blur-xl animate-in fade-in duration-500 font-mono">
      <div className="text-center space-y-10 p-12 max-w-sm">
        {/* Quantum Pulse Animation */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 border-2 border-amber-500/10 rounded-full animate-ping"></div>
          <div className="absolute inset-2 border-[4px] border-amber-500 border-t-transparent rounded-full animate-[spin_1.5s_linear_infinite]"></div>
          <div className="absolute inset-4 border border-sky-400/20 rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
          <div className="absolute inset-8 bg-amber-500/10 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
             <span className="text-4xl animate-pulse">{status.icon}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
            {status.title}
          </h3>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 animate-pulse">
              {status.desc}
            </p>
            <div className="flex justify-center gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5">
           <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest leading-relaxed">
             Neural Link Integrity: <span className="text-emerald-500">STABLE</span><br/>
             Chain Connectivity: <span className="text-sky-500">ACTIVE</span>
           </p>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoadingOverlay;
