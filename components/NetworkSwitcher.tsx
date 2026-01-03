import React from 'react';
import { useChainId, useSwitchChain } from 'wagmi';

export const NetworkSwitcher: React.FC = () => {
  const chainId = useChainId();
  const { chains, switchChain } = useSwitchChain();

  return (
    <div className="flex items-center gap-2 p-1 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl">
      {chains.map((chain) => (
        <button
          key={chain.id}
          onClick={() => switchChain({ chainId: chain.id })}
          className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            chainId === chain.id
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${chainId === chain.id ? 'bg-white animate-pulse' : 'bg-slate-600'}`}></span>
            {chain.name === 'BNB Smart Chain' ? 'BSC Mainnet' : chain.name}
          </span>
        </button>
      ))}
    </div>
  );
};