import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppState';
import { formatEther, parseEther } from 'viem';

const SwapPage = () => {
  const { state, notify, chainId } = useApp();
  const [amount, setAmount] = useState('');
  const [targetChain, setTargetChain] = useState(chainId === 56 ? 2225 : 56);

  // คำนวณยอดที่จะได้รับ (จำลองค่าธรรมเนียม)
  const receiveAmount = amount ? (parseFloat(amount) * 0.995).toFixed(4) : '0.00';

  const handleSwap = async () => {
    notify('info', 'กำลังเริ่มต้นพิธีกรรมสลับพลังงาน (Initiating Swap)...');
    // ในอนาคตเราจะใส่ useWriteContract ตรงนี้ครับ
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-slate-900/50 rounded-xl border border-blue-500/30">
      <h2 className="text-2xl font-bold mb-6 text-blue-400">ENERGY CONVERTER</h2>
      
      {/* ส่วนกรอกข้อมูล */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-2">จ่ายพลังงานจาก: {chainId === 56 ? 'BSC' : 'MeeChain'}</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 p-4 rounded-lg text-white"
            placeholder="0.00 MCB"
          />
        </div>

        <div className="flex justify-center my-2 text-blue-500">
          <span className="animate-bounce">↓</span>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">รับพลังงานที่: {targetChain === 56 ? 'BSC' : 'MeeChain'}</label>
          <div className="w-full bg-slate-800 border border-slate-700 p-4 rounded-lg text-blue-300">
            {receiveAmount} MCB (หลังหักค่าธรรมเนียม)
          </div>
        </div>

        <button 
          onClick={handleSwap}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 p-4 rounded-lg font-bold hover:opacity-80 transition"
        >
          EXECUTE CONVERSION
        </button>
      </div>
    </div>
  );
};