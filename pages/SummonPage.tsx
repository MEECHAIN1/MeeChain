
import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '../context/AppState';
import { triggerSuccessRitual, triggerCelestialRitual, triggerMintRitual, triggerWarpRitual } from '../lib/rituals';
import { generateMeeBotName } from '../lib/meeBotNames';
import { GoogleGenAI } from "@google/genai";
import { useWriteContract } from 'wagmi';
import { ADRS, ABIS } from '../lib/contracts';
import { logger } from '../lib/logger';
import { executeRitual } from '../lib/services/ritual';

const SummonPage: React.FC = () => {
  const { state, notify, addBot, updateLuckiness, spendGems, addEvent, setGlobalLoading, refreshBalances } = useApp();
  const [mode, setMode] = useState<'generate' | 'upload'>('generate');
  const [prompt, setPrompt] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { writeContractAsync } = useWriteContract();

  const applyWatermark = (base64Image: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return resolve(base64Image);
        canvas.width = 1024; canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(base64Image);
        ctx.drawImage(img, 0, 0, 1024, 1024);
        ctx.font = "900 48px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.textAlign = "center";
        ctx.fillText("MEECHAIN SPIRIT", 512, 950);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = base64Image;
    });
  };

  const generateAIImage = async () => {
    if (!prompt.trim()) return notify('error', 'Spirit code required.');
    
    await executeRitual(
      'AI_GENERATION',
      async () => {
        triggerWarpRitual();
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const styledPrompt = `A 3D chibi robot, ${prompt}, techtopia style, high-end 8k render.`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: styledPrompt }] },
          config: { imageConfig: { aspectRatio: "1:1" } }
        });
        const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        if (part?.inlineData) {
          const watermarked = await applyWatermark(`data:image/png;base64,${part.inlineData.data}`);
          setPreviewImage(watermarked);
          return watermarked;
        }
        throw new Error("Void returned no data.");
      },
      {
        setLoading: setGlobalLoading,
        loadingKey: 'general',
        notify,
        successMessage: 'Machine Spirit has taken form.'
      }
    );
  };

  const beginRitual = async () => {
    if (!previewImage) return;
    
    await executeRitual(
      'MINT',
      async () => {
        if (state.balances.gems < 1) throw new Error("Insufficient Gems.");
        triggerCelestialRitual();
        
        const tx = await writeContractAsync({
          address: ADRS.nft,
          abi: ABIS.nft as any,
          functionName: 'mintMeeBot',
          args: [prompt || "Uplink", previewImage],
        } as any);

        const rarity = Math.random() > 0.9 ? "Legendary" : "Common";
        const id = Math.floor(Math.random() * 9000).toString();
        const newBot = {
          id, name: generateMeeBotName(id), rarity, image: previewImage,
          energyLevel: 0, stakingStart: null, isStaking: false,
          baseStats: { power: 50, speed: 50, intel: 50 }, components: ["Universal Chassis"]
        };

        spendGems(1);
        addBot(newBot);
        addEvent({ type: 'Minted', contract: 'NFT', from: state.account!, tokenId: id, hash: tx });
        updateLuckiness(rarity === 'Legendary' ? 0 : 10, rarity === 'Legendary');
        triggerMintRitual();
        setPreviewImage(null);
        setPrompt('');
        return tx;
      },
      {
        setLoading: setGlobalLoading,
        loadingKey: 'general',
        notify,
        refreshBalances,
        successMessage: 'Spirit anchored to substrate.'
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-1000 pb-32">
      <canvas ref={canvasRef} className="hidden" />
      <header className="text-center space-y-8">
        <h1 className="text-6xl font-black uppercase italic text-white">Summoning <span className="text-sky-500">Chamber</span></h1>
        <div className="flex flex-col items-center gap-4">
          <div className="w-80 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-sky-500" style={{ width: `${state.balances.luckiness}%` }} />
          </div>
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Resonance: {state.balances.luckiness}%</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="glass p-12 rounded-[4rem] space-y-10">
          <div className="flex bg-black/60 p-2 rounded-3xl">
            <button onClick={() => setMode('generate')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase ${mode === 'generate' ? 'bg-sky-500 text-white' : 'text-slate-500'}`}>Spirit</button>
            <button onClick={() => setMode('upload')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase ${mode === 'upload' ? 'bg-sky-500 text-white' : 'text-slate-500'}`}>Uplink</button>
          </div>
          <textarea 
            value={prompt} onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the spirit's essence..."
            className="w-full h-56 bg-black/40 border-2 border-white/5 rounded-[3rem] p-8 text-white focus:outline-none"
          />
          <button onClick={generateAIImage} className="w-full py-6 bg-white/5 border border-white/10 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10">Manifest Preview</button>
        </div>

        <div className="flex flex-col gap-10">
          <div className="glass aspect-square rounded-[5rem] overflow-hidden flex items-center justify-center relative bg-black/40">
            {previewImage ? <img src={previewImage} className="w-full h-full object-cover" /> : <span className="text-slate-700 text-8xl">🌀</span>}
          </div>
          <button onClick={beginRitual} disabled={!previewImage} className="h-28 bg-sky-600 hover:bg-sky-500 text-white rounded-[3rem] font-black text-xs uppercase tracking-[0.5em] disabled:opacity-20 flex items-center justify-center gap-6">
            Begin Summoning 💎
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummonPage;
