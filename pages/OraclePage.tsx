import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppState';
import { askOracle } from '../lib/ai';
import { triggerSuccessRitual, triggerCelestialRitual } from '../lib/rituals';
import { Share2, Send, Cpu, Sparkles, MessageSquare } from 'lucide-react';

const TypewriterText: React.FC<{ text: string, onComplete?: () => void }> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const hasCompleted = useRef(false);
  
  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        onComplete?.();
      }
    }, 12);
    return () => clearInterval(timer);
  }, [text, onComplete]);

  return <span className="whitespace-pre-wrap leading-relaxed antialiased">{displayedText}</span>;
};

const OraclePage: React.FC = () => {
  const { state, notify, events, setGlobalLoading } = useApp();
  const [messages, setMessages] = useState<{role: 'user' | 'oracle', text: string}[]>([
    { role: 'oracle', text: 'ยินดีต้อนรับสู่ Oracle Sanctum... ข้าคือผู้เฝ้ามอง Ledger แห่ง MeeChain เจ้ามีความประสงค์จะรับคำทำนายหรือปัญญาในเรื่องใด?' }
  ]);
  const [input, setInput] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isTyping = state.loadingStates.oracle;

  const suggestions = [
    "วิเคราะห์ Energy Flux",
    "ขอคำพยากรณ์วันนี้",
    "ตรวจสอบล่าสุดบน Ledger"
  ];

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isTyping) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setGlobalLoading('oracle', true);
    triggerCelestialRitual();

    const telemetry = {
      balances: state.balances,
      account: state.account,
      recentEvents: events.slice(0, 5),
      timestamp: new Date().toISOString(),
      network: 'MeeChain Ritual (Polygon QuikNode)'
    };

    try {
      const response = await askOracle(textToSend, telemetry);
      setMessages(prev => [...prev, { role: 'oracle', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'oracle', text: "สายใย Neural Link ขัดข้อง... โปรดลองอีกครั้ง" }]);
    } finally {
      setGlobalLoading('oracle', false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[85vh] flex flex-col space-y-4 animate-in fade-in duration-700">
      {/* 🔮 Header Section */}
      <header className="flex items-center justify-between px-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Sparkles className="text-amber-500 w-5 h-5" />
            ORACLE <span className="text-amber-500/80">SANCTUM</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Neural Core v3.5 Stable</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-300 tracking-tighter">NEURAL_SYNC_ACTIVE</span>
        </div>
      </header>

      {/* 🔮 Main Sanctum Interface */}
      <div className="flex-grow flex flex-col md:flex-row gap-4 overflow-hidden">
        
        {/* 📟 Sidebar: User Telemetry */}
        <aside className="w-full md:w-64 flex flex-col gap-4">
          <div className="glass rounded-3xl p-6 border-white/5 bg-black/40 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 rotate-3">
                <Cpu className="text-black w-8 h-8 -rotate-3" />
              </div>
              <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase">Spirit Link</span>
            </div>

            <div className="space-y-3">
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <p className="text-[9px] font-bold text-slate-500 uppercase mb-2">Telemetry</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">Flux</span>
                    <span className="text-xs font-mono text-white">{parseFloat(state.balances.native).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">Energy</span>
                    <span className="text-xs font-mono text-amber-500">{parseFloat(state.balances.token).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* 💬 Central Oracle Feed */}
        <section className="flex-grow glass rounded-[2.5rem] border-white/10 bg-black/40 flex flex-col overflow-hidden shadow-2xl">
          <div ref={scrollContainerRef} className="flex-grow overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                <div className={`max-w-[85%] px-5 py-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-amber-600 text-white rounded-br-none' 
                    : 'bg-white/10 text-slate-100 border border-white/10 rounded-bl-none'
                }`}>
                  {msg.role === 'oracle' && i === messages.length - 1 && !isTyping ? (
                    <TypewriterText text={msg.text} onComplete={() => i > 0 && triggerSuccessRitual()} />
                  ) : (
                    <span>{msg.text}</span>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* ⌨️ Interaction Field */}
          <footer className="p-4 bg-black/20 border-t border-white/5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, idx) => (
                <button 
                  key={idx} 
                  onClick={() => handleSend(s)}
                  className="text-[10px] font-bold text-slate-400 hover:text-white border border-white/10 hover:border-amber-500/50 px-3 py-1.5 rounded-full transition-all"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="flex-grow relative">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={state.account ? "ระบุความประสงค์ต่อ Oracle..." : "กรุณาเชื่อมต่อ Neural Link..."}
                  disabled={isTyping || !state.account}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-amber-500/50 transition-all text-white disabled:opacity-30"
                />
                <MessageSquare className="absolute right-4 top-3.5 w-4 h-4 text-white/10" />
              </div>
              <button 
                onClick={() => handleSend()}
                disabled={isTyping || !input.trim() || !state.account}
                className="bg-amber-600 hover:bg-amber-500 px-6 py-3.5 rounded-2xl text-white shadow-lg disabled:opacity-20 transition-all active:scale-95 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-black uppercase">Transmit</span>
              </button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
};

export default OraclePage;