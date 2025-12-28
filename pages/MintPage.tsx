
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppState';
import { GoogleGenAI } from "@google/genai";
import { triggerMintRitual, triggerSuccessRitual, triggerWarpRitual } from '../lib/rituals';

const MintPage: React.FC = () => {
  const { state, notify, addEvent, setGlobalLoading } = useApp();
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Applies a high-fidelity digital watermark to the generated asset.
   * This represents the "Machine Spirit Verification" signature.
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

        // 1. Draw original base asset
        ctx.drawImage(img, 0, 0, 1024, 1024);

        // 2. Add Sophisticated Branding Overlay (Gradient at bottom)
        const gradient = ctx.createLinearGradient(0, 800, 0, 1024);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.6, 'rgba(5, 8, 15, 0.9)');
        gradient.addColorStop(1, 'rgba(5, 8, 15, 1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 800, 1024, 224);

        // 3. MeeBot Protocol V3 Branding
        ctx.font = "900 52px 'Inter', sans-serif";
        ctx.fillStyle = "white";
        ctx.shadowColor = "rgba(245, 158, 11, 0.6)";
        ctx.shadowBlur = 20;
        ctx.fillText("MEEBOT PROTOCOL V3", 60, 920);
        ctx.shadowBlur = 0;

        // 4. Verification Serial & Timestamp
        ctx.font = "600 20px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#f59e0b";
        const serial = `ID-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
        const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
        ctx.fillText(`${serial} // SECTOR_ALPHA_7`, 62, 960);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillText(`TIMESTAMP: ${timestamp} UTC`, 62, 985);

        // 5. Minimalist Corner Seal
        ctx.font = "900 14px Inter";
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.textAlign = "right";
        ctx.letterSpacing = "6px";
        ctx.fillText("AUTHENTICATED_ASSET", 960, 985);

        resolve(canvas.toDataURL('image/png'));
      };
      img.src = base64Image;
    });
  };

  const generateMeeBot = async () => {
    if (!prompt.trim()) return notify('error', 'Please define your unit characteristics.');
    
    setIsGenerating(true);
    setGlobalLoading('general', true);
    triggerWarpRitual();
    
    try {
      // Create fresh AI instance as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { 
          parts: [{ 
            text: `Full body portrait of a cybernetic MeeBot robot: ${prompt}. Highly detailed mechanical intricate parts, glowing core energy, sleek futuristic aesthetic, cinematic lighting, 8k resolution, professional concept art, sharp focus, 3D render.` 
          }] 
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      let rawImage = "";
      // Guidelines: iterate parts to find inlineData
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            rawImage = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (rawImage) {
        const watermarked = await applyWatermark(rawImage);
        setGeneratedImage(watermarked);
        notify('success', 'Visual specimen manifested from the neural void.');
      } else {
        notify('error', 'Manifestation failed. The machine spirit is silent.');
      }
    } catch (err) {
      notify('error', 'Neural link interrupted: Quantum noise detected.');
      console.error(err);
    } finally {
      setIsGenerating(false);
      setGlobalLoading('general', false);
    }
  };

  const handleMint = async () => {
    if (!state.account) return notify('error', 'Neural Link required for ledger anchoring.');
    
    setIsMinting(true);
    setGlobalLoading('general', true);
    try {
      // Simulate blockchain anchoring ritual
      await new Promise(r => setTimeout(r, 2500));
      const tokenId = Math.floor(Math.random() * 9999) + 1;
      
      addEvent({
        type: 'Minted',
        contract: 'NFT',
        from: '0x0000000000000000000000000000000000000000',
        to: state.account,
        tokenId: tokenId.toString(),
        hash: `0x${Math.random().toString(16).slice(2, 66)}`
      });

      triggerSuccessRitual();
      triggerMintRitual();
      notify('success', `🎉 Unit #${tokenId} has been permanently anchored to the Eternal Ledger.`);
      setGeneratedImage(null);
      setPrompt('');
    } catch (err) {
      notify('error', 'Ledger anchoring failed. Verification rejected.');
    } finally {
      setIsMinting(false);
      setGlobalLoading('general', false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <header className="text-center space-y-4">
        <h1 className="text-7xl font-black tracking-tighter uppercase italic text-white">
          Factory <span className="text-amber-500">Core</span>
        </h1>
        <div className="flex items-center justify-center gap-4">
          <span className="h-[1px] w-20 bg-white/10"></span>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.8em]">Manifest Assets into Reality</p>
          <span className="h-[1px] w-20 bg-white/10"></span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Input Control Area */}
        <div className="space-y-8">
          <section className="glass p-10 rounded-[3rem] border-white/5 space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-9xl font-black">AI</span>
            </div>
            
            <div className="space-y-2 relative">
              <h2 className="text-xs font-black uppercase text-slate-400 flex items-center gap-3 tracking-widest">
                <span className="w-2 h-6 bg-amber-500 rounded-full animate-pulse"></span>
                Input Specifications
              </h2>
              <p className="text-[10px] text-slate-600 font-bold italic uppercase">Define the mechanical nature of the desired specimen.</p>
            </div>

            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: A futuristic guardian bot with crystalline armor and solar wings..."
              className="w-full h-56 bg-black/40 border-2 border-white/5 rounded-[2rem] p-8 text-white focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-slate-800 italic text-xl leading-relaxed shadow-inner"
              disabled={isGenerating || isMinting}
            />
            
            <button 
              onClick={generateMeeBot}
              disabled={isGenerating || !prompt.trim() || isMinting}
              className="w-full bg-amber-600 hover:bg-amber-500 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.5em] shadow-2xl transition-all disabled:opacity-20 border-b-4 border-amber-900 group relative overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-center gap-4 text-white">
                {isGenerating ? (
                   <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Channeling Imaginative Void...</span>
                   </>
                ) : (
                  <>
                    <span>Manifest Specimen</span>
                    <span className="group-hover:translate-x-2 transition-transform">⚡</span>
                  </>
                )}
              </div>
            </button>
          </section>

          <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-[2.5rem] flex gap-6 items-center">
            <div className="text-4xl opacity-50">🛡️</div>
            <div className="space-y-1">
              <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Protocol Verification</p>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                The protocol automatically embeds a machine-readable signature to verify asset lineage before permanent ledger anchoring.
              </p>
            </div>
          </div>
        </div>

        {/* Preview and Action Area */}
        <div className="space-y-8">
          <div className="glass aspect-square rounded-[4rem] border-white/5 overflow-hidden flex items-center justify-center relative group shadow-2xl bg-black/40">
            {generatedImage ? (
              <div className="w-full h-full relative">
                <img src={generatedImage} alt="Preview" className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-12">
                   <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Ready for Deployment</span>
                        <h4 className="text-white font-black text-2xl italic uppercase tracking-tighter">Verified Asset Specimen</h4>
                      </div>
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.download = `meebot-verified.png`;
                          link.href = generatedImage;
                          link.click();
                        }}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-5 rounded-2xl text-white transition-all shadow-xl"
                        title="Download Specimen"
                      >
                        📥
                      </button>
                   </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 opacity-20">
                <div className="text-9xl animate-pulse">🤖</div>
                <div className="space-y-2">
                  <p className="text-[11px] font-black uppercase tracking-[1em] pl-4">Awaiting Signal</p>
                  <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Visual data not yet Manifested</p>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleMint}
              disabled={!generatedImage || isMinting}
              className="w-full h-24 bg-white text-black py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.6em] transition-all disabled:opacity-5 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-6 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
            >
              {isMinting ? (
                <>
                  <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Anchoring to Ledger...</span>
                </>
              ) : (
                <>
                  <span>Anchor to Eternal Ledger</span>
                  <span className="text-2xl">💎</span>
                </>
              )}
            </button>
            {!generatedImage && !isGenerating && (
              <p className="text-center text-[9px] font-black text-slate-700 uppercase tracking-widest italic animate-pulse">
                Generate a visual specimen to enable anchoring.
              </p>
            )}
          </div>
        </div>
      </div>

      <footer className="text-center pt-8">
        <div className="inline-flex items-center gap-4 px-6 py-2 bg-white/5 rounded-full border border-white/5 opacity-50">
          <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">MeeBot_Factory_Subsystem_Online</span>
        </div>
      </footer>
    </div>
  );
};

export default MintPage;
