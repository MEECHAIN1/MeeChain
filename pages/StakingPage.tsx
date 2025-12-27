import { useChainId } from 'wagmi';
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppState';
import { getRewardRate, getStakedBalance } from '../lib/services/staking';
import { triggerSuccessRitual } from '../lib/rituals';
import { formatEther } from 'viem';

const StakingPage: React.FC = () => {
  const { state, refreshBalances, addEvent, setGlobalLoading } = useApp();
  const chainId = useChainId();
  const [stakeAmount, setStakeAmount] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', msg: string }>({ type: 'idle', msg: '' });
  const [contractData, setContractData] = useState({ rewardRate: '0.000042', userStaked: '0' });

  const isProcessing = state.loadingStates.staking || state.loadingStates.claiming;

  const fetchData = async () => {
    if (!state.account) return;
    try {
const [rate, staked] = await Promise.all([
        getRewardRate(chainId),
        getStakedBalance(state.account, chainId)
      ]);
      setContractData({
        rewardRate: formatEther(rate),
        userStaked: formatEther(staked)
      });
    } catch (err) {
      console.warn("⚡ Ritual Telemetry error in UI");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [state.account]);

  const projectedYield = useMemo(() => {
    const rate = parseFloat(contractData.rewardRate);
    const amount = parseFloat(stakeAmount) || 0;
    if (amount <= 0) return { daily: '0', monthly: '0' };
    const daily = (rate * 86400 * (amount / 100)).toFixed(4); 
    const monthly = (parseFloat(daily) * 30).toFixed(2);
    return { daily, monthly };
  }, [stakeAmount, contractData.rewardRate]);

  const handlePercentageChange = (pct: number) => {
    setPercentage(pct);
    const balance = parseFloat(state.balances.native);
    const calculated = (balance * (pct / 100)).toFixed(4);
    setStakeAmount(calculated);
  };

  const handleInputChange = (val: string) => {
    setStakeAmount(val);
    const balance = parseFloat(state.balances.native);
    const numVal = parseFloat(val);
    if (balance > 0 && !isNaN(numVal)) {
      setPercentage(Math.min(100, Math.floor((numVal / balance) * 100)));
    } else {
      setPercentage(0);
    }
  };

// 1. ต้องประกาศสิ่งเหล่านี้ไว้ด้านบนสุดของ Component (ใต้บรรทัดที่ 12)
  const { data: hash, writeContract } = useWriteContract();
  const contracts = getADRS(chainId);

  // 2. รวมร่าง handleAction ให้เป็นก้อนเดียวและเป็น async
  const handleAction = async (action: 'stake' | 'claim') => {
    if (!state.account) {
      notify('error', 'กรุณาเชื่อมต่อ Neural Link ก่อนดำเนินการ ⚡');
      return;
    }

    const loadingKey = action === 'stake' ? 'staking' : 'claiming';
    setGlobalLoading(loadingKey, true);
    setStatus({ 
      type: 'loading', 
      msg: action === 'stake' ? `กำลังหลอมรวม MCB...` : 'กำลังเก็บเกี่ยวรางวัล...' 
    });

    try {
      // 🟢 เรียกใช้สัญญาจริง 0x8Da6... บน BSC
      writeContract({
        address: contracts.staking as `0x${string}`,
        abi: ABIS.staking,
        functionName: action === 'stake' ? 'stake' : 'getReward',
        args: action === 'stake' ? [parseEther(stakeAmount)] : [],
      });
      
      // การแจ้งเตือนความสำเร็จ (addEvent) จะย้ายไปอยู่ใน useEffect ของ isSuccess แทน
    } catch (err) {
      console.error("Ritual error:", err);
      setStatus({ type: 'error', msg: `❌ เกิดสัญญาณรบกวนในพิธีกรรม` });
      setGlobalLoading(loadingKey, false);
    }
  };
    try {
      let hash = "";
      if (action === 'stake') {
        hash = await stakeTokens(stakeAmount);
        addEvent({
          type: 'Staked',
          contract: 'Staking',
          from: state.account,
          amount: `${stakeAmount} MCB`,
          hash
        });
      } else {
        hash = await claimRewards();
        addEvent({
          type: 'Claimed',
          contract: 'Staking',
          from: state.account,
          amount: `Rewards Claimed`,
          hash
        });
      }
      
      triggerSuccessRitual();
      setStatus({ 
        type: 'success', 
        msg: action === 'stake' 
          ? `🎉 ${stakeAmount} MCB Locked in Vault ✨` 
          : `🎁 Rewards Successfully Claimed ✨` 
      });
      setStakeAmount('');
      setPercentage(0);
      await refreshBalances();
      await fetchData();
    } catch (err) {
      setStatus({ type: 'error', msg: `❌ Interference detected in ritual flow.` });
    } finally {
      setGlobalLoading(loadingKey, false);
      setTimeout(() => setStatus({ type: 'idle', msg: '' }), 5000);
    }
  };
// 🟢 ตรวจสอบสถานะการยืนยันธุรกรรมใน Ledger
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirming) setStatus({ type: 'loading', msg: 'กำลังบันทึกข้อมูลลงใน Ledger (Confirming)...' });
    if (isSuccess) {
      setStatus({ type: 'success', msg: '✨ พิธีกรรมเสร็จสมบูรณ์! พลังงานถูกถ่ายโอนเรียบร้อย' });
      refreshBalances(); // อัปเดตยอดเงินทันที
    }
  }, [isConfirming, isSuccess]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3">
            Vault <span className="text-amber-500">Core</span>
            <span className="text-[12px] bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full not-italic font-black ml-2 border border-amber-500/20">V3.1 SECURE</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
            Protocol Flux: <span className="text-amber-400 font-mono">{parseFloat(contractData.rewardRate).toFixed(6)} MCB/S</span>
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="glass px-6 py-3 rounded-2xl text-center min-w-[120px] border-white/10">
            <p className="text-[9px] font-black text-slate-500 uppercase mb-1 tracking-widest">Total Locked</p>
            <p className="text-xl font-black text-white">{parseFloat(contractData.userStaked).toFixed(2)}</p>
          </div>
          <div className="glass px-6 py-3 rounded-2xl text-center min-w-[120px] border-emerald-500/20 bg-emerald-500/5">
            <p className="text-[9px] font-black text-emerald-500/60 uppercase mb-1 tracking-widest italic">Est. APR</p>
            <p className="text-xl font-black text-emerald-400">24.5%</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Stake Section */}
        <div className="lg:col-span-7 space-y-6">
          <section className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xs font-black uppercase italic text-slate-400 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm shadow-inner">📥</span>
                Commit Engine
              </h2>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Available: {parseFloat(state.balances.native).toFixed(2)} MCB</p>
            </div>

            <div className="space-y-8">
              <div className="relative group">
                <input 
                  type="number" 
                  value={stakeAmount}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="0.00"
                  disabled={isProcessing}
                  className="w-full bg-black/40 border-2 border-white/5 rounded-[2rem] px-8 py-6 text-4xl font-black focus:outline-none focus:border-amber-500/40 transition-all placeholder:text-slate-800 disabled:opacity-50 tracking-tighter"
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-sm font-black text-slate-700 italic uppercase tracking-[0.3em]">MCB</div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Intensity Vector</span>
                  <span className="text-sm font-black text-amber-500 font-mono">{percentage}%</span>
                </div>
                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-amber-500 transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button 
                      key={pct} 
                      onClick={() => handlePercentageChange(pct)}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        percentage === pct 
                          ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/20' 
                          : 'bg-white/5 border-white/5 text-slate-600 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => handleAction('stake')}
                disabled={!state.account || isProcessing || !stakeAmount}
                className="w-full h-20 bg-amber-600 hover:bg-amber-500 py-4 rounded-[2rem] font-black text-sm shadow-2xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-20 uppercase tracking-[0.4em] text-white flex items-center justify-center gap-4 border-b-4 border-amber-800"
              >
                {isProcessing && (
                  <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {isProcessing ? 'SYNCHRONIZING...' : 'EXECUTE COMMITMENT'}
              </button>
            </div>
          </section>

          {status.msg && (
            <div className={`p-6 rounded-3xl border text-xs font-black flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-300 ${
              status.type === 'loading' ? 'bg-amber-500/5 border-amber-500/10 text-amber-400' :
              status.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.1)]' :
              'bg-rose-500/5 border-rose-500/10 text-rose-400'
            }`}>
              <span className="text-xl">
                {status.type === 'loading' ? '⏳' : status.type === 'success' ? '✅' : '❌'}
              </span>
              <p className="uppercase tracking-widest">{status.msg}</p>
            </div>
          )}
        </div>

        {/* Info & Harvest Section */}
        <div className="lg:col-span-5 space-y-6">
          <section className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6 bg-gradient-to-t from-white/[0.01]">
            <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4">Yield Projection</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Daily Epoch</span>
                <span className="text-lg font-black text-white">{projectedYield.daily} <span className="text-amber-500 text-[10px]">MCB</span></span>
              </div>
              <div className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monthly Cycle</span>
                <span className="text-lg font-black text-white">{projectedYield.monthly} <span className="text-amber-500 text-[10px]">MCB</span></span>
              </div>
            </div>
          </section>

          <section className="glass p-8 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent text-center space-y-6">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3 italic">Pending Harvest</p>
              <div className="flex items-baseline justify-center gap-2">
                 <span className="text-5xl font-black text-white tracking-tighter">124.50</span>
                 <span className="text-sm font-black text-amber-500 italic uppercase">MCB</span>
              </div>
            </div>

            <button 
              onClick={() => handleAction('claim')}
              disabled={!state.account || isProcessing}
              className="w-full bg-white text-black py-5 rounded-[2rem] font-black text-xs shadow-xl hover:bg-slate-100 active:scale-95 transition-all disabled:opacity-30 uppercase tracking-[0.3em] flex items-center justify-center gap-3"
            >
              HARVEST ASSETS
              <span className="text-lg">🌾</span>
            </button>
          </section>

          <div className="glass p-4 rounded-2xl border-white/5 flex items-center justify-center gap-3 opacity-40 hover:opacity-100 transition-opacity group">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:animate-pulse"></div>
             <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">VAULT_ORACLE_CONNECTED_SECURELY</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingPage;
