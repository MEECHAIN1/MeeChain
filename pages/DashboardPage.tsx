
import React, { useEffect } from 'react';
import { useApp } from '../context/AppState';
import { SkeletonStat, SkeletonRow } from '../components/SkeletonCard';
import { CONFIG } from '../lib/config';

const DashboardPage: React.FC = () => {
  const { state, events, refreshBalances } = useApp();
  const isLoading = state.loadingStates.balances;

  useEffect(() => {
    if (state.account) {
      refreshBalances();
    }
  }, [state.account, refreshBalances]);

  const ModuleHeader = ({ title, subtitle, icon }: { title: string, subtitle: string, icon: string }) => (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xl border border-white/5">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-white italic">{title}</h3>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{subtitle}</p>
      </div>
    </div>
  );

  const StatModule = ({ title, value, unit, color, icon }: { title: string, value: string, unit: string, color: string, icon: string }) => (
    <div className="glass p-6 rounded-[2rem] border-white/5 relative overflow-hidden group hover:border-white/10 transition-all font-mono">
      <div className="absolute -top-4 -right-4 text-6xl opacity-[0.03] group-hover:scale-110 transition-transform duration-700">{icon}</div>
      <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest mb-2">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-black tracking-tighter ${color}`}>{value}</span>
        <span className="text-slate-600 text-[9px] font-bold uppercase">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div>
          <div className="inline-block glass px-4 py-1.5 rounded-full border-amber-500/20 mb-4 bg-amber-500/5">
            <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.4em] font-mono italic">
              System Control v{CONFIG.VERSION}
            </p>
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white">
            Command <span className="text-amber-500">Center</span>
          </h1>
          <p className="text-slate-400 font-medium text-xs sm:text-sm mt-2">Centralized neural link and substrate telemetry monitoring.</p>
        </div>
        
        {state.account && (
          <div className="flex items-center gap-6 glass px-6 py-4 rounded-2xl border-white/5">
            <div className="flex flex-col text-right">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Neural Health</span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active & Stable</span>
            </div>
            <div className="w-1.5 h-10 bg-emerald-500/20 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 animate-pulse"></div>
            </div>
          </div>
        )}
      </header>

      {!state.account ? (
        <div className="glass p-20 rounded-[3rem] text-center border-dashed border-white/10 flex flex-col items-center">
          <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center mb-6 text-3xl animate-pulse border border-amber-500/20">
            🔑
          </div>
          <h2 className="text-2xl font-black mb-4 italic uppercase tracking-tighter text-white">Authentication Required</h2>
          <p className="text-slate-500 max-w-sm mx-auto mb-10 font-medium text-xs leading-relaxed">
            Establishing a secure neural link is necessary to visualize protocol assets and perform sacred rituals.
          </p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-12 py-4 bg-white text-black font-black text-[10px] rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-[0.4em] hover:bg-amber-50"
          >
            Link Identity
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Telemetry Panel */}
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-6">
              <ModuleHeader title="Flux Telemetry" subtitle="Real-time Substrate Data" icon="📊" />
              <div className="grid grid-cols-2 gap-4">
                {isLoading ? (
                  <><SkeletonStat /><SkeletonStat /></>
                ) : (
                  <>
                    <StatModule title="BNB Flux" value={parseFloat(state.balances.native).toFixed(4)} unit="BNB" color="text-white" icon="💎" />
                    <StatModule title="MCB Energy" value={parseFloat(state.balances.token).toFixed(2)} unit="MCB" color="text-amber-500" icon="🔋" />
                  </>
                )}
              </div>
            </section>

            <section className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden bg-black/40">
              <ModuleHeader title="Neural Activity" subtitle="Immutable Event Stream" icon="📡" />
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar font-mono">
                {isLoading && events.length === 0 ? (
                  <><SkeletonRow /><SkeletonRow /></>
                ) : events.length > 0 ? events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-black/60 flex items-center justify-center text-lg border border-white/5 group-hover:scale-110 transition-transform">
                        {event.type === 'Staked' ? '📥' : event.type === 'Minted' ? '🎨' : '⚡'}
                      </div>
                      <div>
                        <p className="font-black text-[10px] uppercase tracking-widest text-white">{event.type}</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase">{event.amount || `ID: ${event.tokenId}`} • {new Date(event.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <a href={`${CONFIG.NETWORK.EXPLORER}/tx/${event.hash}`} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-[10px] text-slate-400">
                      ↗
                    </a>
                  </div>
                )) : (
                  <div className="py-20 text-center opacity-30">
                    <p className="text-[10px] font-black uppercase tracking-[0.6em] italic text-slate-600">No Manifestations Detected</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Side Directives Panel */}
          <div className="space-y-8">
            <section className="glass p-8 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-amber-500/10 to-transparent">
              <ModuleHeader title="Directives" subtitle="Quick Protocol Actions" icon="⚡" />
              <div className="grid gap-4">
                {[
                  { label: 'Summon Spirit', path: '#/summon', icon: '🌀', desc: 'Generate new assets' },
                  { label: 'Factory Link', path: '#/mint', icon: '🏭', desc: 'Manual manifestation' },
                  { label: 'Access Vault', path: '#/staking', icon: '🔒', desc: 'Secure staking' }
                ].map((action) => (
                  <button 
                    key={action.label}
                    onClick={() => window.location.hash = action.path}
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/30 text-left transition-all flex items-center gap-4 group"
                  >
                    <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">{action.icon}</div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-white tracking-widest">{action.label}</p>
                      <p className="text-[8px] text-slate-600 font-bold uppercase">{action.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="glass p-8 rounded-[2.5rem] border-white/5 font-mono">
              <ModuleHeader title="System Status" subtitle="Neural Node Health" icon="⚙️" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                    <span>Synchronization</span>
                    <span className="text-emerald-500">99.8%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[99.8%] animate-pulse"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Protocol Version</span>
                  <span className="text-[9px] font-black text-white italic">v{CONFIG.VERSION}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
