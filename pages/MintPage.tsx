
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

        // 1. Draw original image
        ctx.drawImage(img, 0, 0, 1024, 1024);

        // 2. Add Branding Overlay
        const gradient = ctx.createLinearGradient(0, 880, 0, 1024);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.7)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 880, 1024, 144);

        // 3. Primary Watermark Text
        ctx.font = "900 42px Inter, sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillText("MEEBOT PROTOCOL V3", 60, 950);

        // 4. Verification Serial
        ctx.font = "500 16px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#f59e0b";
        const serial = `VERIFIED_UNIT_${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
        ctx.fillText(serial, 62, 980);

        // 5. Corner Branding
        ctx.font = "900 14px Inter";
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.textAlign = "right";
        ctx.fillText("MEE_CHAIN_MECHANICAL_ASSET", 960, 980);

        resolve(canvas.toDataURL('image/png'));
      };
      img.src = base64Image;
    });
  };

  const generateMeeBot = async () => {
    if (!prompt.trim()) return notify('error', 'กรุณาระบุลักษณะของ MeeBot ที่ต้องการสร้าง');
    
    setIsGenerating(true);
    setGlobalLoading('general', true);
    triggerWarpRitual();
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `A highly detailed mecha portrait, futuristic robot, intricate mechanical parts, cyberpunk aesthetic, high-tech glowing parts, cinematic lighting, 8k resolution, professional concept art: ${prompt}` }] },
      });

      let rawImage = "";
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          rawImage = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      if (rawImage) {
        const watermarked = await applyWatermark(rawImage);
        setGeneratedImage(watermarked);
        triggerMintRitual();
        notify('success', 'สเกลภาพของ MeeBot ถูกดึงออกมาจาก Void สำเร็จ');
      } else {
        notify('error', 'การเรนเดอร์ภาพล้มเหลว โปรดลองอีกครั้ง');
      }
    } catch (err) {
      notify('error', 'Quantum Interference: ไม่สามารถเข้าถึงมิติจินตภาพได้');
      console.error(err);
    } finally {
      setIsGenerating(false);
      setGlobalLoading('general', false);
    }
  };

  const handleMint = async () => {
    if (!state.account) return notify('error', 'กรุณาเชื่อมต่อ Neural Link ก่อนทำการ Mint');
    
    setIsMinting(true);
    setGlobalLoading('general', true);
    try {
      // Simulate blockchain delay
      await new Promise(r => setTimeout(r, 2000));
      const tokenId = Math.floor(Math.random() * 9000) + 1000;
      
      addEvent({
        type: 'Minted',
        contract: 'NFT',
        from: '0x0000000000000000000000000000000000000000',
        to: state.account,
        tokenId: tokenId.toString(),
        hash: `0x${Math.random().toString(16).slice(2, 66)}`
      });

      triggerSuccessRitual();
      notify('success', `🎉 บรรจุวิญญาณเครื่องจักรเสร็จสมบูรณ์! MeeBot #${tokenId} ถูกบันทึกลงใน Eternal Ledger`);
      setGeneratedImage(null);
      setPrompt('');
    } catch (err) {
      notify('error', 'Minting failed: ไม่สามารถสร้างบันทึกบน Ledger ได้');
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
          <span className="h-[1px] w-12 bg-white/10"></span>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em]">Manifest Mechanical Assets into Reality</p>
          <span className="h-[1px] w-12 bg-white/10"></span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <section className="glass p-10 rounded-[3rem] border-white/5 space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-8xl font-black">AI</span>
            </div>
            
            <div className="space-y-2 relative">
              <h2 className="text-xs font-black uppercase text-slate-400 flex items-center gap-3 tracking-widest">
                <span className="w-2 h-6 bg-amber-500 rounded-full animate-pulse"></span>
                Neural Input Specification
              </h2>
              <p className="text-[10px] text-slate-600 font-bold italic">Define the chassis and neural configuration of your unit.</p>
            </div>

            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: A titanium-clad heavy assault bot with emerald optics..."
              className="w-full h-48 bg-black/40 border-2 border-white/5 rounded-3xl p-8 text-white focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-slate-800 italic text-lg leading-relaxed shadow-inner"
              disabled={isGenerating || isMinting}
            />
            
            <button 
              onClick={generateMeeBot}
              disabled={isGenerating || !prompt.trim() || isMinting}
              className="w-full bg-amber-600 hover:bg-amber-500 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all disabled:opacity-20 border-b-4 border-amber-900 group relative overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-center gap-4">
                {isGenerating ? (
                   <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Channeling Imagination...</span>
                   </>
                ) : (
                  <>
                    <span>Manifest Unit Specimen</span>
                    <span className="group-hover:translate-x-2 transition-transform">⚡</span>
                  </>
                )}
              </div>
            </button>
          </section>

          <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-[2rem] flex gap-6 items-center">
            <div className="text-3xl opacity-50">🛡️</div>
            <div className="space-y-1">
              <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Integrity Notice</p>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                ระบบจะทำการประทับ "Digital Watermark" ลงบนภาพเพื่อยืนยันแหล่งกำเนิดโดยอัตโนมัติก่อนการ Mint
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass aspect-square rounded-[3.5rem] border-white/5 overflow-hidden flex items-center justify-center relative group shadow-2xl">
            {generatedImage ? (
              <>
                <img src={generatedImage} alt="Preview" className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-12">
                   <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Status: Ready for Injection</span>
                        <h4 className="text-white font-black text-xl italic uppercase tracking-tighter">Verified Specimen</h4>
                      </div>
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.download = `meebot-unit.png`;
                          link.href = generatedImage;
                          link.click();
                        }}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-4 rounded-xl text-white transition-all"
                      >
                        📥
                      </button>
                   </div>
                </div>
              </>
            ) : (
              <div className="text-center space-y-6 opacity-20">
                <div className="text-8xl animate-pulse">🤖</div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.8em] pl-2">Awaiting Visual</p>
                  <p className="text-[8px] font-mono text-slate-500 uppercase">Neural requirements not met</p>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <button 
            onClick={handleMint}
            disabled={!generatedImage || isMinting}
            className="w-full h-24 bg-white text-black py-6 rounded-2xl font-black text-sm uppercase tracking-[0.5em] transition-all disabled:opacity-5 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-6"
          >
            {isMinting ? (
              <>
                <div className="w-5 h-5 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Syncing Ledger...</span>
              </>
            ) : (
              <>
                <span>Commit Unit to Ledger</span>
                <span className="text-xl">💎</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MintPage;
