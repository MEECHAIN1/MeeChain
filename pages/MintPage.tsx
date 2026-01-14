import React, { useState } from 'react';
import { useApp } from '../context/AppState';
import { triggerMintRitual } from '../lib/rituals';
import { generateMeeBotName, getMeeBotRarity } from '../lib/meeBotNames';
import { logger } from '../lib/logger';
import { SparklesIcon, FireIcon } from '@heroicons/react/24/outline';

const MintPage: React.FC = () => {
  const { state, addBot, notify, updateLuckiness, setGlobalLoading } = useApp();
  const [isMinting, setIsMinting] = useState(false);

  const handleSummon = async () => {
    if (isMinting) return;
    
    setIsMinting(true);
    setGlobalLoading('claiming', true);
    
    // 1. เริ่มพิธีกรรม (Logging)
    logger.ritual('MEEBOT_SUMMONING', true, { 
      currentLuck: state.balances.luckiness,
      cost: 'FREE_TRIAL'
    });

    try {
      // จำลองการรอ Transaction บน MeeChain
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 2. สุ่ม ID ใหม่
      const newId = (Math.floor(Math.random() * 9000) + 1000).toString();
      const botName = generateMeeBotName(newId);
      const rarityInfo = getMeeBotRarity(botName);

      // 3. สร้าง Object บอทใหม่
      const newBot = {
        id: newId,
        name: botName,
        rarity: rarityInfo.label,
        energyLevel: 100,
        stakingStart: null,
        isStaking: false,
        image: `https://picsum.photos/seed/meebot_${newId}/1024/1024`,
        baseStats: {
          power: 50 + (rarityInfo.label === 'LEGENDARY' ? 30 : 0),
          speed: 50,
          intel: 50
        },
        components: ["Neural Core", "Aether Drive"]
      };

      // 4. ผลลัพธ์สำเร็จ
      addBot(newBot);
      triggerMintRitual(); // พลุแตก!
      updateLuckiness(0, true); // รีเซ็ตค่า Luck หลังใช้งาน
      
      notify('success', `Manifested: ${botName} (${rarityInfo.label})`);
      
    } catch (error) {
      logger.error('Summoning Disrupted', error);
      notify('error', 'Ritual Interrupted by Void Interference');
    } finally {
      setIsMinting(false);
      setGlobalLoading('claiming', false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black text-white tracking-tighter italic">
          SUMMON <span className="text-amber-500">MEEBOT</span>
        </h1>
        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">
          Connect to MeeChain Neural Link to manifest your asset
        </p>
      </div>

      {/* Ritual Chamber (Summoning Area) */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-fuchsia-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        
        <div className="relative glass p-12 rounded-2xl border border-white/10 flex flex-col items-center">
          {/* Luck Meter */}
          <div className="w-full max-w-xs mb-10 space-y-2">
            <div className="flex justify-between text-[10px] font-black text-amber-500 uppercase tracking-tighter">
              <span>Ritual Luckiness</span>
              <span>{state.balances.luckiness}%</span>
            </div>
            <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-1000"
                style={{ width: `${state.balances.luckiness}%` }}
              ></div>
            </div>
          </div>

          {/* Summon Button */}
          <button
            onClick={handleSummon}
            disabled={isMinting}
            className={`
              relative w-48 h-48 rounded-full border-4 flex flex-center transition-all duration-500
              ${isMinting 
                ? 'border-amber-500 animate-pulse scale-90 shadow-[0_0_50px_rgba(245,158,11,0.5)]' 
                : 'border-white/20 hover:border-amber-500 hover:scale-110 active:scale-95 cursor-pointer'}
            `}
          >
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
              {isMinting ? (
                <SparklesIcon className="w-12 h-12 text-amber-500 animate-spin" />
              ) : (
                <FireIcon className="w-12 h-12 text-slate-500 group-hover:text-amber-500 transition-colors" />
              )}
              <span className="font-black text-sm uppercase leading-none">
                {isMinting ? 'Manifesting...' : 'Start Ritual'}
              </span>
            </div>
          </button>

          <p className="mt-10 text-[10px] text-slate-500 font-mono text-center max-w-xs">
            CAUTION: Manifesting requires high neural focus. Ritual success is deterministic based on Chain ID 13390.
          </p>
        </div>
      </div>

      {/* Hint/Help */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-xl bg-white/5 border border-white/5">
          <h4 className="text-amber-500 font-bold text-xs uppercase mb-2">Neural Luck</h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            Your luck increases with every successful interaction in the ecosystem. 
            High luck significantly boosts Legendary manifestation rates.
          </p>
        </div>
        <div className="p-6 rounded-xl bg-white/5 border border-white/5">
          <h4 className="text-indigo-400 font-bold text-xs uppercase mb-2">Protocol Fee</h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            Summoning on MeeChain is gas-optimized. Ensure you have at least 0.01 MCB for the ritual gas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MintPage;