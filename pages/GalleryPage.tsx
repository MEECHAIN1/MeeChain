
import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../context/AppState';
import { getNFTBalance } from '../lib/services/nft';

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
  aura: string; // Aura color based on rarity/personality
  stats: {
    power: number;
    speed: number;
    intel: number;
  };
  components: NFTComponent[];
}

// --- Mystical Generators ---
const prefixes = ["Alpha", "Zeta", "Nova", "Orion", "Titan", "Celestial", "Astra", "Nebula", "Lotus", "Dragon"];
const suffixes = ["Core", "Prime", "Flux", "Pulse", "Sentinel", "Phantom", "Legend", "Spirit", "Soul", "Monk"];

const generateMeeBotName = (id: string) => {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${prefix}-${suffix}-${id}`;
};

const auraColors = {
  Common: "#38bdf8", // Blue
  Epic: "#a855f7",   // Purple
  Legendary: "#f59e0b", // Gold/Amber
};

const GalleryPage: React.FC = () => {
  const { state, setGalleryFilter } = useApp();
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!state.account) return;

    const fetchNFTs = async () => {
      setIsLoading(true);
      try {
        const balance = await getNFTBalance(state.account);
        // Using balance or a default set for visualization
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
          const multiplier = rarity === 'Legendary' ? 1.5 : rarity === 'Epic' ? 1.2 : 1;
          const tokenId = (1000 + i).toString();

          fetchedItems.push({
            tokenId,
            tokenURI: `ipfs://meebot-assets/v1/${tokenId}`,
            name: generateMeeBotName(tokenId),
            image: `https://picsum.photos/seed/meebot_spirit_${i}/800/800`,
            rarity,
            aura: auraColors[rarity],
            personality: spiritualPersonalities[i % spiritualPersonalities.length],
            stats: {
              power: Math.floor(Math.random() * 40 + 60 * multiplier),
              speed: Math.floor(Math.random() * 40 + 60 * multiplier),
              intel: Math.floor(Math.random() * 40 + 60 * multiplier),
            },
            components: [
              { label: 'Chassis', value: chassisTypes[i % chassisTypes.length], icon: '🛡️' },
              { label: 'Energy', value: energySources[i % energySources.length], icon: '🔥' },
              { label: 'Optics', value: optics[i % optics.length], icon: '👁️' }
            ]
          });
        }
        setNfts(fetchedItems);
      } catch (err) {
        console.error("⚡ Gallery UI Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTs();
  }, [state.account]);

  const filteredNfts = useMemo(() => {
    if (state.galleryFilter === 'All') return nfts;
    return nfts.filter(nft => nft.rarity === state.galleryFilter);
  }, [nfts, state.galleryFilter]);

  const filterOptions = [
    { label: 'ALL UNITS', value: 'All' },
    { label: 'LEGENDARY', value: 'Legendary' },
    { label: 'EPIC', value: 'Epic' },
    { label: 'COMMON', value: 'Common' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-2 h-10 bg-amber-500 rounded-full animate-pulse"></span>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic">
              Mechanical <span className="text-amber-500">Sanctum</span>
            </h1>
          </div>
          <p className="text-slate-400 font-medium max-w-xl">
            คลังสะสม MeeBot จิตวิญญาณจักรวาล — ผสมผสานเทคโนโลยีขั้นสูงเข้ากับพลังแห่ง Lotus และมังกรผู้พิทักษ์
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-black/40 p-2 rounded-3xl border border-white/5 shadow-inner">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] px-4">Frequency Filter:</span>
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setGalleryFilter(opt.value)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                state.galleryFilter === opt.value
                  ? `bg-amber-500 text-black shadow-lg shadow-amber-500/20`
                  : `text-slate-500 hover:text-white hover:bg-white/5`
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </header>

      {!state.account ? (
        <div className="glass p-20 rounded-[4rem] text-center border-white/5 flex flex-col items-center">
          <div className="w-24 h-24 bg-amber-500/10 text-amber-500 rounded-[2.5rem] flex items-center justify-center text-4xl mb-8 shadow-[0_0_40px_rgba(245,158,11,0.1)] border border-amber-500/20">
            🔒
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-white">Neural Vault Locked</h2>
          <p className="text-slate-500 max-w-md mb-10 font-medium leading-relaxed">โปรดเชื่อมต่อ Neural Link ของคุณเพื่อ decrypt ข้อมูลยูนิตที่มีความถื่สอดคล้องกับจิตวิญญาณของคุณ</p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-12 py-4 bg-white text-black font-black text-xs rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.3em]"
          >
            Authenticate Link
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass aspect-[3/5] rounded-[2.5rem] animate-pulse bg-white/5 border border-white/5"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 pb-20">
          {filteredNfts.map((nft) => (
            <div 
              key={nft.tokenId} 
              style={{ 
                boxShadow: `0 0 40px ${nft.aura}11`,
                borderColor: `${nft.aura}33`
              }}
              className="glass group overflow-hidden rounded-[2.5rem] border transition-all duration-700 hover:-translate-y-4 relative flex flex-col bg-gradient-to-br from-white/[0.03] to-transparent"
            >
              {/* Image Section with Cosmic Vibes */}
              <div className="relative aspect-square overflow-hidden bg-black/80">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                
                <img 
                  src={nft.image} 
                  alt={nft.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-80 group-hover:opacity-100 filter brightness-90 group-hover:brightness-110" 
                />
                
                {/* Spiritual Tags */}
                <div className="absolute top-5 left-5 flex flex-col gap-2">
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-xl border ${
                    nft.rarity === 'Legendary' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]' :
                    nft.rarity === 'Epic' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                    'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  }`}>
                    {nft.rarity}
                  </span>
                </div>

                <div className="absolute top-5 right-5">
                  <span className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[8px] font-mono text-white/50 tracking-tighter">
                    #{nft.tokenId}
                  </span>
                </div>

                {/* Machine Spirit Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/40 to-transparent">
                  <p className="text-[10px] font-black text-amber-500/90 uppercase tracking-[0.3em] italic animate-pulse">
                    {nft.personality}
                  </p>
                </div>
              </div>

              {/* Data Panel */}
              <div className="p-8 space-y-6 flex-grow flex flex-col relative">
                {/* Cosmic Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                <div className="relative">
                  <h3 className="font-black text-2xl tracking-tighter uppercase italic text-white group-hover:text-amber-500 transition-colors leading-none">
                    {nft.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Ritual Status: Manifested</span>
                  </div>
                </div>

                {/* Spiritual Hardware Signature */}
                <div className="space-y-3">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mb-1">Specimen Composition</p>
                  <div className="space-y-2">
                    {nft.components.map((comp, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-2xl group/item hover:bg-white/[0.05] transition-all">
                        <div className="flex items-center gap-3">
                          <span className="text-sm group-hover/item:scale-125 transition-transform duration-500">{comp.icon}</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{comp.label}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-200 group-hover/item:text-white">{comp.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Telemetry Stats */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-black/50 p-3 rounded-2xl border border-white/5 text-center group/stat hover:border-amber-500/20 transition-all">
                    <p className="text-[7px] font-black text-slate-600 uppercase mb-1 group-hover/stat:text-rose-500">Power</p>
                    <p className="text-base font-black text-white">{nft.stats.power}</p>
                  </div>
                  <div className="bg-black/50 p-3 rounded-2xl border border-white/5 text-center group/stat hover:border-sky-500/20 transition-all">
                    <p className="text-[7px] font-black text-slate-600 uppercase mb-1 group-hover/stat:text-sky-500">Speed</p>
                    <p className="text-base font-black text-white">{nft.stats.speed}</p>
                  </div>
                  <div className="bg-black/50 p-3 rounded-2xl border border-white/5 text-center group/stat hover:border-emerald-500/20 transition-all">
                    <p className="text-[7px] font-black text-slate-600 uppercase mb-1 group-hover/stat:text-emerald-500">Intel</p>
                    <p className="text-base font-black text-white">{nft.stats.intel}</p>
                  </div>
                </div>

                <div className="pt-6 flex gap-3 mt-auto">
                  <button className="flex-1 bg-white/5 hover:bg-white/10 text-[9px] font-black py-4 rounded-2xl transition-all uppercase tracking-widest border border-white/5 active:scale-95">
                    DIAGNOSTICS
                  </button>
                  <button 
                    style={{ backgroundColor: nft.aura, color: nft.rarity === 'Legendary' ? 'black' : 'white' }}
                    className="flex-1 hover:brightness-110 text-[9px] font-black py-4 rounded-2xl transition-all uppercase tracking-widest shadow-xl active:scale-95 border-b-4 border-black/20"
                  >
                    DEPLOY ⚡
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredNfts.length === 0 && (
            <div className="col-span-full py-40 text-center glass rounded-[4rem] border-dashed border-white/10">
              <div className="text-7xl mb-8 opacity-20 animate-pulse">🛸</div>
              <p className="text-slate-500 font-black uppercase tracking-[0.5em] italic mb-8">
                ตรวจไม่พบสัญญาณ MeeBot ระดับ <span className="text-amber-500">{state.galleryFilter}</span> ใน Sector นี้
              </p>
              <button 
                onClick={() => setGalleryFilter('All')}
                className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-amber-500 hover:text-white hover:bg-amber-600 transition-all uppercase tracking-[0.3em]"
              >
                Reset Frequency
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
