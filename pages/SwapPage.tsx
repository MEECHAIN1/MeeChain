import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppState';
import { formatEther, parseEther } from 'viem';
import { Zap, ArrowRightLeft } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ABIS, getADRS } from '../lib/contracts';

const SwapPage = () => {
  const { state, notify } = useApp();
  const { chainId, balances, account } = state;
  const [amount, setAmount] = useState('');

  // 1. Hooks สำหรับทำธุรกรรม
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const contracts = getADRS(chainId);

  // 2. Logic การคำนวณ
  const isBSC = chainId === 56;
  const sourceName = isBSC ? 'BSC Mainnet' : 'MeeChain';
  const targetName = isBSC ? 'MeeChain' : 'BSC Mainnet';
  const fee = 0.005;
  const receiveAmount = amount ? (parseFloat(amount) * (1 - fee)).toFixed(4) : '0.00';

  // 3. ฟังก์ชันดำเนินการ (ต้องอยู่ภายใน SwapPage)
  const handleExecute = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      notify('error', 'กรุณาระบุจำนวนพลังงานที่ต้องการสลับ');
      return;
    }

    if (parseFloat(amount) > parseFloat(balances.token)) {
      notify('error', 'พลังงานใน Ledger ไม่เพียงพอสำหรับการทำพิธีกรรมนี้');
      return;
    }

    try {
      notify('info', `กำลังเริ่มต้นพิธีกรรม Bridge: ส่ง ${amount} MCB จาก ${sourceName}...`);
      
      // 🟢 เรียกใช้สัญญาจริง 0x8Da6... บน BSC
      writeContract({
        address: contracts.token as `0x${string}`,
        abi: ABIS.token,
        functionName: 'transfer', 
        args: [
          '0xRecipientBridgeAddress', // เปลี่ยนเป็นที่อยู่ Bridge ของคุณ
          parseEther(amount)
        ],
      });
    } catch (err) {
      notify('error', 'การเชื่อมต่อ Neural Link ขัดข้อง');
    }
  };

  // 4. ติดตามสถานะ (ต้องอยู่ภายใน SwapPage)
  useEffect(() => {
    if (isConfirming) notify('info', 'กำลังทำการหลอมรวมพลังงานใน Ledger (Confirming)...');
    if (isSuccess) {
      notify('success', 'สลับพลังงานสำเร็จ! มวลสารกำลังเดินทางข้ามเครือข่าย ✨');
    }
  }, [isConfirming, isSuccess, notify]);

  // 5. การแสดงผล UI
  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
            <ArrowRightLeft size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight uppercase">Energy Converter</h1>
            <p className="text-slate-400 text-sm italic">การสลับเปลี่ยนมวลสารพลังงานข้ามเครือข่าย</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-blue-500/30 rounded-[2rem] p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Zap size={120} />
          </div>

          {/* ส่วนต้นทาง */}
          <div className="bg-black/40 p-6 rounded-2xl border border-white/5 mb-2">
            <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
              <span>จาก: {sourceName}</span>
              <span>Available: {balances.token} MCB</span>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="bg-transparent text-4xl font-black text-white outline-none w-full tracking-tighter"
              />
              <button 
                onClick={() => setAmount(balances.token)}
                className="text-[10px] font-black bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg border border-blue-500/20 hover:bg-blue-500/30 transition-all"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Icon ตรงกลาง */}
          <div className="flex justify-center -my-5 relative z-10">
            <div className="bg-slate-900 border-2 border-blue-500/50 p-3 rounded-full text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)] animate-pulse">
              <Zap size={24} fill="currentColor" />
            </div>
          </div>

          {/* ส่วนปลายทาง */}
          <div className="bg-black/40 p-6 rounded-2xl border border-white/5 mt-2 mb-8">
            <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
              <span>ไปยัง: {targetName}</span>
              <span>Est. Output</span>
            </div>
            <div className="text-4xl font-black text-blue-400 tracking-tighter">
              {receiveAmount} <span className="text-sm text-slate-600 uppercase">MCB</span>
            </div>
          </div>

          <button 
            onClick={handleExecute}
            disabled={isPending || isConfirming || !amount}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white font-black rounded-2xl shadow-xl transition-all active:scale-[0.98] uppercase tracking-[0.3em] flex items-center justify-center gap-3 border-b-4 border-blue-800"
          >
            {isPending || isConfirming ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : <Zap size={18} />}
            Execute Commitment
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwapPage;