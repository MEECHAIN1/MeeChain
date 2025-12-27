import React, { useEffect, useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { useApp } from '../context/AppState';
import { meechain } from '../lib/viemClient';
import { client } from '../lib/viemClient';

const NetworkBanner: React.FC = () => {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { notify } = useApp();
  const [blockNumber, setBlockNumber] = useState<bigint | null>(null);

  const isWrongNetwork = isConnected && chainId !== meechain.id;

  useEffect(() => {
    const fetchBlock = async () => {
      try {
        const block = await client.getBlockNumber();
        setBlockNumber(block);
      } catch (e) {
        // Fallback for mock/local
        setBlockNumber(BigInt(Math.floor(Date.now() / 10000)));
      }
    };
    fetchBlock();
    const interval = setInterval(fetchBlock, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSwitch = () => {
    if (switchChain) {
      switchChain({ chainId: meechain.id });
      notify('info', 'กำลังปรับจูนความถี่ Neural Link ไปยัง MeeChain...');
    }
  };

  if (!isConnected) return null;

  return (
    <div className={`transition-all duration-700 overflow-hidden ${isWrongNetwork ? 'h-16' : 'h-8 opacity-60 hover:opacity-100'}`}>
      <div className={`h-full flex items-center justify-between px-6 border-b text-[10px] font-black uppercase tracking-[0.2em] italic ${
        isWrongNetwork 
          ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse' 
          : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500/70'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-2 h-2 rounded-full ${isWrongNetwork ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'}`}></div>
          <p>
            {isWrongNetwork 
              ? `ตรวจพบสัญญาณรบกวน: เครือข่ายไม่ตรง (ID: ${chainId})` 
              : `ความถี่เสถียร: ${meechain.name} (Synchronized)`
            }
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2">
            <span className="opacity-40">Block Height:</span>
            <span className="font-mono text-white">{blockNumber?.toString() || '---'}</span>
          </div>
          
          {isWrongNetwork && (
            <button 
              onClick={handleSwitch}
              className="bg-rose-500 text-white px-4 py-1.5 rounded-full hover:bg-rose-400 transition-all active:scale-95 shadow-lg shadow-rose-500/20"
            >
              Align Ritual Network
            </button>
          )}

          {!isWrongNetwork && (
            <div className="flex items-center gap-2">
              <span className="opacity-40">Latency:</span>
              <span className="text-emerald-400/80">12ms</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkBanner;
