
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppState';
import { ABIS, ADRS } from '../lib/contracts';
import { client } from '../lib/viemClient';
import { getNFTBalance } from '../lib/services/nft';

interface NFTItem {
  tokenId: string;
  tokenURI: string;
  name: string;
  rarity: string;
  image: string;
}

const GalleryPage: React.FC = () => {
  const { state, events } = useApp();
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!state.account) return;

    const fetchNFTs = async () => {
      setIsLoading(true);
      try {
        // Use the service helper which has a built-in mock fallback for dev/demo purposes
        const balance = await getNFTBalance(state.account);

        const count = Number(balance);
        const fetchedItems: NFTItem[] = [];

        // Here we simulate fetching metadata for the items the user owns.
        for (let i = 0; i < Math.min(count, 12); i++) {
          fetchedItems.push({
            tokenId: (1000 + i).toString(),
            tokenURI: `ipfs://meebot-assets/v1/${1000 + i}`,
            name: `Cyber MeeBot #${1000 + i}`,
            image: `https://picsum.photos/seed/meebot${i}/600/600`,
            rarity: i === 0 ? 'Legendary' : i < 3 ? 'Epic' : 'Common'
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

  const transferLogs = events.filter(e => e.contract === 'NFT' && e.type === 'Transfer');

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter mb-2 uppercase italic">
            NFT <span className="text-indigo-400 font-black">Gallery</span>
          </h1>
          <p className="text-slate-400 font-medium">Visualizing your assets within the MeeBot collective.</p>
        </div>
        
        {state.account && (
          <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 px-6 py-3 rounded-2xl text-indigo-400 font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/5">
            <span>{state.balances.nftCount}</span>
            <span className="text-slate-500">MeeBots Detected</span>
          </div>
        )}
      </header>

      {!state.account ? (
        <div className="glass p-20 rounded-[3rem] text-center border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="w-24 h-24 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl shadow-2xl shadow-indigo-500/10">
            🔒
          </div>
          <h2 className="text-3xl font-black mb-4 uppercase italic tracking-tighter">Vault is Encrypted</h2>
          <p className="text-slate-500 max-w-sm mx-auto mb-10 font-medium leading-relaxed">The high-utility MeeBot collection is only visible to verified collective members. Establish link to proceed.</p>
          <button 
            onClick={() => window.scrollTo(0, 0)}
            className="px-10 py-4 bg-indigo-500 text-white font-black text-sm rounded-2xl shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
          >
            Authenticate Identity
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass aspect-[3/4] rounded-[2.5rem] animate-pulse bg-white/5"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {nfts.map((nft) => (
              <div key={nft.tokenId} className="glass group overflow-hidden rounded-[2.5rem] border-white/5 hover:border-indigo-500/30 transition-all duration-500 hover:-translate-y-2 relative">
                <div className="relative aspect-square overflow-hidden">
                  <img src={nft.image} alt={nft.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                  
                  <div className="absolute top-6 left-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-xl border ${
                      nft.rarity === 'Legendary' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      nft.rarity === 'Epic' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                      'bg-sky-500/20 text-sky-400 border-sky-500/30'
                    }`}>
                      {nft.rarity}
                    </span>
                  </div>
                </div>

                <div className="p-8 relative">
                  <p className="text-[10px] text-slate-500 font-black mb-2 uppercase tracking-[0.3em]">Identification #{nft.tokenId}</p>
                  <h3 className="font-black text-xl mb-6 tracking-tighter uppercase italic">{nft.name}</h3>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-white/5 hover:bg-white/10 text-[10px] font-black py-3 rounded-2xl transition-all uppercase tracking-widest border border-white/5">Transfer</button>
                    <button className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-[10px] font-black py-3 rounded-2xl transition-all uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20">Stake</button>
                  </div>
                </div>
              </div>
            ))}

            {nfts.length === 0 && (
              <div className="col-span-full py-32 text-center glass rounded-[3rem] border-dashed border-white/10">
                <p className="text-slate-500 font-black uppercase tracking-[0.3em] italic">No MeeBots detected in this sector</p>
              </div>
            )}
          </div>

          <section className="glass p-12 rounded-[3rem] border-white/5 bg-gradient-to-br from-white/[0.01] to-transparent">
             <h2 className="text-2xl font-black mb-8 flex items-center gap-4 uppercase tracking-tighter italic">
              <span className="w-12 h-1 bg-indigo-500 rounded-full"></span>
              NFT Transfer Logs
            </h2>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
              {transferLogs.length > 0 ? transferLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-6 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="text-2xl">🖼</div>
                    <div>
                      <p className="font-black text-sm uppercase tracking-tight">Transfer #{log.tokenId}</p>
                      <p className="text-[10px] text-slate-500 font-medium">From: {log.from.slice(0, 10)}... → To: {log.to?.slice(0, 10)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-600 font-mono mb-1 uppercase tracking-widest">{new Date(log.timestamp).toLocaleTimeString()}</p>
                    <a href={`https://explorer.meechain.com/tx/${log.hash}`} className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">Verify ↗</a>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center opacity-20">
                  <p className="text-xs font-black uppercase tracking-[0.4em] italic">No recent transfer rituals observed</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
