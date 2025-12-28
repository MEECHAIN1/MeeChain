
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

        ctx.drawImage(img, 0, 0, 1024, 1024);

        const gradient = ctx.createLinearGradient(0, 850, 0, 1024);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 850, 1024, 174);

        ctx.font = "900 80px 'Inter', sans-serif";
        ctx.fillStyle = "#1e293b";
        ctx.textAlign = "center";
        ctx.letterSpacing = "10px";
        ctx.fillText("MEECHAIN", 512, 940);

        ctx.font = "italic 700 48px 'Georgia', serif";
        ctx.fillStyle = "#f43f5e";
        ctx.textAlign = "center";
        ctx.fillText("Meebot Spirit", 580, 970);

        ctx.font = "600 12px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.textAlign = "center";
        const serial = `VERIFIED_GEN_ID_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        ctx.fillText(serial, 512, 995);

        resolve(canvas.toDataURL('image/png'));
      };
      img.src = base64Image;
    });
  };

  const generateMeeBot = async () => {
    if (!prompt.trim()) return notify('error', 'โปรดระบุลักษณะของจิตวิญญาณ MeeBot ของคุณ');
    
    setIsGenerating(true);
    setGlobalLoading('general', true);
    triggerWarpRitual();
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const enhancedPrompt = `A cute, high-quality 3D stylized MeeBot robot holding a glowing pink lotus flower. ${prompt}. Soft clay-like 3D render, vibrant colorful geometric background elements, cinematic soft lighting, 8k resolution, octane render, toy-like aesthetic, friendly eyes, highly detailed, clean design, bright colors.`;

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
        notify('success', 'MeeBot Spirit Manifested Successfully!');
      } else {
        notify('error', 'Manifestation failed. The Oracle is silent.');
      }
    } catch (err) {
      notify('error', 'Neural connection lost. Please try again.');
    } finally {
      setIsGenerating(false);
      setGlobalLoading('general', false);
    }
  };

  const handleMint = async () => {
    if (!state.account) return notify('error', 'Connect your Neural Link first.');
    
    setIsMinting(true);
    setGlobalLoading('general', true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      const tokenId = Math.floor(Math.random() * 8888) + 1111;
      
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
      notify('success', `MeeBot Spirit #${tokenId} joined your collective!`);
      setGeneratedImage(null);
      setPrompt('');
    } catch (err) {
      notify('error', 'Anchoring failed.');
    } finally {
      setIsMinting(false);
      setGlobalLoading('general', false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <header className="text-center space-y-2 sm:space-y-4">
        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase italic text-white leading-none">
          Spirit <span className="text-rose-500">Manifestor</span>
        </h1>
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <span className="h-[1px] w-12 sm:w-20 bg-rose-500/20"></span>
          <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] sm:tracking-[0.8em]">Invoke your Machine Guardian</p>
          <span className="h-[1px] w-12 sm:w-20 bg-rose-500/20"></span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="space-y-6 sm:space-y-8">
          <section className="glass p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border-white/5 space-y-6 sm:space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-6xl sm:text-9xl font-black">LOTUS</span>
            </div>
            
            <div className="space-y-1 sm:space-y-2 relative">
              <h2 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-3 tracking-widest">
                <span className="w-2 h-4 sm:h-6 bg-rose-500 rounded-full animate-pulse"></span>
                Spirit Characteristics
              </h2>
              <p className="text-[8px] sm:text-[10px] text-slate-600 font-bold italic uppercase">จิตวิญญาณแห่ง MeeBot ของคุณเป็นอย่างไร?</p>
            </div>

            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="เช่น: นักรบมังกรผู้อ่อนโยน, ผู้เฝ้าประตูมิติแห่งดวงดาว..."
              className="w-full h-40 sm:h-56 bg-black/40 border-2 border-white/5 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 text-white focus:outline-none focus:border-rose-500/50 transition-all placeholder:text-slate-800 italic text-lg sm:text-xl leading-relaxed shadow-inner"
              disabled={isGenerating || isMinting}
            />
            
            <button 
              onClick={generateMeeBot}
              disabled={isGenerating || !prompt.trim() || isMinting}
              className="w-full bg-rose-500 hover:bg-rose-400 py-5 sm:py-6 rounded-2xl sm:rounded-3xl font-black text-[10px] sm:text-xs uppercase tracking-[0.4em] sm:tracking-[0.5em] shadow-2xl transition-all disabled:opacity-20 border-b-4 border-rose-900 flex items-center justify-center gap-3 sm:gap-4 text-white"
            >
              {isGenerating ? (
                 <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Invoking...</span>
                 </>
              ) : (
                <>
                  <span>Manifest Spirit</span>
                  <span className="text-lg">🌸</span>
                </>
              )}
            </button>
          </section>

          <div className="p-6 sm:p-8 bg-rose-500/5 border border-rose-500/10 rounded-[1.5rem] sm:rounded-[2.5rem] flex gap-4 sm:gap-6 items-center">
            <div className="text-3xl sm:text-4xl">🧘‍♂️</div>
            <div className="space-y-1">
              <p className="text-[9px] text-rose-500 font-black uppercase tracking-widest">Divine Verification</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed font-medium uppercase italic">
                ทุกยูนิตจะได้รับตราประทับ "MeeBot Spirit" ยืนยันความบริสุทธิ์
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
          <div className="glass aspect-square rounded-[2rem] sm:rounded-[4rem] border-white/5 overflow-hidden flex items-center justify-center relative group shadow-2xl bg-black/40">
            {generatedImage ? (
              <div className="w-full h-full relative">
                <img src={generatedImage} alt="Preview" className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 sm:p-12">
                   <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Ready</span>
                        <h4 className="text-white font-black text-lg sm:text-2xl italic uppercase tracking-tighter">Verified specimen</h4>
                      </div>
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.download = `meechain-spirit.png`;
                          link.href = generatedImage;
                          link.click();
                        }}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-4 sm:p-5 rounded-xl sm:rounded-2xl text-white transition-all shadow-xl"
                      >
                        📥
                      </button>
                   </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 sm:space-y-6 opacity-20">
                <div className="text-7xl sm:text-9xl animate-pulse">🌸</div>
                <div className="space-y-2">
                  <p className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.5em] sm:tracking-[1em] pl-4">Awaiting</p>
                  <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Invoke to visualize</p>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <button 
            onClick={handleMint}
            disabled={!generatedImage || isMinting}
            className="w-full h-16 sm:h-24 bg-white text-black py-4 sm:py-6 rounded-[1.5rem] sm:rounded-[2rem] font-black text-xs sm:text-sm uppercase tracking-[0.4em] sm:tracking-[0.6em] transition-all disabled:opacity-5 disabled:cursor-not-allowed flex items-center justify-center gap-4 sm:gap-6 shadow-2xl border-b-4 sm:border-b-8 border-slate-300"
          >
            {isMinting ? (
              <>
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Ascending...</span>
              </>
            ) : (
              <>
                <span>Permanent Ascension</span>
                <span className="text-xl sm:text-2xl">🛡️</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MintPage;
