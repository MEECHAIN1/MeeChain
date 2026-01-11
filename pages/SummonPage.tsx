
import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '../context/AppState';
import { triggerSuccessRitual, triggerCelestialRitual, triggerMintRitual, triggerWarpRitual } from '../lib/rituals';
import { generateMeeBotName } from '../lib/meeBotNames';
import { GoogleGenAI } from "@google/genai";
import { useWriteContract } from 'wagmi';
import { ADRS, ABIS } from '../lib/contracts';
import { logger } from '../lib/logger';

const SummonPage: React.FC = () => {
  const { state, notify, addBot, updateLuckiness, spendGems, addEvent, setGlobalLoading } = useApp();
  
  // Ritual States
  const [mode, setMode] = useState<'generate' | 'upload'>('generate');
  const [prompt, setPrompt] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Smart Contract Integration
  const { writeContractAsync } = useWriteContract();

  /**
   * Applies the "MEECHAIN SPIRIT" watermark to the manifest.
   */
  const applyWatermark = (base64Image: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return resolve(base64Image);
        
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(base64Image);

        // Draw original
        ctx.drawImage(img, 0, 0, 1024, 1024);

        // Overlay Gradient
        const gradient = ctx.createLinearGradient(0, 800, 0, 1024);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 800, 1024, 224);

        // Watermark Text
        ctx.font = "900 48px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.textAlign = "center";
        ctx.letterSpacing = "10px";
        ctx.fillText("MEECHAIN SPIRIT", 512, 940);
        
        ctx.font = "700 20px 'Inter', sans-serif";
        ctx.fillStyle = "rgba(245, 158, 11, 0.5)";
        ctx.fillText(`AUTHENTICATED MANIFEST: ${Math.random().toString(16).slice(2, 10).toUpperCase()}`, 512, 975);

        resolve(canvas.toDataURL('image/png'));
      };
      img.src = base64Image;
    });
  };

  /**
   * Handle local blueprint upload.
   * Fix: Added missing implementation for handleFileUpload.
   */
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        const watermarked = await applyWatermark(base64);
        setPreviewImage(watermarked);
        notify('success', 'Blueprint uplinked and calibrated.');
      }
    };
    reader.readAsDataURL(file);
  }, [notify]);

  const generateAIImage = async () => {
    if (!prompt.trim()) return notify('error', 'Please define the spirit prompt.');
    
    setIsProcessing(true);
    setGlobalLoading('general', true);
    triggerWarpRitual();
    
    logger.ritual('SUMMON_MANIFEST_START', true, { prompt, resonance: state.balances.luckiness });
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Optimized prompt for high-end meebot aesthetic
      const enhancedPrompt = `A high-quality 3D chibi-style meebot robot, white metallic shell, glowing parts, ${prompt}, floating in a dreamy cosmic nebula, volumetric lighting, Octane render, 8k resolution, masterpiece.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: enhancedPrompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      let rawBase64 = "";
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            rawBase64 = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (rawBase64) {
        const watermarked = await applyWatermark(rawBase64);
        setPreviewImage(watermarked);
        notify('success', 'Spirit manifestation preview generated.');
        logger.ritual('SUMMON_MANIFEST_SUCCESS', true);
      }
    } catch (err: any) {
      logger.error('AI Generation Ritual Failed', err);
      notify('error', 'Neural Link unstable. Could not manifest image.');
    } finally {
      setIsProcessing(false);
      setGlobalLoading('general', false);
    }
  };

  const beginRitual = async () => {
    if (!previewImage) return notify('error', 'Manifestation source missing.');
    if (!state.account) return notify('error', 'Neural Link not established.');
    
    setIsProcessing(true);
    setGlobalLoading('general', true);
    triggerCelestialRitual();

    try {
      // Step 1: Resource Consumption
      if (!spendGems(1)) {
        throw new Error("Insufficient Gems in Vessel");
      }

      logger.ritual('SUMMON_ANCHOR_START', true, { wallet: state.account });

      // Step 2: Blockchain Interaction
      const tx = await writeContractAsync({
        address: ADRS.nft,
        abi: ABIS.nft as any,
        functionName: 'mintMeeBot',
        args: [prompt || "Manual Upload", previewImage],
      } as any);

      // Step 3: Resonance (Gacha) Logic
      const luck = state.balances.luckiness;
      const roll = Math.random() * 100 + (luck / 4);
      const isGuaranteed = luck >= 100;
      
      let rarity: "Common" | "Epic" | "Legendary" = "Common";
      if (isGuaranteed || roll > 95) rarity = "Legendary";
      else if (roll > 75) rarity = "Epic";

      const tokenId = Math.floor(Math.random() * 9000) + 1000;
      const newBot = {
        id: tokenId.toString(),
        name: generateMeeBotName(tokenId.toString()),
        rarity,
        energyLevel: 0,
        stakingStart: null,
        isStaking: false,
        image: previewImage,
        baseStats: {
          power: rarity === 'Legendary' ? 80 + Math.random() * 20 : 40 + Math.random() * 30,
          speed: rarity === 'Legendary' ? 80 + Math.random() * 20 : 40 + Math.random() * 30,
          intel: rarity === 'Legendary' ? 80 + Math.random() * 20 : 40 + Math.random() * 30
        },
        components: rarity === 'Legendary' ? ["Singularity Core", "Celestial Plate", "Omni-Senses"] : ["Standard Core"]
      };

      // Step 4: Finalize State
      addBot(newBot);
      addEvent({
        type: 'Minted',
        contract: 'NFT',
        from: '0x0000000000000000000000000000000000000000',
        to: state.account,
        tokenId: tokenId.toString(),
        hash: tx
      });

      // Update Pity
      if (rarity === 'Legendary') updateLuckiness(0, true);
      else updateLuckiness(12);

      triggerSuccessRitual();
      triggerMintRitual();
      notify('success', `Summoned ${rarity} ${newBot.name}!`);
      logger.ritual('SUMMON_ANCHOR_SUCCESS', true, { tokenId: newBot.id, rarity, tx });
      
      // Reset Page State
      setPreviewImage(null);
      setPrompt('');
      
    } catch (err: any) {
      logger.error('Summoning Ritual Failed', err);
      notify('error', err.message || 'Ritual disrupted by quantum turbulence.');
    } finally {
      setIsProcessing(false);
      setGlobalLoading('general', false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-32">
      <canvas ref={canvasRef} className="hidden" />
      
      <header className="text-center space-y-4">
        <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-none">
          Summoning <span className="text-sky-400">Ritual</span>
        </h1>
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] font-mono">
            Neural Resonance: {state.balances.luckiness}%
          </p>
          <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div 
              className={`h-full transition-all duration-1000 ${state.balances.luckiness >= 100 ? 'bg-amber-500 animate-pulse' : 'bg-sky-500'}`} 
              style={{ width: `${Math.min(state.balances.luckiness, 100)}%` }}
            />
          </div>
          {state.balances.luckiness >= 100 && (
            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest animate-bounce mt-1">
              Legendary Pity Triggered
            </span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Input Panel */}
        <div className="glass p-10 rounded-[3.5rem] border-white/5 space-y-8 relative overflow-hidden bg-black/40 shadow-2xl">
          <div className="flex bg-black/60 p-1.5 rounded-2xl border border-white/5">
            <button 
              onClick={() => setMode('generate')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'generate' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Manifest AI
            </button>
            <button 
              onClick={() => setMode('upload')}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'upload' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Uplink Blueprint
            </button>
          </div>

          <div className="space-y-6">
            {mode === 'generate' ? (
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Manifestation Prompt</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the machine spirit..."
                  className="w-full h-40 bg-black/40 border-2 border-white/5 rounded-3xl p-6 text-white focus:outline-none focus:border-sky-500/30 transition-all font-mono italic text-sm"
                  disabled={isProcessing}
                />
                <button 
                  onClick={generateAIImage}
                  disabled={isProcessing || !prompt.trim()}
                  className="w-full py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3"
                >
                  {isProcessing && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  MANIFEST PREVIEW
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Local Blueprint Uplink</label>
                <div className="h-40 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 group hover:border-sky-500/30 transition-all relative">
                  <input 
                    type="file" 
                    onChange={handleFileUpload} 
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <span className="text-4xl group-hover:scale-110 transition-transform">📂</span>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Select Image File</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Portal Section */}
        <div className="flex flex-col gap-8">
          <div className="glass aspect-square rounded-[4rem] border-white/5 overflow-hidden flex items-center justify-center relative bg-black/60 group shadow-[0_0_100px_rgba(0,0,0,0.5)]">
            {previewImage ? (
              <img src={previewImage} alt="Ritual Preview" className="w-full h-full object-cover animate-in zoom-in-95 duration-700" />
            ) : (
              <div className="text-center space-y-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <div className="w-24 h-24 mx-auto border-4 border-dashed border-white/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Awaiting Calibration...</p>
              </div>
            )}
            
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-10">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_40px_rgba(14,165,233,0.5)]"></div>
                  <p className="text-[9px] font-black text-sky-400 uppercase tracking-widest animate-pulse">Syncing Neural Core...</p>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={beginRitual}
            disabled={!previewImage || isProcessing || !state.account}
            className="h-24 bg-sky-500 hover:bg-sky-400 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.6em] transition-all disabled:opacity-20 flex items-center justify-center gap-6 shadow-[0_20px_60px_rgba(14,165,233,0.3)] group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
            <span className="group-hover:scale-125 transition-transform">🌀</span>
            {isProcessing ? 'CALIBRATING...' : 'BEGIN SUMMONING'}
            <span className="bg-black/20 px-4 py-2 rounded-xl text-[8px] tracking-widest">1 💎</span>
          </button>
        </div>
      </div>

      {/* Rarity Legend */}
      <footer className="glass p-8 rounded-[3rem] border-white/5 flex flex-wrap justify-center gap-12 text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
          <span>Common (78%)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
          <span>Epic (18%)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
          <span className="text-amber-500">Legendary (4%)</span>
        </div>
      </footer>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default SummonPage;
