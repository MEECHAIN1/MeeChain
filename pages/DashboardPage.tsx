
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

  const StatCard = ({ title, value, unit, color, icon }: { title: string, value: string, unit: string, color: string, icon: string }) => (
    <div className="glass p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] hover:border-white/20 transition-all group relative overflow-hidden font-mono">
      <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-10 group-hover:opacity-20 transition-opacity text-2xl sm:text-4xl">
        {icon}
      </div>
      <p className="text-slate-400 text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl sm:text-4xl font-black tracking-tighter ${color}`}>{value}</span>
        <span className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tighter mb-2 italic uppercase">
            MeeBot <span className="text-sky-400">Telemetry</span>
          </h1>
          <p className="text-slate-400 font-medium text-xs sm:text-base">Real-time neural feedback from the BSC substrate.</p>
        </div>
        
        {state.account && (
          <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 sm:px-6 sm:py-3 rounded-2xl backdrop-blur-md self-start md:self-auto font-mono">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500 animate-spin' : 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}></div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isLoading ? 'text-amber-500' : 'text-emerald-400'}`}>
              {isLoading ? 'Ritual in Sync' : 'System Live'}
            </span>
          </div>
        )}
      </header>

      {!state.account ? (
        <div className="glass p-8 sm:p-16 rounded-[2rem] sm:rounded-[3rem] text-center border-dashed border-white/10 flex flex-col items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-500/10 text-sky-400 rounded-full flex items-center justify-center mb-6 text-2xl sm:text-3xl animate-bounce border border-sky-500/20">
            ⚡
          </div>
          <h2 className="text-xl sm:text-2xl font-black mb-3 italic uppercase tracking-tighter">Initiate Neural Link</h2>
          <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium text-xs sm:text-sm leading-relaxed">Please connect your digital signature to authorize asset telemetry and ritual monitoring.</p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-full sm:w-auto px-10 py-4 bg-white text-black font-black text-[10px] rounded-2xl shadow-xl shadow-white/5 active:scale-95 transition-all uppercase tracking-widest hover:bg-amber-50"
          >
            Connect Identity
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
                <StatCard title="BNB Gas Flux" value={parseFloat(state.balances.native).toFixed(4)} unit="BNB" color="text-white" icon="💎" />
                <StatCard title="MCB Energy" value={parseFloat(state.balances.token).toFixed(2)} unit="MCB" color="text-sky-400" icon="🔋" />
                <StatCard title="Staked Flux" value={parseFloat(state.balances.staked).toFixed(1)} unit="sMCB" color="text-amber-400" icon="💰" />
                <StatCard title="Active Spirits" value={state.balances.nftCount.toString()} unit="UNITS" color="text-indigo-400" icon="🖼" />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <section className="lg:col-span-2 glass p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-5">
                <span className="text-6xl sm:text-9xl font-black italic font-mono">LOGS</span>
              </div>
              
              <h2 className="text-lg sm:text-xl font-black mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4 uppercase tracking-tighter italic">
                <span className="w-1.5 h-6 sm:w-2 sm:h-8 bg-emerald-500 rounded-full"></span>
                Ritual Feed
              </h2>

              <div className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar font-mono">
                {isLoading && events.length === 0 ? (
                  <>
                    <SkeletonRow /><SkeletonRow /><SkeletonRow />
                  </>
                ) : events.length > 0 ? events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 sm:p-5 bg-black/40 rounded-xl sm:rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex items-center gap-3 sm:gap-5">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl shadow-inner ${
                        event.type === 'Staked' ? 'bg-amber-500/10 text-amber-500' :
                        event.type === 'Minted' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-sky-500/10 text-sky-400'
                      }`}>
                        {event.type === 'Staked' ? '📥' : event.type === 'Minted' ? '🎨' : '💸'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-black text-xs sm:text-sm uppercase tracking-tight">{event.type}</p>
                          <span className="text-[8px] sm:text-[10px] bg-white/5 px-2 py-0.5 rounded-md text-slate-500 font-bold">{event.contract}</span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
                          {event.amount || `Token #${event.tokenId}`} • {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="hidden sm:block text-right">
                        <p className="text-[10px] font-mono text-slate-600 truncate max-w-[100px]">{event.hash}</p>
                      </div>
                      <a href={`https://bscscan.com/tx/${event.hash}`} target="_blank" rel="noreferrer" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-xs">
                        ↗
                      </a>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center opacity-30">
                    <p className="text-[10px] sm:text-sm font-black uppercase tracking-widest italic font-mono">Awaiting manifestation event...</p>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-6">
              <div 
                onClick={() => window.location.hash = '#/staking'}
                className="bg-amber-500 p-8 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] text-black shadow-2xl shadow-amber-500/10 group cursor-pointer relative overflow-hidden transition-all hover:-translate-y-1 active:scale-95"
              >
                 <div className="absolute -bottom-6 -right-6 text-7xl sm:text-9xl opacity-10 group-hover:scale-110 transition-transform duration-700">🔮</div>
                <h3 className="text-xl sm:text-2xl font-black mb-4 uppercase tracking-tighter italic">Stake & Ascend</h3>
                <p className="text-black/70 text-xs sm:text-sm font-bold leading-relaxed mb-8 sm:mb-10 uppercase">
                  Commit your machine spirits to the infusion rigs to unlock elite capabilities and yield MCB flux.
                </p>
                <div className="flex items-center justify-between">
                  <div className="bg-black/10 backdrop-blur-md px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    APR 24.5%
                  </div>
                  <button className="bg-black text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full font-black text-lg group-hover:translate-x-1 transition-transform">
                    →
                  </button>
                </div>
              </div>

              <div className="glass p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-white/5 font-mono">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Protocol Node Stats</h4>
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Neural Link</span>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">SECURE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Substrate</span>
                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">BSC_MAINNET</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-1 border border-white/5">
                    <div className="bg-sky-500 h-full w-4/5 animate-pulse shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div>
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
