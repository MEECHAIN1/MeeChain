
import React, { useState, useCallback } from 'react';
import { useApp } from '../context/AppState';
import { triggerSuccessRitual, triggerCelestialRitual, triggerMintRitual, triggerWarpRitual } from '../lib/rituals';
import { generateMeeBotName } from '../lib/meeBotNames';

const SummonPage: React.FC = () => {
  const { state, notify, addBot, updateLuckiness, spendGems, addEvent, setGlobalLoading } = useApp();
  const [isSummoning, setIsSummoning] = useState(false);
  const [lastResult, setLastResult] = useState<any[]>([]);

  const handleSummon = async (count: number) => {
    if (!state.account) return notify('error', 'Neural Link required for summoning.');
    const cost = count; 
    
    if (state.balances.gems < cost) {
      return notify('error', 'Insufficient Gems for manifestation protocol.');
    }

    setIsSummoning(true);
    setGlobalLoading('general', true);
    triggerCelestialRitual();

    // Simulation delay for ritual immersion
    await new Promise(r => setTimeout(r, 2000));

    if (spendGems(cost)) {
      const results: any[] = [];
      let hadPityUsed = false;

      for (let i = 0; i < count; i++) {
        const tokenId = Math.floor(Math.random() * 9000) + 5000;
        
        // --- High-Stakes Rarity Logic ---
        const baseRoll = Math.random() * 100;
        const resonanceBonus = state.balances.luckiness / 5; // Up to +20 boost
        const luckModifiedRoll = baseRoll + resonanceBonus;
        
        // Pity check
        const isGuaranteed = state.balances.luckiness >= 100;
        
        let rarity: "Common" | "Epic" | "Legendary" = "Common";
        
        if (isGuaranteed) {
          rarity = "Legendary";
          hadPityUsed = true;
        } else if (luckModifiedRoll > 96) {
          rarity = "Legendary";
        } else if (luckModifiedRoll > 78) {
          rarity = "Epic";
        }

        const newBot = {
          id: tokenId.toString(),
          name: generateMeeBotName(tokenId.toString()),
          rarity,
          energyLevel: 0,
          stakingStart: null,
          isStaking: false,
          image: `https://picsum.photos/seed/meebot_summon_${tokenId}/1024/1024`,
          baseStats: {
            power: 45 + Math.random() * 30,
            speed: 45 + Math.random() * 30,
            intel: 45 + Math.random() * 30
          },
          components: rarity === "Legendary" 
            ? ["Crystalline Hull", "Fusion Core", "Singularity Drive", "Omni-Senses"]
            : rarity === "Epic"
            ? ["Refined Plate", "Overclocked Core", "Enhanced Senses"]
            : ["Standard Plate", "Neural Core", "Basic Senses"]
        };

        addBot(newBot);
        results.push(newBot);

        addEvent({
          type: 'Minted',
          contract: 'NFT',
          from: '0x0000000000000000000000000000000000000000',
          to: state.account,
          tokenId: tokenId.toString(),
          hash: `0x${Math.random().toString(16).slice(2, 66)}`
        });
      }

      setLastResult(results);
      
      // Update resonance logic: if pity was used, reset it. Otherwise gain resonance.
      if (hadPityUsed) {
        updateLuckiness(0, true);
        notify('prophecy', 'The Resonance Matrix has been consumed for a Legendary manifestation.');
      } else {
        updateLuckiness(count * 6); // Faster resonance gain than before
      }
      
      triggerSuccessRitual();
      triggerMintRitual();
      notify('success', `Manifestation successful: ${results.length} Spirit(s) anchored.`);
    }

    setIsSummoning(false);
    setGlobalLoading('general', false);
  };

  const handleResonanceBoost = async () => {
    if (state.balances.gems < 5) return notify('error', 'Insufficient Gems for resonance calibration.');
    if (state.balances.luckiness >= 100) return notify('info', 'Resonance Matrix is already at maximum capacity.');

    setGlobalLoading('general', true);
    triggerWarpRitual();
    
    await new Promise(r => setTimeout(r, 1000));
    
    if (spendGems(5)) {
      updateLuckiness(15);
      notify('success', 'Neural resonance frequency calibrated. +15 Resonance gained.');
      triggerSuccessRitual();
    }
    
    setGlobalLoading('general', false);
  };

  const potentialRewards = [
    { name: 'Radiant Edge', icon: '⚔️', color: 'bg-amber-500/20 border-amber-500/50' },
    { name: 'Mjolnir Core', icon: '🔨', color: 'bg-sky-500/20 border-sky-500/50' },
    { name: 'Battle Axe', icon: '🪓', color: 'bg-emerald-500/20 border-emerald-500/50' },
    { name: 'Solar Spear', icon: '🔱', color: 'bg-rose-500/20 border-rose-500/50' },
    { name: 'Void Shield', icon: '🛡️', color: 'bg-indigo-500/20 border-indigo-500/50' },
    { name: 'Eternal Tome', icon: '📕', color: 'bg-purple-500/20 border-purple-500/50' },
  ];

  const luckinessLevel = state.balances.luckiness;
  const isCapped = luckinessLevel >= 100;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-32 animate-in fade-in duration-1000">
      <header className="text-center space-y-4">
        <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none">
          Manifestation <span className="text-sky-400">Portal</span>
        </h1>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Resonance Frequency: {luckinessLevel}MHz</p>
      </header>

      {/* Rewards Row */}
      <div className="flex justify-center gap-4 py-4 overflow-x-auto custom-scrollbar px-4">
        {potentialRewards.map((reward, i) => (
          <div key={i} className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 ${reward.color} flex items-center justify-center text-2xl sm:text-3xl relative group`}>
             <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
             {reward.icon}
             <div className="absolute -top-1 -left-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black flex items-center justify-center text-[8px] font-black">R</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
        {/* Left Stats/Info */}
        <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6 order-2 lg:order-1 font-mono">
           <h3 className="text-[10px] font-black uppercase text-sky-500 tracking-widest border-b border-white/5 pb-4 flex items-center gap-2">
             <span className="text-lg">📡</span> Telemetry Data
           </h3>
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <span className="text-[9px] font-bold text-slate-500 uppercase">Resonance Impact</span>
                 <span className="text-[10px] font-black text-white">+{Math.floor(luckinessLevel/5)}% Tier Shift</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[9px] font-bold text-slate-500 uppercase">Pity Threshold</span>
                 <span className="text-[10px] font-black text-white">{luckinessLevel}/100</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                 <span className="text-[9px] font-bold text-slate-500 uppercase">Guaranteed Logic</span>
                 <span className={`text-[10px] font-black uppercase tracking-widest ${isCapped ? 'text-amber-500 animate-pulse' : 'text-slate-700'}`}>
                    {isCapped ? 'ACTIVE' : 'IDLE'}
                 </span>
              </div>
           </div>

           <div className="pt-6">
              <button 
                onClick={handleResonanceBoost}
                disabled={isSummoning || isCapped}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/5 py-4 rounded-xl flex flex-col items-center gap-1 transition-all active:scale-95 group disabled:opacity-30"
              >
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-sky-400 transition-colors">Resonance Boost Ritual</span>
                 <span className="text-[11px] font-black text-white italic">Spend 5 💎 for +15 Resonance</span>
              </button>
           </div>
        </div>

        {/* Center Portal */}
        <div className="relative flex flex-col items-center order-1 lg:order-2">
          <div className="relative w-72 h-72 sm:w-96 sm:h-96">
            <div className={`absolute inset-0 border-4 ${isCapped ? 'border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.2)]' : 'border-sky-500/20'} rounded-full animate-[spin_20s_linear_infinite]`}></div>
            <div className={`absolute inset-8 border-2 ${isCapped ? 'border-rose-500/30' : 'border-amber-500/20'} rounded-full animate-[spin_10s_linear_infinite_reverse]`}></div>
            
            <div className={`absolute inset-12 rounded-full shadow-[0_0_100px_rgba(56,189,248,0.3)] flex items-center justify-center overflow-hidden transition-all duration-1000 ${isSummoning ? 'scale-125' : 'scale-100'}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${isCapped ? 'from-amber-400/50 via-rose-600/50' : 'from-sky-400/40 via-indigo-600/40'} to-transparent animate-pulse`}></div>
              <div className="relative z-10 text-8xl drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                {isSummoning ? '⚡' : isCapped ? '🔥' : '🌌'}
              </div>
            </div>
          </div>

          <div className="mt-12 w-full max-w-md space-y-4 px-6">
            <div className="bg-black/40 border border-white/5 px-6 py-2 rounded-full flex justify-between items-center text-[10px] font-black uppercase tracking-widest font-mono">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isCapped ? 'bg-amber-500 animate-ping' : 'bg-sky-500'}`}></div>
                <span>Matrix Synergy: {luckinessLevel}%</span>
              </div>
              <span className={isCapped ? 'text-amber-500 animate-pulse' : 'text-slate-500'}>🔮</span>
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
              <div 
                className={`h-full transition-all duration-1000 shadow-[0_0_20px_rgba(245,158,11,0.5)] ${
                  isCapped ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 animate-pulse' : 'bg-gradient-to-r from-sky-500 via-amber-500 to-sky-500'
                }`}
                style={{ width: `${Math.min(luckinessLevel, 100)}%` }}
              ></div>
            </div>
            <p className="text-center text-[9px] font-black text-slate-500 uppercase tracking-widest italic animate-pulse font-mono">
              {isCapped ? 'TRANSCENDENT SIGNAL DETECTED — LEGENDARY GUARANTEED' : `Resonance Calibration: ${100 - luckinessLevel}% to Matrix Peak`}
            </p>
          </div>
        </div>

        {/* Right Summon Panel */}
        <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6 order-3 flex flex-col">
           <div className="flex-grow space-y-4">
              <button 
                onClick={() => handleSummon(1)}
                disabled={isSummoning}
                className="relative group w-full h-24 overflow-hidden rounded-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-indigo-700 transition-transform group-hover:scale-105 active:scale-95 shadow-2xl"></div>
                <div className="relative z-10 flex flex-col items-center justify-center text-white h-full font-mono">
                  <span className="text-xl font-black tracking-tighter italic">SINGLE SUMMON</span>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-lg">💎</span>
                     <span className="text-sm font-black text-amber-400">1 GEM</span>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => handleSummon(10)}
                disabled={isSummoning}
                className="relative group w-full h-24 overflow-hidden rounded-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 transition-transform group-hover:scale-105 active:scale-95 shadow-2xl"></div>
                <div className="relative z-10 flex flex-col items-center justify-center text-black h-full font-mono">
                  <span className="text-xl font-black tracking-tighter italic">TEN SUMMONS</span>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-lg">💎</span>
                     <span className="text-sm font-black">10 GEMS</span>
                  </div>
                </div>
              </button>
           </div>

           <div className="glass px-6 py-4 rounded-xl flex justify-between items-center border border-white/5 font-mono">
               <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-black text-slate-500 uppercase">Vessel Gems</span>
                  <span className="text-xl font-black text-white">{state.balances.gems}</span>
               </div>
               <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-xl">💎</div>
           </div>
        </div>
      </div>

      {/* Results Section */}
      {lastResult.length > 0 && !isSummoning && (
        <div className="glass p-10 rounded-[3rem] border-white/5 animate-in zoom-in-95 duration-700 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"></div>
           <h3 className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 italic">Neural Manifestation Results</h3>
           <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-6">
              {lastResult.map((bot, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3 group">
                   <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 overflow-hidden transition-all duration-500 group-hover:scale-110 shadow-xl ${
                     bot.rarity === 'Legendary' ? 'border-amber-500 shadow-amber-500/40 bg-amber-500/10' :
                     bot.rarity === 'Epic' ? 'border-purple-500 shadow-purple-500/40 bg-purple-500/10' : 'border-white/10 bg-black/40'
                   }`}>
                      <img src={bot.image} alt={bot.name} className="w-full h-full object-cover" />
                      {bot.rarity === 'Legendary' && (
                        <div className="absolute inset-0 bg-amber-500/10 animate-pulse"></div>
                      )}
                   </div>
                   <div className="flex flex-col items-center">
                     <span className="text-[8px] font-black text-white uppercase truncate w-24 text-center">{bot.name}</span>
                     <span className={`text-[7px] font-black uppercase tracking-widest ${
                       bot.rarity === 'Legendary' ? 'text-amber-500' :
                       bot.rarity === 'Epic' ? 'text-purple-400' : 'text-slate-600'
                     }`}>{bot.rarity}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default SummonPage;
