
import React from 'react';
import { useApp } from '../context/AppState';

const GlobalLoadingOverlay: React.FC = () => {
  const { state } = useApp();
  const { staking, claiming, general } = state.loadingStates;
  
  const active = staking || claiming || general;

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="text-center space-y-6">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-4 bg-amber-500/10 rounded-full flex items-center justify-center">
             <span className="text-2xl animate-pulse">⚡</span>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black italic uppercase tracking-widest text-white">
            {staking ? 'Channeling Energy' : claiming ? 'Harvesting Assets' : 'Ritual in Progress'}
          </h3>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/60 animate-pulse">
            Establishing Link to MeeChain Ledger...
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoadingOverlay;
