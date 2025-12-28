
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppState';
import { getNFTBalance } from '../lib/services/nft';
import { generateMeeBotName } from '../lib/meeBotNames';

interface NFTComponent {
  label: string;
  value: string;
  icon: string;
}

interface NFTItem {
  tokenId: string;
  tokenURI: string;
  name: string;
  rarity: 'Common' | 'Epic' | 'Legendary';
  image: string;
  personality: string;
  aura: string; // Aura color based on rarity
  stats: {
    power: number;
    speed: number;
    intel: number;
  };
  components: NFTComponent[];
}

const auraColors = {
  Common: "#38bdf8", // Blue
  Epic: "#a855f7",   // Purple
  Legendary: "#f59e0b", // Gold/Amber
};

const GalleryPage: React.FC = () => {
  const { state, setGalleryFilter, setGlobalLoading } = useApp();
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [localDropdownOpen, setLocalDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoading = state.loadingStates.gallery;

  useEffect(() => {
    if (!state.account) return;

    const fetchNFTs = async () => {
      setGlobalLoading('gallery', true);
      try {
        const balance = await getNFTBalance(state.account);
        // Ensure visual density in the gallery by generating specimens
        const count = Math.max(Number(balance), 12);
        const fetchedItems: NFTItem[] = [];

        const spiritualPersonalities = [
          'Sentient Lotus', 'Dragon Guardian', 'Strategic Seer', 
          'Celestial Monk', 'Void Prophet', 'Eternal Flame', 
          'Quantum Sage', 'Astral Sentinel'
        ];
        
        const chassisTypes = ['Celestial Frame', 'Dragon-Scale Shell', 'Lotus Fiber Mesh', 'Void Alloy'];
        const energySources = ['Lotus Flame', 'Quantum Reactor', 'Star Engine', 'Neural Spark'];
        const optics = ['Spiritual Blue Eyes', 'Thermal Optics', 'Quantum Vision', 'Spectral Array'];

        for (let i = 0; i < count; i++) {
          const rarity: 'Common' | 'Epic' | 'Legendary' = i % 10 === 0 ? 'Legendary' : i % 4 === 0 ? 'Epic' : 'Common';
          const multiplier = rarity === 'Legendary' ? 1.6 : rarity === 'Epic' ? 1.3 : 1.1;
          const tokenId = (2000 + i).toString();

          fetchedItems.push({
            tokenId,
            tokenURI: `ipfs://meebot-assets/v2/${tokenId}`,
            name: generateMeeBotName(tokenId),
            image: `https://picsum.photos/seed/meebot_v2_${i}/1024/1024`,
            rarity,
            aura: auraColors[rarity],
            personality: spiritualPersonalities[i % spiritualPersonalities.length],
            stats: {
              power: Math.floor(Math.random() * 30 + 50 * multiplier),
              speed: Math.floor(Math.random() * 30 + 50 * multiplier),
              intel: Math.floor(Math.random() * 30 + 50 * multiplier),
            },
            components: [
              { label: 'Chassis', value: chassisTypes[i % chassisTypes.length], icon: '🛡️' },
              { label: 'Energy', value: energySources[i % energySources.length], icon: '⚡' },
              { label: 'Optics', value: optics[i % optics.length], icon: '👁️' }
            ]
          });
        }
        setNfts(fetchedItems);
      } catch (err) {
        console.error("⚡ Gallery UI Sync Error:", err);
      } finally {
        setGlobalLoading('gallery', false);
      }
    };

    fetchNFTs();
  }, [state.account, setGlobalLoading]);

  // Handle outside click for dropdown
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
    if (state.galleryFilter === 'All') return nfts;
    return nfts.filter(nft => nft.rarity === state.galleryFilter);
  }, [nfts, state.galleryFilter]);

  const rarityCounts = useMemo(() => {
    const counts: Record<string, number> = { All: nfts.length, Common: 0, Epic: 0, Legendary: 0 };
    nfts.forEach(nft => {
      if (counts[nft.rarity] !== undefined) {
        counts[nft.rarity]++;
      }
    });
    return counts;
  }, [nfts]);

  const filterOptions = [
    { label: 'ALL SPECIMENS', value: 'All' },
    { label: 'LEGENDARY', value: 'Legendary', color: 'text-amber-500' },
    { label: 'EPIC', value: 'Epic', color: 'text-purple-500' },
    { label: 'COMMON', value: 'Common', color: 'text-sky-500' },
  ];

  const currentFilterLabel = filterOptions.find(opt => opt.value === state.galleryFilter)?.label || 'FILTER UNITS';

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="w-2.5 h-12 bg-amber-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.5)]"></span>
            <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white">
              The <span className="text-amber-500">Sanctum</span>
            </h1>
          </div>
          <p className="text-slate-400 font-medium max-w-2xl leading-relaxed">
            คลังเก็บรวบรวมยูนิต MeeBot ระดับสูง — ทุกยูนิตถูกจารึกบน Eternal Ledger พร้อมระบบ Telemetry และการตรวจวัดจิตวิญญาณแบบ Real-time
          </p>
        </div>
        
        {/* Custom Dropdown Filter */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setLocalDropdownOpen(!localDropdownOpen)}
            className="w-full sm:w-72 bg-black/40 border-2 border-white/5 px-8 py-5 rounded-[2rem] flex items-center justify-between group transition-all hover:border-amber-500/30 shadow-xl"
          >
            <div className="flex flex-col items-start">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Rarity Frequency</span>
              <span className="text-xs font-black text-white tracking-widest uppercase italic">{currentFilterLabel}</span>
            </div>
            <span className={`text-amber-500 transition-transform duration-500 ${localDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {localDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-4 glass border border-white/10 rounded-[2rem] overflow-hidden z-[60] shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-top-4 duration-300">
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
                    <span className="bg-white/5 px-3 py-1 rounded-lg text-[8px] font-mono text-slate-600">
                      {rarityCounts[opt.value] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {!state.account ? (
        <div className="glass p-32 rounded-[5rem] text-center border-white/5 flex flex-col items-center">
          <div className="w-32 h-32 bg-amber-500/10 text-amber-500 rounded-[3rem] flex items-center justify-center text-5xl mb-10 shadow-[0_0_60px_rgba(245,158,11,0.1)] border-2 border-amber-500/20 animate-pulse">
            🔒
          </div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-6 text-white">Neural Vault Restricted</h2>
          <p className="text-slate-500 max-w-lg mb-12 font-medium leading-relaxed">โปรดสร้าง Neural Link เพื่อเข้าถึงข้อมูลจำเพาะและ telemetry ของจักรกลผู้พิทักษ์ในครอบครอง</p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-16 py-5 bg-white text-black font-black text-xs rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all uppercase tracking-[0.4em]"
          >
            Authenticate Link
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass aspect-[3/5] rounded-[3rem] animate-pulse bg-white/5 border border-white/5"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 pb-32">
          {filteredNfts.map((nft) => (
            <div 
              key={nft.tokenId} 
              style={{ 
                boxShadow: `0 0 60px ${nft.aura}08`,
                borderColor: `${nft.aura}22`
              }}
              className="glass group overflow-hidden rounded-[3.5rem] border-2 transition-all duration-700 hover:-translate-y-6 relative flex flex-col bg-gradient-to-br from-white/[0.04] to-transparent shadow-2xl"
            >
              {/* Image Section */}
              <div className="relative aspect-square overflow-hidden bg-black/60">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-10"></div>
                
                <img 
                  src={nft.image} 
                  alt={nft.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 filter brightness-90 group-hover:brightness-110 group-hover:rotate-1" 
                />
                
                {/* Rarity & ID Tags */}
                <div className="absolute top-8 left-8 flex flex-col gap-3 z-20">
                  <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-2xl border shadow-2xl ${
                    nft.rarity === 'Legendary' ? 'bg-amber-500/30 text-amber-200 border-amber-500/50' :
                    nft.rarity === 'Epic' ? 'bg-purple-500/30 text-purple-200 border-purple-500/50' :
                    'bg-sky-500/30 text-sky-200 border-sky-500/50'
                  }`}>
                    {nft.rarity}
                  </span>
                </div>

                <div className="absolute top-8 right-8 z-20">
                  <span className="bg-black/80 backdrop-blur-2xl px-4 py-2 rounded-xl border border-white/10 text-[9px] font-mono text-white/40 tracking-tighter">
                    #{nft.tokenId}
                  </span>
                </div>

                {/* Machine Spirit Banner */}
                <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black via-black/60 to-transparent z-20">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                    <p className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] italic drop-shadow-lg">
                      {nft.personality}
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Data Panel */}
              <div className="p-10 space-y-8 flex-grow flex flex-col relative">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                
                <div className="relative">
                  <h3 className="font-black text-3xl tracking-tighter uppercase italic text-white group-hover:text-amber-500 transition-colors leading-tight">
                    {nft.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Substrate Verified</span>
                  </div>
                </div>

                {/* Components Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">Components</p>
                    <span className="h-[1px] flex-grow ml-4 bg-white/5"></span>
                  </div>
                  <div className="space-y-2.5">
                    {nft.components.map((comp, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/5 rounded-2xl group/item hover:bg-white/[0.07] hover:border-white/10 transition-all cursor-default">
                        <div className="flex items-center gap-4">
                          <span className="text-lg group-hover/item:scale-125 transition-transform duration-500 grayscale group-hover/item:grayscale-0">{comp.icon}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{comp.label}</span>
                        </div>
                        <span className="text-[11px] font-black text-slate-300 group-hover/item:text-white transition-colors">{comp.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Telemetry Stats (Power, Speed, Intel) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">Telemetry</p>
                    <span className="h-[1px] flex-grow ml-4 bg-white/5"></span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-black/40 p-4 rounded-3xl border border-white/5 text-center group/stat hover:border-rose-500/30 transition-all shadow-inner">
                      <p className="text-[8px] font-black text-slate-600 uppercase mb-2 group-hover/stat:text-rose-500 transition-colors">PWR</p>
                      <p className="text-xl font-black text-white">{nft.stats.power}</p>
                      <div className="w-full bg-white/5 h-1 mt-3 rounded-full overflow-hidden">
                         <div className="bg-rose-500 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(244,63,94,0.5)]" style={{ width: `${Math.min(100, (nft.stats.power / 160) * 100)}%` }}></div>
                      </div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-3xl border border-white/5 text-center group/stat hover:border-sky-500/30 transition-all shadow-inner">
                      <p className="text-[8px] font-black text-slate-600 uppercase mb-2 group-hover/stat:text-sky-500 transition-colors">SPD</p>
                      <p className="text-xl font-black text-white">{nft.stats.speed}</p>
                      <div className="w-full bg-white/5 h-1 mt-3 rounded-full overflow-hidden">
                         <div className="bg-sky-500 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(14,165,233,0.5)]" style={{ width: `${Math.min(100, (nft.stats.speed / 160) * 100)}%` }}></div>
                      </div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-3xl border border-white/5 text-center group/stat hover:border-emerald-500/30 transition-all shadow-inner">
                      <p className="text-[8px] font-black text-slate-600 uppercase mb-2 group-hover/stat:text-emerald-500 transition-colors">INT</p>
                      <p className="text-xl font-black text-white">{nft.stats.intel}</p>
                      <div className="w-full bg-white/5 h-1 mt-3 rounded-full overflow-hidden">
                         <div className="bg-emerald-500 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${Math.min(100, (nft.stats.intel / 160) * 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 flex gap-4 mt-auto">
                  <button className="flex-1 bg-white/5 hover:bg-white/10 text-[10px] font-black py-5 rounded-2xl transition-all uppercase tracking-[0.2em] border border-white/5 active:scale-95 shadow-lg">
                    DIAGNOSTICS
                  </button>
                  <button 
                    style={{ backgroundColor: nft.aura, color: nft.rarity === 'Legendary' ? 'black' : 'white' }}
                    className="flex-1 hover:brightness-110 text-[10px] font-black py-5 rounded-2xl transition-all uppercase tracking-[0.2em] shadow-2xl active:scale-95 border-b-4 border-black/20"
                  >
                    DEPLOY ⚡
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredNfts.length === 0 && (
            <div className="col-span-full py-56 text-center glass rounded-[5rem] border-dashed border-2 border-white/5">
              <div className="text-8xl mb-10 opacity-20 animate-pulse">🛸</div>
              <p className="text-slate-500 font-black uppercase tracking-[0.6em] italic mb-12">
                ตรวจไม่พบสัญญาณ MeeBot ระดับ <span className="text-amber-500">{state.galleryFilter}</span> ในมิตินี้
              </p>
              <button 
                onClick={() => setGalleryFilter('All')}
                className="px-14 py-5 bg-white/5 border-2 border-white/10 rounded-2xl text-[11px] font-black text-amber-500 hover:text-white hover:bg-amber-600 transition-all uppercase tracking-[0.3em] shadow-xl"
              >
                Reset Calibration
              </button>
            </div>
          )}
        </div>
      )}

      <footer className="flex justify-center pb-12">
        <div className="glass px-10 py-4 rounded-full border border-white/5 flex items-center gap-5 opacity-40">
           <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 italic">Sanctum_Visualization_Core_Active</span>
        </div>
      </footer>
    </div>
  );
};

export default GalleryPage;
