
import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '../context/AppState';
import { triggerSuccessRitual, triggerCelestialRitual, triggerMintRitual, triggerWarpRitual } from '../lib/rituals';
import { generateMeeBotName } from '../lib/meeBotNames';
import { GoogleGenAI } from "@google/genai";
import { useWriteContract } from 'wagmi';
import { ADRS, ABIS } from '../lib/contracts';
import { logger } from '../lib/logger';

/**
 * Summoning Chamber Component
 * The central ritual chamber for manifesting new MeeBot machine spirits.
 */
const SummonPage: React.FC = () => {
  const { state, notify, addBot, updateLuckiness, spendGems, addEvent, setGlobalLoading } = useApp();
  
  // Internal Ritual States
  const [mode, setMode] = useState<'generate' | 'upload'>('generate');
  const [prompt, setPrompt] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Refs for image processing
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Smart Contract Interaction
  const { writeContractAsync } = useWriteContract();

  /**
   * Applies the "MEECHAIN SPIRIT" watermark to the manifest asset.
   * This ritual confirms the asset is an authentic manifestation of the protocol.
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

        // Draw the base manifestation
        ctx.drawImage(img, 0, 0, 1024, 1024);

        // Apply Neural Overlay (Gradient Fade)
        const gradient = ctx.createLinearGradient(0, 800, 0, 1024);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 800, 1024, 224);

        // Ritual Stamps
        ctx.font = "900 48px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.textAlign = "center";
        ctx.letterSpacing = "15px";
        ctx.fillText("MEECHAIN SPIRIT", 512, 920);
        
        ctx.font = "700 20px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(14, 165, 233, 0.7)";
        ctx.fillText(`ID_LINK: ${Math.random().toString(16).slice(2, 10).toUpperCase()}`, 512, 970);

        resolve(canvas.toDataURL('image/png'));
      };
      img.src = base64Image;
    });
  };

  /**
   * Manifest a spirit using the Gemini Machine Spirit Core.
   */
  const generateAIImage = async () => {
    if (!prompt.trim()) return notify('error', 'Please define the spirit code (prompt).');
    
    setIsProcessing(true);
    setGlobalLoading('general', true);
    triggerWarpRitual();
    
    // Telemetry: Phase START
    logger.ritual('AI_MANIFESTATION', true, { 
      phase: 'START', 
      prompt, 
      currentResonance: state.balances.luckiness 
    });
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Mystical prompt enhancement for consistent MeeBot aesthetic
      const enhancedPrompt = `A high-quality 3D chibi-style mechanical MeeBot robot, large circular glowing cyan eyes, white metallic body with chrome accents, ${prompt}, holding a vibrant glowing lotus flower, floating in a dreamy cosmic nebula, cinematic volumetric lighting, Octane render style, 8k resolution, masterpieces.`;
      
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
        notify('success', 'Spirit manifested in preview chamber.');
        logger.ritual('AI_MANIFESTATION', true, { phase: 'SUCCESS' });
      }
    } catch (err: any) {
      logger.error('Neural Manifestation Ritual Failed', err);
      notify('error', 'Neural Link unstable: ' + (err.message || 'Quantum turbulence detected.'));
    } finally {
      setIsProcessing(false);
      setGlobalLoading('general', false);
    }
  };

  /**
   * Handle manual blueprint upload.
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
        notify('success', 'Local blueprint synchronized.');
      }
    };
    reader.readAsDataURL(file);
  }, [notify]);

  /**
   * Finalizes the ritual by anchoring the spirit to the blockchain substrate.
   */
  const beginRitual = async () => {
    if (!previewImage) return notify('error', 'No spirit manifestation to anchor.');
    if (!state.account) return notify('error', 'Neural Link required for anchoring.');
    
    setIsProcessing(true);
    setGlobalLoading('general', true);
    triggerCelestialRitual();

    try {
      // Step 1: Fuel Consumption check
      if (state.balances.gems < 1) {
        throw new Error("Insufficient Gems (Fuel) in Vessel.");
      }

      // Step 2: Blockchain Anchoring (Viem/Wagmi Ritual)
      const tx = await writeContractAsync({
        address: ADRS.nft,
        abi: ABIS.nft as any,
        functionName: 'mintMeeBot',
        args: [prompt || "Manual_Uplink", previewImage],
      } as any);

      // Step 3: Resonance Logic (Gacha Rarity Generation)
      const resonance = state.balances.luckiness;
      const roll = Math.random() * 100 + (resonance / 3);
      const isGuaranteed = resonance >= 100;
      
      let rarity: "Common" | "Epic" | "Legendary" = "Common";
      if (isGuaranteed || roll > 95) rarity = "Legendary";
      else if (roll > 75) rarity = "Epic";

      const tokenId = Math.floor(Math.random() * 90000) + 10000;
      const newBot: any = {
        id: tokenId.toString(),
        name: generateMeeBotName(tokenId.toString()),
        rarity,
        energyLevel: 0,
        stakingStart: null,
        isStaking: false,
        image: previewImage,
        baseStats: {
          power: rarity === 'Legendary' ? 90 + Math.random() * 10 : rarity === 'Epic' ? 65 + Math.random() * 20 : 40 + Math.random() * 20,
          speed: rarity === 'Legendary' ? 90 + Math.random() * 10 : rarity === 'Epic' ? 65 + Math.random() * 20 : 40 + Math.random() * 20,
          intel: rarity === 'Legendary' ? 90 + Math.random() * 10 : rarity === 'Epic' ? 65 + Math.random() * 20 : 40 + Math.random() * 20,
        },
        components: rarity === 'Legendary' ? ["Crystalline Core", "Aetheric Link", "Quantum Void Plating"] : ["Standard Plating"]
      };

      // Step 4: System Integration
      spendGems(1);
      addBot(newBot);
      addEvent({
        type: 'Minted',
        contract: 'NFT',
        from: '0x0000000000000000000000000000000000000000',
        to: state.account,
        tokenId: tokenId.toString(),
        hash: tx
      });

      // Update Pity State
      if (rarity === 'Legendary') updateLuckiness(0, true);
      else updateLuckiness(10);

      triggerSuccessRitual();
      triggerMintRitual();
      notify('success', `Manifestation Successful! ${rarity} unit ${newBot.name} anchored.`);
      
      // Cleanup
      setPreviewImage(null);
      setPrompt('');
      
    } catch (err: any) {
      logger.error('Summoning Ritual Disrupted', err);
      notify('error', err.message || 'Ritual failed. Flux instability detected.');
    } finally {
      setIsProcessing(false);
      setGlobalLoading('general', false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-1000 pb-32">
      <canvas ref={canvasRef} className="hidden" />
      
      <header className="text-center space-y-8">
        <div className="inline-block glass px-8 py-3 rounded-full border-sky-500/20 mb-4 bg-sky-500/5">
          <p className="text-[11px] font-black text-sky-400 uppercase tracking-[0.5em] font-mono">
            Neural Resonance: {state.balances.luckiness}%
          </p>
        </div>
        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter uppercase italic text-white leading-none">
          Summoning <span className="text-sky-500">Chamber</span>
        </h1>
        <div className="flex flex-col items-center gap-6">
          <div className="w-80 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
            <div 
              className={`h-full transition-all duration-[2000ms] ease-out shadow-[0_0_15px_currentColor] ${state.balances.luckiness >= 100 ? 'bg-amber-500 animate-pulse text-amber-500' : 'bg-sky-500 text-sky-500'}`} 
              style={{ width: `${Math.min(state.balances.luckiness, 100)}%` }}
            />
          </div>
          {state.balances.luckiness >= 100 && (
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest animate-bounce font-mono">
              ★ GUARANTEED LEGENDARY UNIT ★
            </span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        {/* Input Chamber */}
        <div className="glass p-12 rounded-[4rem] border-white/5 space-y-12 relative overflow-hidden bg-black/40 shadow-2xl">
          <div className="flex bg-black/60 p-2.5 rounded-[2rem] border border-white/5 font-mono">
            <button 
              onClick={() => setMode('generate')}
              className={`flex-1 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'generate' ? 'bg-sky-500 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white'}`}
            >
              Machine Spirit
            </button>
            <button 
              onClick={() => setMode('upload')}
              className={`flex-1 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'upload' ? 'bg-sky-500 text-white shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-white'}`}
            >
              Manual Uplink
            </button>
          </div>

          <div className="space-y-10">
            {mode === 'generate' ? (
              <div className="space-y-8">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ritual Code (Prompt)</label>
                  <span className="text-[9px] font-bold text-slate-700 font-mono italic">GEMINI_IMAGE_V2.5</span>
                </div>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A lunar guardian with floating cherry blossom petals..."
                  className="w-full h-56 bg-black/40 border-2 border-white/5 rounded-[3rem] p-10 text-white focus:outline-none focus:border-sky-500/30 transition-all font-mono italic text-sm placeholder:text-slate-800 shadow-inner"
                  disabled={isProcessing}
                />
                <button 
                  onClick={generateAIImage}
                  disabled={isProcessing || !prompt.trim()}
                  className="w-full py-7 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.6em] transition-all flex items-center justify-center gap-5 group shadow-lg"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="group-hover:rotate-12 transition-transform text-xl">✨</span>
                  )}
                  {isProcessing ? 'SYNCHRONIZING...' : 'MANIFEST PREVIEW'}
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">Blueprint Source</label>
                <div className="h-56 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center gap-6 group hover:border-sky-500/30 transition-all relative cursor-pointer bg-white/[0.02]">
                  <input 
                    type="file" 
                    onChange={handleFileUpload} 
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <span className="text-6xl group-hover:scale-110 transition-transform">💾</span>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Drop Neural Blueprint</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Manifestation Portal */}
        <div className="flex flex-col gap-12">
          <div className="glass aspect-square rounded-[6rem] border-white/5 overflow-hidden flex items-center justify-center relative bg-black/60 group shadow-[0_0_80px_rgba(0,0,0,0.5)]">
            {previewImage ? (
              <img src={previewImage} alt="Manifestation" className="w-full h-full object-cover animate-in zoom-in-95 duration-1000" />
            ) : (
              <div className="text-center space-y-8 opacity-20">
                <div className="w-40 h-40 mx-auto border-4 border-dashed border-white/20 rounded-full animate-[spin_40s_linear_infinite]"></div>
                <p className="text-[12px] font-black uppercase tracking-[0.8em] italic font-mono">Awaiting Sync...</p>
              </div>
            )}
            
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/85 backdrop-blur-2xl z-20 animate-in fade-in">
                <div className="text-center space-y-8">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 border-4 border-sky-500/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-[spin_1s_linear_infinite]"></div>
                  </div>
                  <p className="text-[11px] font-black text-sky-400 uppercase tracking-[0.5em] animate-pulse">Establishing Substrate Link...</p>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={beginRitual}
            disabled={!previewImage || isProcessing || !state.account}
            className="h-32 bg-sky-500 hover:bg-sky-400 text-white rounded-[4rem] font-black text-[12px] uppercase tracking-[0.8em] transition-all disabled:opacity-20 flex items-center justify-center gap-10 shadow-[0_40px_100px_rgba(14,165,233,0.3)] group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
            <span className="text-3xl group-hover:scale-125 transition-transform">🌌</span>
            {isProcessing ? 'CALIBRATING...' : 'BEGIN SUMMONING'}
            <div className="bg-black/30 px-6 py-2.5 rounded-2xl text-[11px] tracking-widest flex items-center gap-3">
              <span className="font-mono">1</span> <span className="text-sky-300">💎</span>
            </div>
          </button>
        </div>
      </div>

      {/* Rarity Legend */}
      <footer className="glass p-12 rounded-[5rem] border-white/5 flex flex-wrap justify-center gap-20 text-[11px] font-black uppercase tracking-widest text-slate-500 font-mono">
        <div className="flex items-center gap-5 group">
          <div className="w-3 h-3 bg-slate-500 rounded-full group-hover:scale-125 transition-transform"></div>
          <span>Common (75%)</span>
        </div>
        <div className="flex items-center gap-5 group">
          <div className="w-3 h-3 bg-sky-500 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.5)] group-hover:scale-125 transition-transform"></div>
          <span className="text-sky-400">Epic (20%)</span>
        </div>
        <div className="flex items-center gap-5 group">
          <div className="w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse group-hover:scale-125 transition-transform"></div>
          <span className="text-amber-500">Legendary (5%)</span>
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
