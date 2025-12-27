import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DownloadIcon, MeeBotDefaultIcon, SpinnerIcon, UploadIcon, WandIcon } from './Icons';
import { generateImage, analyzeMeeBotMood } from '../lib/services/geminiService'; // 🟢 ปรับ Path แล้ว
import { mintMeeBot } from '../lib/services/web3Service'; // 🟢 ปรับ Path แล้ว
import { ethers } from 'ethers'; // 🟢 เรียกใช้หลังติดตั้งสำเร็จ

interface ImageEditorProps {
  provider: ethers.BrowserProvider | null;
  connectedAccount: string | null;
  onConnectWallet: () => void;
  onMintSuccess: () => void;
}

export const MeeBotAIEditor: React.FC<ImageEditorProps> = ({
  provider,
  connectedAccount,
  onConnectWallet,
  onMintSuccess
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [persona, setPersona] = useState<'Default' | 'Crystal Core'>('Default');
  const [animation, setAnimation] = useState('meebot-pulse');
  const [error, setError] = useState<string | null>(null);

  // 🟢 ฟังก์ชัน Genesis Ritual (สร้างภาพและวิเคราะห์อารมณ์)
  const handleBeginGenesis = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setError(null);

    try {
      // 1. เรียก Backend Function เพื่อสร้างภาพ (ปลอดภัยจาก API Key Error)
      const [imageData, moodData] = await Promise.all([
        generateImage(prompt),
        analyzeMeeBotMood(prompt)
      ]);

      setGeneratedImage(imageData);
      
      // 2. เมื่อได้ภาพและอารมณ์แล้ว ทำการ Mint NFT ทันที
      if (provider && connectedAccount) {
        await mintMeeBot(provider, {
          image: imageData,
          mood: moodData.mood,
          prompt: prompt,
          persona: persona
        });
        onMintSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Genesis Failed");
    } finally {
      setIsGenerating(false);
    }
    
// ตัวอย่าง Flow ใน ImageEditor.tsx
const txHash = await mintAiMeeBot(provider, "ipfs://your-metadata-cid");
  
  return (
    <div className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6 bg-slate-900/50 backdrop-blur-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black italic uppercase flex items-center gap-3">
          <MeeBotDefaultIcon className="w-8 h-8 text-sky-400" />
          MeeBot <span className="text-sky-400">Universe</span>
        </h2>
      </div>

      {/* Preview Section */}
      <div className="bg-black/40 rounded-[2rem] p-8 flex flex-col items-center justify-center border border-white/5 min-h-[300px]">
        {generatedImage ? (
          <img src={`data:image/png;base64,${generatedImage}`} alt="Generated MeeBot" className="w-48 h-48 rounded-2xl shadow-2xl" />
        ) : (
          <div className={`meebot-avatar ${animation} p-4 bg-sky-500/10 rounded-full`}>
            <MeeBotDefaultIcon className="w-24 h-24 text-sky-400" />
          </div>
        )}
        <p className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Preview Area</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500">เลือกสไตล์ (Persona)</label>
          <div className="flex gap-2">
            {(['Default', 'Crystal Core'] as const).map(p => (
              <button 
                key={p} 
                onClick={() => setPersona(p)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${persona === p ? 'bg-sky-500 text-white' : 'bg-white/5 text-slate-500'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500">เลือกแอนิเมชัน</label>
          <select 
            value={animation} 
            onChange={(e) => setAnimation(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-white focus:outline-none"
          >
            <option value="meebot-pulse">meebot-pulse</option>
            <option value="meebot-bounce">meebot-bounce</option>
          </select>
        </div>
      </div>

      {/* Genesis Input */}
      <div className="space-y-4">
        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the soul of your MeeBot to begin..."
          className="w-full bg-black/40 border-2 border-white/5 rounded-2xl p-4 text-sm text-white focus:border-sky-500/50 transition-all outline-none h-24 resize-none"
        />
        
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-400 text-[10px] font-black uppercase">
            Error: {error}
          </div>
        )}

        <button 
          onClick={handleBeginGenesis}
          disabled={isGenerating || !prompt}
          className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-20 py-4 rounded-2xl font-black text-xs text-white uppercase tracking-[0.3em] transition-all shadow-xl flex items-center justify-center gap-3"
        >
          {isGenerating ? <SpinnerIcon className="animate-spin" /> : <WandIcon />}
          {isGenerating ? 'GENESIZING...' : 'Begin Genesis'}
        </button>
      </div>
    </div>
   );
  }
 }