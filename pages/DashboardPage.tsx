import React, { useEffect } from 'react';
import { useChainId } from 'wagmi';
import { useApp } from '../context/AppState';
import { useMCBBalance } from '../hooks/useMCBBalance';
import { NetworkSwitcher } from '../components/NetworkSwitcher';
import { SkeletonStat, SkeletonRow } from '../components/SkeletonCard';
import { MeeBotAIEditor } from '../components/ImageEditor'; 
import { useApp } from '../context/AppState';

const DashboardPage: React.FC = () => {
  const { state, events, refreshBalances } = useApp();
  const { balance: bscBalance, isLoading: isBscLoading } = useMCBBalance(); // 🟢 ดึงยอดจาก BSC/MeeChain อัตโนมัติ
  const chainId = useChainId();
  const isLoading = state.loadingStates.balances || isBscLoading;
  
  useEffect(() => {
    if (state.account) {
      refreshBalances();
    }
  }, [state.account, refreshBalances]);
  
  const StatCard = ({ title, value, unit, color, icon }: { title: string, value: string, unit: string, color: string, icon: string }) => (
    <div className="glass p-6 rounded-[2rem] hover:border-white/20 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-4xl">
        {icon}
      </div>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className={`text-4xl font-black tracking-tighter ${color}`}>{value}</span>
        <span className="text-slate-500 text-xs font-bold uppercase">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
<header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
  <div>
    <h1 className="text-5xl font-black tracking-tighter mb-2">
      ✨ MeeBot <span className="text-sky-400">Dashboard</span>
    </h1>
    <p className="text-slate-400 font-medium">Monitoring the ritual flow of the MeeChain ecosystem.</p>
  </div>
  
  {state.account && (
    <div className="flex flex-col items-end gap-3">
      {/* 🟢 ปุ่มสลับเชนสุดล้ำของเรา */}
      <NetworkSwitcher />
      
      <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-2 rounded-2xl backdrop-blur-md">
        <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`}></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
          {isLoading ? 'Syncing Ritual...' : 'Nexus Connected'}
        </span>
      </div>
    </div>
  )}
</header>
      
      {!state.account ? (
        <div className="glass p-16 rounded-[3rem] text-center border-dashed border-white/10">
          <div className="w-20 h-20 bg-sky-500/10 text-sky-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl animate-bounce">
            ⚡
          </div>
          <h2 className="text-2xl font-black mb-3 italic">Connect to start the ritual</h2>
          <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">Please connect your wallet to access real-time MeeBot telemetry and asset monitoring.</p>
          <button 
            onClick={() => window.scrollTo(0, 0)}
            className="px-8 py-3 bg-white text-black font-black text-sm rounded-2xl shadow-xl shadow-white/5 active:scale-95 transition-all"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              <>
                <SkeletonStat /><SkeletonStat /><SkeletonStat /><SkeletonStat />
              </>
            ) : (
              <>
<StatCard 
    title="MCB Balance" 
    value={bscBalance} // ⚡ ใช้ค่าจาก Hook ที่รองรับเหรียญ 5M MCB บน BSC
    unit="MCB" 
    color="text-white" 
    icon="💎" 
  />
                
 <StatCard title="Staked Tokens"
    value={parseFloat(state.balances.token).toFixed(2)} 
    unit="sMCB" 
    color="text-sky-400" 
    icon="💰" 
   />
                
 <StatCard title="NFT Balance" 
   value={state.balances.nftCount.toString()} 
   unit="ITEMS" 
   color="text-indigo-400" 
   icon="🖼" 
   />
                
  <StatCard title="Reward Rate" 
    value={parseFloat(state.balances.rewardRate).toFixed(4)} 
    unit="MCB/SEC" 
    color="text-amber-400" 
    icon="⚡" 
    /></>
  )}
     </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-2 glass p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <span className="text-9xl font-black">LOGS</span>
              </div>
              
              <h2 className="text-xl font-black mb-8 flex items-center gap-4 uppercase tracking-tighter">
                <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                Ritual Event Stream
              </h2>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {isLoading && events.length === 0 ? (
                  <>
                    <SkeletonRow /><SkeletonRow /><SkeletonRow />
       </>
                ) : events.length > 0 ? events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner ${
                        event.type === 'Staked' ? 'bg-amber-500/10 text-amber-500' :
                        event.type === 'Minted' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-sky-500/10 text-sky-400'
                      }`}>
                        {event.type === 'Staked' ? '📥' : event.type === 'Minted' ? '🎨' : '💸'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-black text-sm uppercase tracking-tight">{event.type}</p>
                          <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-md text-slate-500 font-bold">{event.contract}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                          {event.amount || `Token #${event.tokenId}`} • {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block text-right">
                        <p className="text-[10px] font-mono text-slate-600 truncate max-w-[100px]">{event.hash}</p>
                      </div>
<a 
    href={chainId === 56 
    ? `https://bscscan.com/tx/${event.hash}` 
    : `https://explorer.meechain.com/tx/${event.hash}`} 
  target="_blank" 
  rel="noreferrer" 
  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                        ↗
                      </a>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center opacity-30">
                    <p className="text-sm font-bold uppercase tracking-widest italic">Awaiting first ritual event...</p>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-6">
              <div className="meebot-gradient p-10 rounded-[2.5rem] text-white shadow-2xl shadow-sky-500/20 group cursor-pointer relative overflow-hidden">
                 <div className="absolute -bottom-6 -right-6 text-9xl opacity-10 group-hover:scale-110 transition-transform duration-700">🔮</div>
                <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Stake & Ascend</h3>
                <p className="text-white/80 text-sm font-medium leading-relaxed mb-10">
                  Participate in the MCB staking ritual to unlock legendary bot capabilities and premium governance rights.
                </p>
                <div className="flex items-center justify-between">
                  <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black uppercase">
                    APR 24.5%
                  </div>
                  <button className="bg-white text-black w-12 h-12 rounded-full font-black text-xl hover:scale-110 transition-transform">
                    →
                  </button>
                </div>
              </div>

              <div className="glass p-8 rounded-[2rem] border-white/5">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Quick Stats</h4>
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">Total Nodes</span>
                    <span className="text-sm font-black text-white font-mono">1,204</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">Epoch Status</span>
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Active</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-2">
                    <div className="bg-sky-500 h-full w-2/3 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
