
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppState';
import { GoogleGenAI } from "@google/genai";
import { triggerMintRitual, triggerSuccessRitual, triggerWarpRitual } from '../lib/rituals';
import { generateMeeBotName } from '../lib/meeBotNames';
import { logger } from '../lib/logger';

/**
 * 🎨 Spirit Manifestor (MintPage)
 * The primary interface for creating new MeeBot entities in Techtopia.
 * 
 * Features:
 * - Prompt-based AI image generation via Gemini 2.5 Flash Image.
 * - Real-time canvas watermarking with the "MeeChain" sigil.
 * - Simulated blockchain minting and state management.
 * - High-fidelity "Techy" UI with loading and success states.
 */
const MintPage: React.FC = () => {
  const { state, notify, addEvent, setGlobalLoading, addBot } = useApp();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Applies the official "MeeChain" watermark and aesthetic overlays.
   * This ensures every minted MeeBot carries the mark of Techtopia.
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

        // 1. Draw the base AI-generated image
        ctx.drawImage(img, 0, 0, 1024, 1024);

        // 2. Add a stylish "Techy" gradient overlay for the watermark area
        const gradient = ctx.createLinearGradient(0, 850, 0, 1024);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(5, 8, 15, 0.9)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 850, 1024, 174);

        // 3. Apply the MeeChain Sigil (Watermark)
        ctx.font = "900 52px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.textAlign = "center";
        ctx.letterSpacing = "24px";
        
        // Glow effect for the text
        ctx.shadowColor = "rgba(245, 158, 11, 0.6)";
        ctx.shadowBlur = 20;
        ctx.fillText("MEECHAIN", 512, 930);
        
        ctx.font = "700 18px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(244, 63, 94, 0.6)";
        ctx.shadowBlur = 0;
        ctx.letterSpacing = "6px";
        ctx.fillText("ORIGINAL_CONSTRUCT_V4.1", 512, 975);

        resolve(canvas.toDataURL('image/png'));
      };
      img.src = base64Image;
    });
  };

  /**
   * Invokes the Gemini 2.5 Flash Image model to generate a unique MeeBot.
   */
  const generateMeeBot = async () => {
    if (!prompt.trim()) {
      notify('error', 'Please enter a prompt to guide the Machine Spirit.');
      return;
    }
    
    setIsGenerating(true);
    setGlobalLoading('general', true);
    triggerWarpRitual(); // Visual feedback
    
    logger.ritual('AI_GENERATION', true, { prompt });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // We wrap the user's prompt with style instructions to ensure a "MeeBot" look
      const styledPrompt = `A sleek, futuristic 3D chibi-style robot in the city of Techtopia, ${prompt}, vibrant colors, glowing accents, cinematic lighting, masterpiece, 8k, digital art.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: styledPrompt }] },
        config: { 
          imageConfig: { 
            aspectRatio: "1:1" 
          } 
        }
      });

      let rawImageBase64 = "";
      // Extract the image part from the response
      if (response.candidates?.[0]?.content?.parts) {
        const imagePart = response.candidates[0].content.parts.find(p => p.inlineData);
        if (imagePart?.inlineData) {
          // Fix: Added const keyword to resolve "Cannot find name 'rawBase64'" error
          const rawBase64 = imagePart.inlineData.data;
          rawImageBase64 = `data:image/png;base64,${rawBase64}`;
        }
      }

      if (rawImageBase64) {
        const watermarked = await applyWatermark(rawImageBase64);
        setGeneratedImage(watermarked);
        notify('success', 'Machine Spirit has manifested a new form.');
      } else {
        throw new Error("Neural core returned no image data.");
      }
    } catch (err: any) {
      logger.error("Manifestation Failed", err);
      notify('error', `Generation failed: ${err.message || 'Quantum interference detected.'}`);
    } finally {
      setIsGenerating(false);
      setGlobalLoading('general', false);
    }
  };

  /**
   * Simulates the blockchain minting process.
   */
  const handleMint = async () => {
    if (!state.account || !generatedImage) {
      notify('error', 'Neural Link (Wallet) required for anchoring.');
      return;
    }
    
    setGlobalLoading('general', true);
    
    // Simulate network latency of a blockchain
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const fakeHash = `0x${Math.random().toString(16).slice(2, 66)}`;
      const tokenId = Math.floor(Math.random() * 8999) + 1000;
      
      const newBot: any = {
        id: tokenId.toString(),
        name: generateMeeBotName(tokenId.toString()),
        rarity: Math.random() > 0.9 ? "Legendary" : Math.random() > 0.7 ? "Epic" : "Common",
        energyLevel: 0,
        stakingStart: null,
        isStaking: false,
        image: generatedImage,
        baseStats: {
          power: 40 + Math.random() * 50,
          speed: 40 + Math.random() * 50,
          intel: 40 + Math.random() * 50
        },
        components: ["Neural Core", "Chassis V4.1", "Aetheric Link"]
      };

      // Update state
      addBot(newBot);
      addEvent({
        type: 'Minted',
        contract: 'NFT',
        from: '0x0000000000000000000000000000000000000000',
        to: state.account,
        tokenId: tokenId.toString(),
        hash: fakeHash
      });

      triggerSuccessRitual();
      triggerMintRitual();
      
      notify('success', `MeeBot #${tokenId} successfully anchored to the chain!`);
      
      // Clear for next generation
      setGeneratedImage(null);
      setPrompt('');
      
    } catch (err: any) {
      logger.error("Minting Failed", err);
      notify('error', 'Blockchain anchoring ritual failed.');
    } finally {
      setGlobalLoading('general', false);
    }
  };

  // Fix: Completed the return statement and added default export to resolve import errors in App.tsx
  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32">
      <canvas ref={canvasRef} className="hidden" />
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white">
            Spirit <span className="text-rose-500">Manifestor</span>
          </h1>
          <p className="text-slate-400 font-medium text-xs sm:text-sm mt-2">Create unique machine spirits through neural prompt engineering.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="glass p-8 rounded-[2.5rem] border-white/5 bg-black/40 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Neural Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the robot's form, colors, and environment..."
                className="w-full h-40 bg-black/60 border border-white/5 rounded-2xl p-6 text-white focus:outline-none focus:border-rose-500/30 transition-all text-sm italic placeholder:text-slate-800"
                disabled={isGenerating}
              />
            </div>

            <button 
              onClick={generateMeeBot}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-5 bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] rounded-2xl transition-all active:scale-95 disabled:opacity-30 uppercase tracking-[0.4em] flex items-center justify-center gap-3 shadow-lg"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>Manifest Form</span>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass aspect-square rounded-[3rem] border-white/5 overflow-hidden flex items-center justify-center relative bg-black/40">
            {generatedImage ? (
              <img src={generatedImage} alt="Manifestation" className="w-full h-full object-cover animate-in fade-in duration-1000" />
            ) : (
              <div className="text-center space-y-4 opacity-20">
                <div className="text-6xl">🤖</div>
                <p className="text-[10px] font-black uppercase tracking-widest italic">Awaiting Manifestation</p>
              </div>
            )}
            
            {isGenerating && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse">Establishing Neural Link...</p>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleMint}
            disabled={!generatedImage || state.loadingStates.general}
            className="w-full py-6 bg-white text-black font-black text-[12px] rounded-3xl transition-all active:scale-95 disabled:opacity-20 uppercase tracking-[0.6em] flex items-center justify-center gap-4 shadow-2xl border-b-8 border-slate-300"
          >
            {state.loadingStates.general ? (
              <div className="w-5 h-5 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="text-xl">⛓️</span>
            )}
            {state.loadingStates.general ? 'ANCHORING...' : 'ANCHOR TO BLOCKCHAIN'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MintPage;
