
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppState';
import { MeeBot } from '../types';

const GalleryPage: React.FC = () => {
  const { state, setGalleryFilter, setGlobalLoading, refreshBalances } = useApp();
  const [localDropdownOpen, setLocalDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLocalDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNfts = useMemo(() => {
    if (state.galleryFilter === 'All') return state.myBots;
    return state.myBots.filter(nft => nft.rarity === state.galleryFilter);
  }, [state.myBots, state.galleryFilter]);

  const handleRefreshGallery = async () => {
    setGlobalLoading('gallery', true);
    // Simulate deep asset scan
    await new Promise(r => setTimeout(r, 1500));
    await refreshBalances();
    setGlobalLoading('gallery', false);
  };

  const filterOptions = [
    { label: 'ALL UNITS', value: 'All' },
    { label: 'LEGENDARY', value: 'Legendary', color: 'text-amber-500' },
    { label: 'EPIC', value: 'Epic', color: 'text-purple-500' },
    { label: 'COMMON', value: 'Common', color: 'text-sky-500' },
  ];

  const getComponentRarity = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('fusion') || n.includes('singularity') || n.includes('omni') || n.includes('hull') || n.includes('crystalline')) {
      return { label: 'LEGENDARY', color: 'bg-amber-500', shadow: 'shadow-amber-500/40', border: 'border-amber-500/20' };
    }
    if (n.includes('quantum') || n.includes('aetheric') || n.includes('tactical') || n.includes('refined') || n.includes('overclocked') || n.includes('enhanced')) {
      return { label: 'EPIC', color: 'bg-purple-500', shadow: 'shadow-purple-500/40', border: 'border-purple-500/20' };
    }
    return { label: 'COMMON', color: 'bg-sky-500', shadow: 'shadow-sky-500/40', border: 'border-sky-500/20' };
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="w-2.5 h-12 bg-amber-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.5)]"></span>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase italic text-white leading-none">
              Mechanical <span className="text-amber-500">Sanctum</span>
            </h1>
          </div>
          <p className="text-slate-400 font-medium max-w-2xl leading-relaxed text-sm sm:text-base">
            Secure archive of identified MeeBot spirits. Telemetry synchronization active across the RitualChain substrate.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button 
            onClick={handleRefreshGallery}
            className="w-full sm:w-auto px-8 py-5 glass rounded-[2rem] border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/5 transition-all flex items-center gap-3"
          >
            <span>🔄</span> Scan Sector
          </button>

          <div className="relative w-full sm:w-72" ref={dropdownRef}>
            <button 
              onClick={() => setLocalDropdownOpen(!localDropdownOpen)}
              className="w-full bg-black/40 border-2 border-white/5 px-8 py-5 rounded-[2rem] flex items-center justify-between group hover:border-amber-500/30 transition-all shadow-xl font-mono"
            >
              <span className="text-[10px] font-black text-white tracking-widest uppercase italic">
                Sector: {state.galleryFilter.toUpperCase()}
              </span>
              <span className={`text-amber-500 transition-transform duration-300 ${localDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {localDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-4 glass border border-white/10 rounded-[2rem] overflow-hidden z-[60] shadow-2xl animate-in slide-in-from-top-4 font-mono">
                <div className="p-2 space-y-1">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setGalleryFilter(opt.value);
                        setLocalDropdownOpen(false);
                      }}
                      className={`w-full px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between hover:bg-white/5 ${
                        state.galleryFilter === opt.value ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400'
                      }`}
                    >
                      <span className={opt.color || ''}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {!state.account ? (
        <div className="glass p-20 sm:p-32 rounded-[3rem] sm:rounded-[5rem] text-center border-white/5 flex flex-col items-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center text-4xl sm:text-5xl mb-10 border-2 border-amber-500/20">
            🔒
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter mb-6 text-white">Neural Link Offline</h2>
          <p className="text-slate-500 max-w-lg mb-12 font-medium">Authentication required to visualize the mechanical collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-32">
          {filteredNfts.map((nft) => (
            <div 
              key={nft.id} 
              className="glass group overflow-hidden rounded-[2.5rem] border border-white/5 transition-all duration-500 hover:-translate-y-2 relative flex flex-col bg-[#05080f]/90 shadow-2xl"
            >
              {/* Image Section */}
              <div className="relative aspect-square overflow-hidden bg-black/40">
                <img src={nft.image} alt={nft.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                
                {/* Overlay UI */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#05080f] via-transparent to-black/20"></div>
                
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-xl border ${
                    nft.rarity === 'Legendary' ? 'bg-amber-500/30 text-amber-200 border-amber-500/50' :
                    nft.rarity === 'Epic' ? 'bg-purple-500/30 text-purple-200 border-purple-500/50' :
                    'bg-sky-500/30 text-sky-200 border-sky-500/50'
                  }`}>
                    {nft.rarity}
                  </span>
                </div>

                <div className="absolute top-6 right-6">
                  <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black text-white font-mono uppercase tracking-widest">NR: {nft.id}</span>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic truncate drop-shadow-lg">
                    {nft.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Energy Potential</span>
                    <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-500" style={{ width: `${Math.min(nft.energyLevel * 2, 100)}%` }}></div>
                    </div>
                    <span className="text-[9px] font-black text-amber-500 font-mono">{nft.energyLevel} MCB</span>
                  </div>
                </div>
              </div>

              {/* Data Content */}
              <div className="p-8 space-y-8">
                {/* Core Components Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <span className="text-amber-500">🛠️</span> Core Components
                    </h4>
                    <span className="text-[8px] font-bold text-slate-700 font-mono italic">Tech-Scan Active</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nft.components.map((component, idx) => {
                      const rarity = getComponentRarity(component);
                      return (
                        <div 
                          key={idx} 
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border ${rarity.border} transition-all hover:bg-white/[0.06] group/item relative overflow-hidden`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${rarity.color} ${rarity.shadow}`}></div>
                          <span className="text-[9px] font-black uppercase text-slate-300 tracking-tight leading-none">
                            {component}
                          </span>
                          <div className={`absolute left-0 top-0 bottom-0 w-[2px] ${rarity.color} opacity-30`}></div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Telemetry Stats Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <span className="text-sky-500">📊</span> Telemetry Stats
                    </h4>
                    <span className="text-[8px] font-bold text-slate-700 font-mono italic">Real-Time Sync</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 font-mono">
                    {[
                      { label: 'PWR', value: Math.floor(nft.baseStats.power + nft.energyLevel * 1.5), max: 250, color: 'bg-rose-500', name: 'Power Level' },
                      { label: 'SPD', value: Math.floor(nft.baseStats.speed + nft.energyLevel * 1.2), max: 250, color: 'bg-sky-500', name: 'Neural Velocity' },
                      { label: 'INT', value: Math.floor(nft.baseStats.intel + nft.energyLevel * 2.0), max: 250, color: 'bg-emerald-500', name: 'Cognitive Matrix' }
                    ].map((stat) => (
                      <div key={stat.label} className="space-y-1.5 group/stat">
                        <div className="flex justify-between items-baseline px-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-white">{stat.label}</span>
                            <span className="text-[7px] font-bold text-slate-600 uppercase tracking-widest opacity-0 group-hover/stat:opacity-100 transition-opacity">
                              {stat.name}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs font-black text-white">{stat.value}</span>
                            <span className="text-[8px] font-bold text-slate-700">/{stat.max}</span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className={`h-full ${stat.color} transition-all duration-1000 shadow-[0_0_10px_currentColor] opacity-80`} 
                            style={{ width: `${Math.min((stat.value / stat.max) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => window.location.hash = '#/staking'}
                    className="flex-grow bg-white/[0.05] hover:bg-white/[0.1] text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border border-white/5 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    Open Rig ⚡
                  </button>
                  <button className="w-14 h-14 bg-white/[0.05] border border-white/5 rounded-2xl flex items-center justify-center hover:bg-white/[0.1] transition-all text-lg group/share">
                    <span className="group-hover:scale-110 transition-transform">📁</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
