import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppState';
import { formatEther, parseEther } from 'viem';
import { ArrowDownUp, Zap, ArrowRightLeft } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ABIS, getADRS } from '../lib/contracts';

const SwapPage = () => {
  const { state, notify } = useApp();
  const { chainId, balances, account } = state;
  const [amount, setAmount] = useState('');
  
  // กำหนดเชนปลายทางอัตโนมัติ (ถ้าอยู่ BSC ปลายทางจะเป็น MeeChain และในทางกลับกัน)
  const isBSC = chainId === 56;
  const sourceName = isBSC ? 'BSC Mainnet' : 'MeeChain';
  const targetName = isBSC ? 'MeeChain' : 'BSC Mainnet';

  // คำนวณยอดที่จะได้รับ (จำลองค่าธรรมเนียม Bridge 0.5%)
  const fee = 0.005;
  const receiveAmount = amount ? (parseFloat(amount) * (1 - fee)).toFixed(4) : '0.00';

  const handleExecute = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      notify('error', 'กรุณาระบุจำนวนพลังงานที่ต้องการสลับ');
      return;
    }
    
    if (parseFloat(amount) > parseFloat(balances.token)) {
      notify('error', 'พลังงานใน Ledger ไม่เพียงพอสำหรับการทำพิธีกรรมนี้');
      return;
    }

    notify('info', `กำลังเริ่มต้นพิธีกรรม Bridge: ส่ง ${amount} MCB จาก ${sourceName} ไปยัง ${targetName}...`);
    // ส่วนนี้คือจุดที่จะใส่ useWriteContract ในขั้นตอนต่อไปครับ
  };

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
            <ArrowRightLeft size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">ENERGY CONVERTER</h1>
            <p className="text-slate-400 text-sm">สลับเปลี่ยนมวลสารพลังงานข้ามเครือข่าย Neural Link</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-blue-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
          {/* ส่วนเชนต้นทาง */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 mb-2">
            <div className="flex justify-between text-xs text-slate-500 mb-2 uppercase tracking-widest">
              <span>จาก: {sourceName}</span>
              <span>ยอดที่มี: {balances.token} MCB</span>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="bg-transparent text-3xl font-medium text-white outline-none w-full"
              />
              <button 
                onClick={() => setAmount(balances.token)}
                className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 hover:bg-blue-500/20"
              >
                MAX
              </button>
            </div>
          </div>

          {/* ปุ่มสลับสายฟ้า */}
          <div className="flex justify-center -my-4 relative z-10">
            <div className="bg-slate-900 border border-blue-500/50 p-2 rounded-full text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <Zap size={20} fill="currentColor" />
            </div>
          </div>

          {/* ส่วนเชนปลายทาง */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 mt-2 mb-6">
            <div className="flex justify-between text-xs text-slate-500 mb-2 uppercase tracking-widest">
              <span>ไปยัง: {targetName}</span>
              <span>(โดยประมาณ)</span>
            </div>
            <div className="text-3xl font-medium text-blue-300">
              {receiveAmount} <span className="text-lg text-slate-500">MCB</span>
            </div>
          </div>

          {/* รายละเอียดธุรกรรม */}
          <div className="space-y-2 mb-8 px-1">
            <div className="flex justify-between text-sm text-slate-400">
              <span>Conversion Fee (0.5%)</span>
              <span>{(parseFloat(amount || '0') * fee).toFixed(4)} MCB</span>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>Network Status</span>
              <span className="text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                OPTIMAL
              </span>
            </div>
          </div>

          {/* ปุ่มดำเนินการ */}
          <button 
            onClick={handleExecute}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Zap size={20} />
            EXECUTE COMMITMENT
          </button>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          * การทำธุรกรรมข้ามเครือข่ายอาจใช้เวลา 3-5 นาทีในการยืนยันใน Ledger
        </p>
      </div>
    </div>
  );
};

export default SwapPage;