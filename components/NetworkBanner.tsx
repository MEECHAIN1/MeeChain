
import React, { useEffect, useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { useApp } from '../context/AppState';
import { meechain, client } from '../lib/viemClient';
import { logger } from '../lib/logger';
import { triggerSuccessRitual } from '../lib/rituals';

const NetworkBanner: React.FC = () => {
  const { isConnected, chainId } = useAccount();
  const { switchChainAsync, status } = useSwitchChain();
  const { notify } = useApp();
  const [blockNumber, setBlockNumber] = useState<bigint | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const isPending = status === 'pending';
  const isWrongNetwork = isConnected && chainId !== meechain.id;

  useEffect(() => {
    let interval: any;
    const fetchBlock = async () => {
      try {
        const block = await client.getBlockNumber();
        setBlockNumber(block);
      } catch (e: any) {
        setBlockNumber(null);
      }
    };

    fetchBlock();
    interval = setInterval(fetchBlock, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Reset dismissal if network changes
    setIsDismissed(false);
  }, [chainId, isConnected]);

  const handleSwitch = async () => {
    if (!switchChainAsync) {
      notify('error', 'เบราว์เซอร์หรือกระเป๋าเงินของคุณไม่รองรับการสลับเครือข่ายอัตโนมัติ กรุณาสลับด้วยตนเองใน Metamask');
      return;
    }

    try {
      notify('info', 'กำลังส่งคำขอสลับเครือข่ายไปยังกระเป๋าเงินของคุณ...');
      
      // Using switchChainAsync for proper ritual synchronization
      await switchChainAsync({ chainId: meechain.id });
      
      notify('success', 'เชื่อมต่อกับ BSC Mainnet สำเร็จ!');
      triggerSuccessRitual();
      logger.ritual('NETWORK_SWITCH', true, { targetChain: meechain.id });
      
    } catch (err: any) {
      if (err?.code === 4001 || err?.name === 'UserRejectedRequestError') {
        notify('info', 'การสลับเครือข่ายถูกปฏิเสธโดยผู้ใช้งาน');
        logger.ritual('NETWORK_SWITCH', false, { reason: 'User Rejected' });
      } else {
        notify('error', 'เกิดข้อผิดพลาดในการสลับเครือข่าย: ' + (err.message || 'Unknown Error'));
        logger.error('Network switch failed', err);
      }
    }
  };

  if (!isConnected || (isDismissed && !isWrongNetwork)) return null;
  
  if (isWrongNetwork && !isDismissed) {
    return (
      <div className="bg-rose-600 text-white relative z-50 shadow-2xl animate-in slide-in-from-top duration-500 font-mono">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl animate-bounce shadow-inner border border-white/5">
              ☢️
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] mb-1">Neural Link Mismatch</span>
              <p className="text-[10px] opacity-90 font-medium leading-relaxed max-w-md">
                ระบบตรวจพบว่าคุณเชื่อมต่อผิดเครือข่าย (Sector: {chainId}) กรุณาสลับไปยัง <span className="font-black text-amber-300">BNB Smart Chain</span> เพื่อความเสถียรของ MeeBot Protocol
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={handleSwitch}
              disabled={isPending}
              className={`flex-grow md:flex-none bg-white text-rose-600 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-50 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.2)] disabled:opacity-50 group relative overflow-hidden ${!isPending ? 'ring-4 ring-white/20' : ''}`}
            >
               <span className="relative z-10">{isPending ? 'SYNCHRONIZING...' : 'SWITCH TO BSC MAINNET'}</span>
               {!isPending && (
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-100/30 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
               )}
            </button>
            <button 
              onClick={() => setIsDismissed(true)}
              className="w-12 h-12 flex items-center justify-center hover:bg-black/10 rounded-2xl transition-colors opacity-50 text-xl"
            >
              ✕
            </button>
          </div>
        </div>
        <style>{`
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="bg-emerald-500/10 border-b border-emerald-500/20 py-2 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center text-[8px] font-black uppercase tracking-[0.4em] text-emerald-500/70 italic font-mono">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          <span>Sector Status: Securely Linked to {meechain.name}</span>
        </div>
        <div className="flex items-center gap-5">
          <span className="opacity-60 flex items-center gap-2">
            <span className="text-slate-500 opacity-30">#</span>
            BLOCK: {blockNumber ? blockNumber.toString() : 'Syncing...'}
          </span>
          <span className="opacity-40">MeeChain Node V4.1-STABLE</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkBanner;
