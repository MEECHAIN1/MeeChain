
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppState';
import { getRewardRate, getStakedBalance, stakeTokens, claimRewards } from '../lib/services/staking';
import { triggerSuccessRitual } from '../lib/rituals';
import { formatEther } from 'viem';

const StakingPage: React.FC = () => {
  const { state, refreshBalances, addEvent, setGlobalLoading } = useApp();
  const [stakeAmount, setStakeAmount] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', msg: string }>({ type: 'idle', msg: '' });
  const [contractData, setContractData] = useState({ rewardRate: '0.000042', userStaked: '0' });

  const isProcessing = state.loadingStates.staking || state.loadingStates.claiming;

  const fetchData = async () => {
    if (!state.account) return;
    try {
      const [rate, staked] = await Promise.all([
        getRewardRate(),
        getStakedBalance(state.account)
      ]);
      setContractData({
        rewardRate: formatEther(rate),
        userStaked: formatEther(staked)
      });
    } catch (err) {
      console.warn("⚡ MCB Rig Telemetry error in UI, service fallbacks handle this.");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [state.account]);

  const hashrate = useMemo(() => {
    const staked = parseFloat(contractData.userStaked);
    return (staked * 12.5).toFixed(2); 
  }, [contractData.userStaked]);

  const thermalLoad = useMemo(() => {
    const pct = percentage || 0;
    return Math.min(100, 35 + (pct * 0.6)).toFixed(1);
  }, [percentage]);

  const projectedYield = useMemo(() => {
    const rate = parseFloat(contractData.rewardRate);
    const amount = parseFloat(stakeAmount) || 0;
    if (amount <= 0) return { daily: '0', monthly: '0' };
    const daily = (rate * 86400 * (amount / 100)).toFixed(4); 
    const monthly = (parseFloat(daily) * 30).toFixed(2);
    return { daily, monthly };
  }, [stakeAmount, contractData.rewardRate]);

  const handlePercentageChange = (pct: number) => {
    const safePct = Math.max(0, Math.min(100, pct));
    setPercentage(safePct);
    const balance = parseFloat(state.balances.native);
    if (balance > 0) {
      const calculated = (balance * (safePct / 100)).toFixed(4);
      setStakeAmount(calculated);
    }
  };

  const handleAction = async (action: 'stake' | 'claim') => {
    if (!state.account) {
      setStatus({ type: 'error', msg: 'Neural Link Required for MCB Ritual ⚡' });
      return;
    }

    if (action === 'stake' && (!stakeAmount || isNaN(Number(stakeAmount)) || Number(stakeAmount) <= 0)) {
      setStatus({ type: 'error', msg: 'Invalid MCB Energy Volume.' });
      return;
    }

    const loadingKey = action === 'stake' ? 'staking' : 'claiming';
    setGlobalLoading(loadingKey, true);
    setStatus({ type: 'loading', msg: action === 'stake' ? `Charging Rig Core with MCB...` : 'Extracting MCB rewards...' });

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
          amount: `MCB Rewards Harvested`,
          hash
        });
      }
      
      triggerSuccessRitual();
      setStatus({ 
        type: 'success', 
        msg: action === 'stake' ? `🎉 Rig Core Upgraded with MCB ✨` : `🎁 MCB Rewards Extracted Successfully ✨` 
      });
      setStakeAmount('');
      setPercentage(0);
      await refreshBalances();
      await fetchData();
    } catch (err) {
      setStatus({ type: 'error', msg: `❌ Power grid interference detected during MCB ritual.` });
    } finally {
      setGlobalLoading(loadingKey, false);
      setTimeout(() => setStatus({ type: 'idle', msg: '' }), 5000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-4xl shadow-xl shadow-amber-500/5">
                ⚙️
             </div>
             <div>
                <h1 className="text-5xl font-black tracking-tighter uppercase italic flex items-center gap-3 text-white">
                  MCB <span className="text-amber-500">Mining Rig</span>
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">OPERATIONAL</span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">ID: MEEBOT-RIG-MCB-S4</span>
                </div>
             </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-grow lg:max-w-3xl">
          {[
            { label: 'Ritual Power', val: hashrate, unit: 'MH/S', color: 'text-amber-400' },
            { label: 'MCB Locked', val: parseFloat(contractData.userStaked).toFixed(1), unit: 'MCB', color: 'text-white' },
            { label: 'Thermal Load', val: thermalLoad, unit: '°C', color: 'text-rose-400' },
            { label: 'MCB Grid APR', val: '24.5', unit: '%', color: 'text-emerald-400' },
          ].map((stat, i) => (
            <div key={i} className="glass p-5 rounded-2xl border-white/10 relative overflow-hidden group hover:border-amber-500/30 transition-all">
               <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">{stat.label}</p>
               <div className="flex items-baseline gap-2">
                 <span className={`text-2xl font-black ${stat.color} tracking-tighter`}>{stat.val}</span>
                 <span className="text-[9px] font-bold text-slate-600 uppercase">{stat.unit}</span>
               </div>
            </div>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <section className="glass p-10 rounded-[3rem] border-white/5 relative overflow-hidden bg-gradient-to-br from-black/40 to-transparent">
            <div className="relative z-10 space-y-10">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-black uppercase italic text-slate-400 flex items-center gap-4">
                  <span className="w-2 h-6 bg-amber-500 rounded-full animate-pulse"></span>
                  MCB Rig Configuration
                </h2>
                <p className="text-sm font-black text-amber-500 font-mono italic">BALANCE: {parseFloat(state.balances.native).toFixed(2)} MCB</p>
              </div>

              <div className="space-y-10">
                <div className="relative group">
                  <input 
                    type="number" 
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="0.00"
                    disabled={isProcessing}
                    className="w-full bg-black/60 border-2 border-white/5 rounded-[2.5rem] px-10 py-10 text-7xl font-black focus:outline-none focus:border-amber-500/40 transition-all placeholder:text-slate-800 text-amber-500 pr-32 tracking-tighter"
                  />
                  <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col items-end">
                    <span className="text-xl font-black text-slate-700 italic uppercase">MCB</span>
                    <button onClick={() => handlePercentageChange(100)} className="text-[10px] text-amber-500 font-black mt-2 hover:text-white transition-colors">MAX MCB</button>
                  </div>
                </div>

                <div className="space-y-8 p-8 bg-black/40 border border-white/5 rounded-[2rem]">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">MCB Mining Load Level</span>
                    <span className="text-xs font-black text-amber-500 font-mono">{percentage}% POWER</span>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={percentage} 
                    onChange={(e) => handlePercentageChange(parseInt(e.target.value))}
                    className="w-full h-3 bg-white/5 rounded-full appearance-none accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between gap-4">
                    {[25, 50, 75, 100].map(p => (
                      <button key={p} onClick={() => handlePercentageChange(p)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black border border-white/5 transition-all text-slate-400">
                        {p}% MCB LOAD
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => handleAction('stake')}
                  disabled={isProcessing || !stakeAmount}
                  className="w-full h-24 bg-amber-600 hover:bg-amber-500 py-4 rounded-[2.5rem] font-black text-xl shadow-2xl transition-all disabled:opacity-20 uppercase tracking-[0.4em] text-white flex items-center justify-center gap-4 border-b-8 border-amber-900"
                >
                  {isProcessing ? 'SYNCING MCB CORE...' : 'START MCB MINING RITUAL ⚡'}
                </button>
              </div>
            </div>
          </section>

          {status.msg && (
            <div className={`p-8 rounded-[2rem] border text-xs font-black uppercase tracking-widest flex items-center gap-4 animate-in slide-in-from-bottom-2 ${
              status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
              status.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              <span>{status.type === 'success' ? '🛡️' : '⚙️'}</span> {status.msg}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <section className="glass p-8 rounded-[3rem] border-white/5 space-y-8">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">MCB Yield Telemetry</h3>
            <div className="space-y-4">
              <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                <span className="text-[10px] font-black text-slate-500 block mb-1">DAILY MCB EXTRACT</span>
                <span className="text-3xl font-black text-white">{projectedYield.daily} <span className="text-xs text-amber-500">MCB</span></span>
              </div>
              <div className="p-6 bg-black/40 rounded-3xl border border-white/5">
                <span className="text-[10px] font-black text-slate-500 block mb-1">MONTHLY MCB CYCLE</span>
                <span className="text-3xl font-black text-white">{projectedYield.monthly} <span className="text-xs text-amber-500">MCB</span></span>
              </div>
            </div>
            <div className={`p-4 rounded-2xl text-center text-[10px] font-black ${parseFloat(thermalLoad) > 80 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              COOLING STATUS: {parseFloat(thermalLoad) > 80 ? 'CRITICAL OVERLOAD' : 'OPTIMAL'}
            </div>
          </section>

          <section className="glass p-10 rounded-[3rem] border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent text-center space-y-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Available MCB Rewards</p>
            <div className="text-5xl font-black text-white tracking-tighter">124.50 <span className="text-xs text-amber-500">MCB</span></div>
            <button 
              onClick={() => handleAction('claim')}
              disabled={isProcessing}
              className="w-full bg-white text-black py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all active:scale-95"
            >
              HARVEST MCB ENERGY 🔋
            </button>
          </section>
          
          <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 text-center">
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">MeeBot_Protocol_v3.1_RigControl_MCB</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingPage;
