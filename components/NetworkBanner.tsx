
import React, { useEffect, useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { useApp } from '../context/AppState';
import { meechain } from '../lib/viemClient';
import { client } from '../lib/viemClient';

const NetworkBanner: React.FC = () => {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  const { notify } = useApp();
  const [blockNumber, setBlockNumber] = useState<bigint | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  // ตรวจสอบว่าเครือข่ายไม่ตรงกับ MeeChain (Polygon ID 137)
  const isWrongNetwork = isConnected && chainId !== meechain.id;

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

  // รีเซ็ตการซ่อน Banner หากมีการเปลี่ยนสถานะกระเป๋าเงิน
  useEffect(() => {
    setIsDismissed(false);
  }, [chainId, isConnected]);

  const handleSwitch = async () => {
    if (!switchChain) {
      notify('error', 'ระบบไม่รองรับการสลับเครือข่ายอัตโนมัติ โปรดสลับเครือข่ายเป็น Polygon ในกระเป๋าเงินของคุณ');
      return;
    }

    try {
      notify('info', 'กำลังส่งคำขอสลับเครือข่าย (Realignment Ritual)...');
      switchChain({ chainId: meechain.id });
    } catch (err: any) {
      notify('error', 'การสลับเครือข่ายถูกปฏิเสธ');
    }
  };

  // หากไม่ได้เชื่อมต่อ หรือผู้ใช้กดปิดไปแล้ว ไม่ต้องแสดงผล
  if (!isConnected || (isDismissed && !isWrongNetwork)) return null;
  
  // ในกรณีที่เครือข่ายผิด เราจะ "บังคับ" ให้แสดงแถบสีแดงจนกว่าจะกดปิด (X) หรือสลับสำเร็จ
  if (isWrongNetwork && !isDismissed) {
    return (
      <div className="bg-rose-600 text-white relative z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl animate-pulse">⚠️</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest">Neural Link Mismatch</span>
              <span className="text-[9px] opacity-80 font-medium">แอปทำงานบน MeeChain (Polygon) แต่กระเป๋าเงินของคุณอยู่ที่ Sector {chainId}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSwitch}
              disabled={isPending}
              className="bg-white text-rose-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-95 flex items-center gap-2"
            >
              {isPending ? (
                <div className="w-3 h-3 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
              ) : '⚡'}
              {isPending ? 'Syncing...' : 'Switch to MeeChain'}
            </button>
            <button 
              onClick={() => setIsDismissed(true)}
              className="w-8 h-8 flex items-center justify-center hover:bg-black/10 rounded-full transition-colors text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  // แถบสถานะปกติ (กรณีเชื่อมต่อถูกต้อง)
  return (
    <div className="bg-emerald-500/10 border-b border-emerald-500/20 py-1.5 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center text-[8px] font-black uppercase tracking-[0.3em] text-emerald-500/70 italic">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span>Frequency Stable: {meechain.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">Ledger Height: {blockNumber?.toString() || 'Syncing...'}</span>
          <span className="opacity-40">Status: Verified</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkBanner;
