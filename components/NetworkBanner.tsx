
import React, { useEffect, useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { useApp } from '../context/AppState';
import { meechain, client } from '../lib/viemClient';

/**
 * NetworkBanner Component
 * Monitors the connected blockchain network and provides a realignment ritual (switch) 
 * if the user is in the wrong sector.
 */
const NetworkBanner: React.FC = () => {
  const { isConnected, chainId } = useAccount();
  const { switchChain, status } = useSwitchChain();
  const { notify } = useApp();
  const [blockNumber, setBlockNumber] = useState<bigint | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const isPending = status === 'pending';
  const isWrongNetwork = isConnected && chainId !== meechain.id;

  // Track the current ledger height (block number)
  useEffect(() => {
    let interval: any;
    const fetchBlock = async () => {
      try {
        const block = await client.getBlockNumber();
        setBlockNumber(block);
      } catch (e) {
        setBlockNumber(null);
      }
    };

    fetchBlock();
    interval = setInterval(fetchBlock, 10000);
    return () => clearInterval(interval);
  }, []);

  // Reset dismissal when network changes
  useEffect(() => {
    setIsDismissed(false);
  }, [chainId, isConnected]);

  const handleSwitch = async () => {
    if (!switchChain) {
      notify('error', 'สถาปัตยกรรมกระเป๋าเงินของคุณไม่รองรับการสลับเครือข่ายอัตโนมัติ โปรดสลับเครือข่ายเป็น Polygon ด้วยตนเอง');
      return;
    }

    try {
      notify('info', 'กำลังเริ่มต้นกระบวนการสลับเครือข่าย (Realignment Ritual)...');
      switchChain({ chainId: meechain.id });
    } catch (err: any) {
      console.error("Network switch error:", err);
      notify('error', 'การสลับเครือข่ายถูกขัดขวางโดยผู้ใช้หรือระบบ');
    }
  };

  // If not connected, or if dismissed and network is correct, render nothing
  if (!isConnected || (isDismissed && !isWrongNetwork)) return null;
  
  // WRONG NETWORK BANNER (HIGH PRIORITY)
  if (isWrongNetwork && !isDismissed) {
    return (
      <div className="bg-rose-600 text-white relative z-50 shadow-2xl animate-in slide-in-from-top duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl animate-pulse">
              ⚠️
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-[0.2em]">Neural Link Mismatch</span>
              <p className="text-[10px] opacity-90 font-medium leading-relaxed max-w-md">
                อุปกรณ์ของคุณเชื่อมต่ออยู่กับ Sector {chainId} แต่ MeeBot Protocol ทำงานบน MeeChain (Polygon) เท่านั้น
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={handleSwitch}
              disabled={isPending}
              className="flex-grow md:flex-none bg-white text-rose-600 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl"
            >
              {isPending ? (
                <div className="w-3 h-3 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-sm">⚡</span>
              )}
              {isPending ? 'ALIGNING...' : 'REALIGN TO MEECHAIN'}
            </button>
            <button 
              onClick={() => setIsDismissed(true)}
              className="w-12 h-12 flex items-center justify-center hover:bg-black/10 rounded-2xl transition-colors text-xl"
              title="Dismiss warning"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  // HEALTHY NETWORK BANNER (SUBTLE)
  return (
    <div className="bg-emerald-500/10 border-b border-emerald-500/20 py-2 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center text-[8px] font-black uppercase tracking-[0.4em] text-emerald-500/70 italic">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          <span>Sector Locked: {meechain.name}</span>
        </div>
        <div className="flex items-center gap-5">
          <span className="hidden sm:inline bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">Ledger Height: {blockNumber?.toString() || 'Syncing...'}</span>
          <span className="opacity-40">Frequency: Stable</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkBanner;
