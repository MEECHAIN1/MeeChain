
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppState';
import { MeeBot } from '../types';

/**
 * 🖼️ Mechanical Sanctum (GalleryPage)
 * A high-fidelity visualization of the user's MeeBot collective.
 * Features a persistent rarity filter and real-time telemetry stats.
 */
const GalleryPage: React.FC = () => {
  const { state, setGalleryFilter, setGlobalLoading, refreshBalances } = useApp();
  const [localDropdownOpen, setLocalDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside the container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLocalDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter logic: Merges global state with local display requirements
  // The persistence is handled in AppState.tsx via localStorage sync
  const filteredNfts = useMemo(() => {
    if (state.galleryFilter === 'All') return state.myBots;
    return state.myBots.filter(nft => nft.rarity === state.galleryFilter);
  }, [state.myBots, state.galleryFilter]);

  const handleRefreshGallery = async () => {
    setGlobalLoading('gallery', true);
    // Deep scan simulation for thematic immersion
    await new Promise(r => setTimeout(r, 1200));
    await refreshBalances();
    setGlobalLoading('gallery', false);
  };

  const filterOptions = [
    { label: 'ALL UNITS', value: 'All', icon: '🌐' },
    { label: 'LEGENDARY', value: 'Legendary', color: 'text-amber-500', icon: '👑' },
    { label: 'EPIC', value: 'Epic', color: 'text-purple-500', icon: '💠' },
    { label: 'COMMON', value: 'Common', color: 'text-sky-500', icon: '🤖' },
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

          {/* Persistent Rarity Filter Dropdown */}
          <div className="relative w-full sm:w-72" ref={dropdownRef}>
            <button 
              onClick={() => setLocalDropdownOpen(!localDropdownOpen)}
              className="w-full bg-black/40 border-2 border-white/5 px-8 py-5 rounded-[2rem] flex items-center justify-between group hover:border-amber-500/30 transition-all shadow-xl font-mono"
            >
              <div className="flex items-center gap-3">
                <span className="text-amber-500/50">📡</span>
                <span className="text-[10px] font-black text-white tracking-widest uppercase italic">
                   {state.galleryFilter === 'All' ? 'ALL UNITS' : state.galleryFilter.toUpperCase()}
                </span>
              </div>
              <span className={`text-amber-500 transition-transform duration-300 ${localDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {localDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-4 glass border border-white/10 rounded-[2rem] overflow-hidden z-[60] shadow-2xl animate-in slide-in-from-top-4 font-mono">
                <div className="p-2 space-y-1 bg-[#0a0f1a]/95 backdrop-blur-3xl">
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
                      <div className="flex items-center gap-4">
                        <span className="text-sm">{opt.icon}</span>
                        <span className={opt.color || ''}>{opt.label}</span>
                      </div>
                      {state.galleryFilter === opt.value && <span className="text-[10px]">●</span>}
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
      ) : filteredNfts.length === 0 ? (
        <div className="glass p-24 rounded-[4rem] text-center border-dashed border-white/5 flex flex-col items-center animate-in fade-in duration-700">
          <div className="text-6xl mb-6 opacity-20">🌫️</div>
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">No Units Detected</h3>
          <p className="text-slate-500 mt-2 font-mono text-[10px] uppercase tracking-widest">Sector {state.galleryFilter.toUpperCase()} returns zero resonance.</p>
          <button 
            onClick={() => setGalleryFilter('All')}
            className="mt-8 px-10 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/10 transition-all"
          >
            Clear Filters
          </button>
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
                    nft.rarity === 'Legendary' 
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                    nft.rarity === 'Epic' 
                      ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 
                    'bg-sky-500/10 text-sky-500 border-sky-500/20'
                  }`}>
                    {nft.rarity}
                  </span>
                </div>
              </div>

              {/* Data Section */}
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black italic text-white uppercase tracking-tighter group-hover:text-amber-500 transition-colors">
                      {nft.name}
                    </h3>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 font-mono">
                      UNIT_ID: #{nft.id}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest font-mono">Integrated Components</p>
                  <div className="flex flex-wrap gap-2">
                    {nft.components.map((comp, idx) => {
                      const rarity = getComponentRarity(comp);
                      return (
                        <span key={idx} className={`px-3 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest border ${rarity.border} ${rarity.color}/10 ${rarity.color.replace('bg-', 'text-')}`}>
                          {comp}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5 font-mono">
                  {Object.entries(nft.baseStats).map(([key, val]) => (
                    <div key={key} className="text-center">
                      <p className="text-[7px] text-slate-600 font-black uppercase tracking-widest mb-1">{key}</p>
                      <p className="text-xs font-black text-white">{val}</p>
                    </div>
                  ))}
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
