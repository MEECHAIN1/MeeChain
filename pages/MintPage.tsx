
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppState';
import { GoogleGenAI } from "@google/genai";
import { triggerMintRitual, triggerSuccessRitual, triggerWarpRitual } from '../lib/rituals';
import { generateMeeBotName } from '../lib/meeBotNames';
import { useWriteContract } from 'wagmi';
import { ADRS, ABIS } from '../lib/contracts';
import { logger } from '../lib/logger';

/**
 * Spirit Manifestor Page
 * The primary interface for creating new MeeBot entities using AI imagery.
 */
const MintPage: React.FC = () => {
  const { state, notify, addEvent, setGlobalLoading, addBot } = useApp();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Wagmi contract write hook
  const { writeContractAsync } = useWriteContract();

  /**
   * Applies the official protocol watermark and neural gradient.
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

        // Draw manifestation
        ctx.drawImage(img, 0, 0, 1024, 1024);

        // Apply Neural Fade
        const gradient = ctx.createLinearGradient(0, 850, 0, 1024);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(5, 8, 15, 0.95)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 850, 1024, 174);

        // Sigil Stamping
        ctx.font = "900 48px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.textAlign = "center";
        ctx.letterSpacing = "20px";
        ctx.fillText("MEECHAIN SPIRIT", 512, 940);
        
        ctx.font = "700 16px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(244, 63, 94, 0.6)";
        ctx.fillText("PROTOCOL_VER_4.1_SECURED", 512, 980);

        resolve(canvas.toDataURL('image/png'));
      };
      img.src = base64Image;
    });
  };

  /**
   * Generates a new spirit blueprint using the Gemini AI Core.
   */
  const generateMeeBot = async () => {
    if (!prompt.trim()) return notify('error', 'Please define the spirit characteristics.');
    
    setIsGenerating(true);
    setGlobalLoading('general', true);
    triggerWarpRitual();
    
    logger.ritual('AI_MANIFESTATION', true, { prompt });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Aesthetic constraint prompt
      const enhancedPrompt = `A high-quality 3D chibi-style mechanical MeeBot robot, large circular glowing cyan blue eyes, white sleek metallic body, ${prompt}, holding a vibrant glowing lotus flower, standing in a dreamy cosmic nebula with floating planets, Octane render, cinematic lighting, 8k masterpiece.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: enhancedPrompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      let rawImage = "";
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            rawImage = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (rawImage) {
        const finishedAsset = await applyWatermark(rawImage);
        setGeneratedImage(finishedAsset);
        notify('success', 'Spirit manifested in the preview rig.');
      } else {
        throw new Error("Neural output empty.");
      }
    } catch (err: any) {
      logger.error("Manifestation Error", err);
      notify('error', `Neural Link unstable: ${err.message || 'Quantum turbulence'}.`);
    } finally {
      setIsGenerating(false);
      setGlobalLoading('general', false);
    }
  };

  /**
   * Finalizes the anchoring of the spirit to the blockchain substrate.
   */
  const handleMint = async () => {
    if (!state.account || !generatedImage) return notify('error', 'Neural Link required for anchoring.');
    
    setGlobalLoading('general', true);
    try {
      // Execute Blockchain Ritual
      const hash = await writeContractAsync({
        address: ADRS.nft,
        abi: ABIS.nft as any,
        functionName: 'mintMeeBot',
        args: [prompt || "AI_Summoned", generatedImage],
      } as any);

      const tokenId = Math.floor(Math.random() * 9000) + 1000;
      
      // Determine Rarity (Probabilistic Manifestation)
      const rarityRoll = Math.random();
      const rarity = rarityRoll > 0.95 ? "Legendary" : rarityRoll > 0.75 ? "Epic" : "Common";

      const newBot: any = {
        id: tokenId.toString(),
        name: generateMeeBotName(tokenId.toString()),
        rarity,
        energyLevel: 0,
        stakingStart: null,
        isStaking: false,
        image: generatedImage,
        baseStats: {
          power: rarity === 'Legendary' ? 90 + Math.random() * 10 : rarity === 'Epic' ? 65 + Math.random() * 20 : 40 + Math.random() * 20,
          speed: rarity === 'Legendary' ? 90 + Math.random() * 10 : rarity === 'Epic' ? 65 + Math.random() * 20 : 40 + Math.random() * 20,
          intel: rarity === 'Legendary' ? 90 + Math.random() * 10 : rarity === 'Epic' ? 65 + Math.random() * 20 : 40 + Math.random() * 20,
        },
        components: rarity === 'Legendary' ? ["Crystalline Chassis", "Singularity Core"] : ["Standard Plating"]
      };

      addBot(newBot);
      addEvent({
        type: 'Minted',
        contract: 'NFT',
        from: '0x0000000000000000000000000000000000000000',
        to: state.account,
        tokenId: tokenId.toString(),
        hash: hash
      });

      triggerSuccessRitual();
      triggerMintRitual();
      notify('success', `Spirit #${tokenId} (${rarity}) anchored to the protocol.`);
      setGeneratedImage(null);
      setPrompt('');
    } catch (err: any) {
      logger.error("Anchoring Error", err);
      notify('error', 'Anchoring ritual disrupted: ' + (err.message || 'Substrate rejection.'));
    } finally {
      setGlobalLoading('general', false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-32">
      <header className="text-center space-y-6">
        <div className="inline-block glass px-6 py-2 rounded-full border-rose-500/20 mb-2">
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] font-mono">Neural Interface V4.1</p>
        </div>
        <h1 className="text-6xl sm:text-8xl font-black tracking-tighter uppercase italic text-white leading-none">
          Spirit <span className="text-rose-500">Manifestor</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto font-medium">
          Command the Machine Spirit Core to visualize your mechanical destiny and anchor it permanently to the chain.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left: Manifestation Commands */}
        <div className="glass p-10 sm:p-14 rounded-[3rem] sm:rounded-[4rem] border-white/5 space-y-12 relative overflow-hidden bg-black/40 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <span className="text-9xl font-black italic">GEN</span>
          </div>

          <div className="space-y-4 relative z-10">
            <h2 className="text-[11px] font-black uppercase text-rose-500 tracking-widest flex items-center gap-4">
              <span className="w-2 h-8 bg-rose-500 rounded-full animate-pulse"></span>
              Neural Script (Prompt)
            </h2>
            <p className="text-slate-500 font-medium text-xs uppercase tracking-wider">Define the chassis and elemental affinity.</p>
          </div>

          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A crimson fire guardian with floating lava crystals..."
            className="w-full h-64 bg-black/60 border-2 border-white/5 rounded-[3rem] p-10 text-white focus:outline-none focus:border-rose-500/30 transition-all placeholder:text-slate-800 italic text-xl font-mono shadow-inner"
            disabled={isGenerating || state.loadingStates.general}
          />
          
          <button 
            onClick={generateMeeBot}
            disabled={isGenerating || !prompt.trim() || state.loadingStates.general}
            className="w-full h-24 bg-rose-500 hover:bg-rose-400 text-white py-6 rounded-[2.5rem] font-black text-xs sm:text-sm uppercase tracking-[0.5em] shadow-[0_20px_50px_rgba(244,63,94,0.3)] transition-all disabled:opacity-20 flex items-center justify-center gap-6 group"
          >
            {isGenerating ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span className="text-2xl group-hover:rotate-12 transition-transform">✨</span>
            )}
            {isGenerating ? 'MANIFESTING...' : 'INITIATE MANIFESTATION'}
          </button>
        </div>

        {/* Right: Visualization & Anchoring */}
        <div className="space-y-12">
          <div className="glass aspect-square rounded-[4rem] sm:rounded-[6rem] border-white/5 overflow-hidden flex items-center justify-center relative shadow-2xl bg-[#05080f] group">
            {generatedImage ? (
              <img src={generatedImage} alt="Manifested Spirit" className="w-full h-full object-cover animate-in zoom-in-95 duration-1000" />
            ) : (
              <div className="text-center space-y-6 opacity-20">
                <div className="text-9xl group-hover:scale-110 transition-transform duration-700">🔮</div>
                <p className="text-[10px] font-black uppercase tracking-[0.8em] font-mono italic">Awaiting Sync...</p>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Visual scanline effect */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
          </div>

          <button 
            onClick={handleMint}
            disabled={!generatedImage || state.loadingStates.general || !state.account}
            className="w-full h-28 bg-white text-black rounded-[3rem] font-black text-xs sm:text-sm uppercase tracking-[0.7em] transition-all disabled:opacity-10 flex items-center justify-center gap-8 shadow-2xl hover:bg-amber-50 active:scale-95 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
            <span className="text-2xl group-hover:translate-y-[-4px] transition-transform">⚓</span>
            {state.loadingStates.general ? 'CALIBRATING...' : 'ANCHOR TO CHAIN'}
          </button>

          <div className="flex justify-between items-center px-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Telemetry: Secure</span>
            </div>
            <div className="flex items-center gap-3">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Format: Neural_PNG</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default MintPage;
