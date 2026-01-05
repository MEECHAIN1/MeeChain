
import React, { useEffect } from 'react';
import { useApp } from '../context/AppState';
import { SkeletonStat, SkeletonRow } from '../components/SkeletonCard';

const DashboardPage: React.FC = () => {
  const { state, events, refreshBalances } = useApp();
  const isLoading = state.loadingStates.balances;

  useEffect(() => {
    if (state.account) {
      refreshBalances();
    }
  }, [state.account, refreshBalances]);

  const totalEnergy = state.myBots.reduce((acc, bot) => acc + bot.energyLevel, 0);

  const StatCard = ({ title, value, unit, color, icon }: { title: string, value: string, unit: string, color: string, icon: string }) => (
    <div className="glass p-5 rounded-[2rem] hover:border-white/20 transition-all group relative overflow-hidden font-mono border border-white/5">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-4xl">
        {icon}
      </div>
      <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1.5">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-black tracking-tighter ${color}`}>{value}</span>
        <span className="text-slate-600 text-[10px] font-bold uppercase">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 page-transition">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter italic uppercase text-white">
              Neural <span className="text-amber-500">Dashboard</span>
            </h1>
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Secured Link</span>
            </div>
          </div>
          <p className="text-slate-500 font-medium text-xs sm:text-sm">Real-time telemetry from the MeeChain substrate. Nodes synchronized.</p>
        </div>
        
        {state.account && (
          <div className="flex items-center gap-6 px-6 py-3 bg-black/40 rounded-2xl border border-white/5 font-mono shadow-xl">
            <div className="text-right">
              <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Fleet Flux</p>
              <p className="text-xs font-black text-white">{totalEnergy} MCB</p>
            </div>
            <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-amber-500 animate-pulse" style={{ width: `${Math.min(totalEnergy, 100)}%` }}></div>
            </div>
          </div>
        )}
      </header>

      {!state.account ? (
        <div className="glass p-12 sm:p-24 rounded-[3rem] text-center border-dashed border-white/10 flex flex-col items-center bg-gradient-to-br from-black/40 to-transparent">
          <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-[2rem] flex items-center justify-center mb-8 text-3xl animate-bounce border border-amber-500/20 shadow-2xl">
            ⚡
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-4 italic uppercase tracking-tighter text-white">Initiate Neural Link</h2>
          <p className="text-slate-500 max-w-sm mx-auto mb-10 font-medium text-xs sm:text-sm leading-relaxed">Please connect your digital signature to authorize asset telemetry and secure ritual monitoring.</p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-12 py-4 bg-white text-black font-black text-[10px] rounded-2xl shadow-2xl shadow-white/5 active:scale-95 transition-all uppercase tracking-widest hover:bg-amber-50 border-b-4 border-slate-300"
          >
            Authorize Connection
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {isLoading ? (
              <>
                <SkeletonStat /><SkeletonStat /><SkeletonStat /><SkeletonStat />
              </>
            ) : (
              <>
                <StatCard title="Gas Reserves" value={parseFloat(state.balances.native).toFixed(3)} unit="BNB" color="text-white" icon="💎" />
                <StatCard title="MCB Energy" value={parseFloat(state.balances.token).toFixed(1)} unit="MCB" color="text-amber-500" icon="🔋" />
                <StatCard title="Locked Flux" value={parseFloat(state.balances.staked).toFixed(0)} unit="S-MCB" color="text-sky-500" icon="💰" />
                <StatCard title="Neural Units" value={state.balances.nftCount.toString()} unit="SPIRITS" color="text-emerald-500" icon="🖼" />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-2 glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden bg-black/20 shadow-2xl">
              <h2 className="text-xl font-black mb-8 flex items-center gap-4 uppercase tracking-tighter italic text-white">
                <span className="w-2 h-8 bg-amber-500 rounded-full"></span>
                Ritual Feed
              </h2>

              <div className="space-y-4 max-h-[440px] overflow-y-auto pr-3 custom-scrollbar font-mono">
                {isLoading && events.length === 0 ? (
                  <>
                    <SkeletonRow /><SkeletonRow /><SkeletonRow />
                  </>
                ) : events.length > 0 ? events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-5 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                        event.type === 'Staked' ? 'bg-amber-500/10 text-amber-500' :
                        event.type === 'Minted' ? 'bg-rose-500/10 text-rose-500' : 'bg-sky-500/10 text-sky-500'
                      }`}>
                        {event.type === 'Staked' ? '⚙️' : event.type === 'Minted' ? '🌸' : '📡'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-black text-xs uppercase tracking-tight text-white">{event.type}</p>
                          <span className="text-[7px] bg-white/5 px-2 py-0.5 rounded text-slate-600 font-black uppercase tracking-widest">{event.contract}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {event.amount || `Spirit #${event.tokenId}`} • {new Date(event.timestamp).toLocaleTimeString([], { hour12: false })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="hidden sm:block text-[9px] font-mono text-slate-700 truncate max-w-[120px]">{event.hash}</p>
                      <a href={`https://bscscan.com/tx/${event.hash}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-xs text-slate-400">
                        ↗
                      </a>
                    </div>
                  </div>
                )) : (
                  <div className="py-24 text-center opacity-20">
                    <p className="text-xs font-black uppercase tracking-[0.4em] italic text-slate-500">Awaiting Ritual manifestations...</p>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-6">
              <div 
                onClick={() => window.location.hash = '#/staking'}
                className="bg-amber-500 p-10 rounded-[2.5rem] text-black shadow-2xl shadow-amber-500/10 group cursor-pointer relative overflow-hidden transition-all hover:-translate-y-1 active:scale-95 border-b-8 border-amber-700"
              >
                 <div className="absolute -bottom-8 -right-8 text-9xl opacity-10 group-hover:scale-110 transition-transform duration-1000">⚙️</div>
                <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter italic">Infuse Energy</h3>
                <p className="text-black/70 text-xs font-bold leading-relaxed mb-10 uppercase">
                  Commit your units to active rigs to generate MCB flux and unlock elite neural tiers.
                </p>
                <div className="flex items-center justify-between">
                  <div className="bg-black/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    Sync Enabled
                  </div>
                  <button className="bg-black text-white w-12 h-12 rounded-2xl font-black text-xl group-hover:translate-x-1 transition-transform shadow-xl">
                    →
                  </button>
                </div>
              </div>

              <div className="glass p-8 rounded-[2rem] border-white/5 font-mono bg-white/[0.02]">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Network Health</h4>
                <div className="space-y-5">
                   <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Protocol Sync</span>
                    <span className="text-[9px] font-black text-emerald-500 uppercase">99.9% Optimal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Block Height</span>
                    <span className="text-[9px] font-black text-sky-500 uppercase">SYNCHRONIZED</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2 relative">
                    <div className="absolute inset-0 bg-amber-500/20 blur-[4px]"></div>
                    <div className="relative h-full bg-amber-500 w-full animate-pulse"></div>
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
