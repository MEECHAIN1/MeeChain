import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppState';
import { askOracle } from '../lib/ai';
import { triggerSuccessRitual, triggerCelestialRitual } from '../lib/rituals';
import { Send, Cpu, Sparkles, MessageSquare, Terminal } from 'lucide-react';

const TypewriterText: React.FC<{ text: string, onComplete?: () => void }> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        onComplete?.();
      }
    }, 20);
    return () => clearInterval(timer);
  }, [text]);

  return <span className="whitespace-pre-wrap leading-relaxed antialiased font-medium">{displayedText}</span>;
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
    <div className="max-w-5xl mx-auto h-[85vh] flex flex-col space-y-4 animate-in fade-in duration-700 font-sans">
      {/* 🔮 Advanced Header */}
      <header className="flex items-center justify-between px-6 py-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/20 p-2 rounded-lg">
            <Sparkles className="text-amber-500 w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase flex items-center gap-2">
              Oracle <span className="text-amber-500">Sanctum</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Neural Core V3.5-PRO Active</p>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 border-l border-white/10 pl-6 text-slate-400">
          <div className="text-right">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Chain Protocol</p>
            <p className="text-[10px] font-mono font-bold text-white">MeeChain Mainnet</p>
          </div>
        </div>
      </header>

      <div className="flex-grow flex flex-col md:flex-row gap-4 overflow-hidden">
        {/* 📟 Sidebar Telemetry */}
        <aside className="w-full md:w-64 flex flex-col gap-4">
          <div className="glass rounded-[2rem] p-6 border-white/5 bg-black/40 flex flex-col gap-6 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-700" />
            
            <div className="flex flex-col items-center gap-3 relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 transform hover:rotate-6 transition-transform">
                <Cpu className="text-black w-7 h-7" />
              </div>
              <p className="text-[10px] font-black text-amber-500 tracking-[0.3em] uppercase italic">Spirit Link</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="w-3 h-3 text-slate-500" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">User Telemetry</p>
                </div>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                    <span className="text-[9px] text-slate-500 font-bold">MCB FLUX</span>
                    <span className="text-xs font-mono font-black text-white">{parseFloat(state.balances.native).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg">
                    <span className="text-[9px] text-slate-500 font-bold">ENERGY</span>
                    <span className="text-xs font-mono font-black text-amber-500">{parseFloat(state.balances.token).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* 💬 Optimized Chat Feed */}
        <section className="flex-grow glass rounded-[2.5rem] border-white/10 bg-black/60 flex flex-col overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
          
          <div ref={scrollContainerRef} className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar relative">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`w-fit max-w-[85%] sm:max-w-[75%] px-5 py-4 rounded-3xl text-sm leading-relaxed shadow-lg ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white rounded-tr-none border border-amber-400/20' 
                    : 'bg-white/10 text-slate-100 border border-white/10 rounded-tl-none backdrop-blur-md'
                }`}>
                  <div className="text-[13px] sm:text-[15px]">
                    {msg.role === 'oracle' && i === messages.length - 1 && !isTyping ? (
                      <TypewriterText text={msg.text} onComplete={() => i > 0 && triggerSuccessRitual()} />
                    ) : (
                      <span className="antialiased font-medium whitespace-pre-wrap leading-relaxed">{msg.text}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white/5 border border-white/10 px-5 py-4 rounded-3xl rounded-tl-none flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* ⌨️ Interaction Field */}
          <footer className="p-4 sm:p-6 bg-black/40 border-t border-white/5 space-y-4">
            {!isTyping && messages.length === 1 && (
              <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {suggestions.map((s, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleSend(s)}
                    className="text-[10px] font-bold text-slate-400 hover:text-amber-500 border border-white/5 hover:border-amber-500/50 bg-white/5 hover:bg-amber-500/5 px-4 py-2 rounded-full transition-all active:scale-95"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <div className="flex-grow relative group">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={state.account ? "ระบุความประสงค์ต่อ Oracle..." : "กรุณาเชื่อมต่อ Neural Link..."}
                  disabled={isTyping || !state.account}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all text-white disabled:opacity-30 placeholder:text-slate-600"
                />
                <MessageSquare className="absolute right-5 top-4 w-4 h-4 text-slate-600 group-focus-within:text-amber-500 transition-colors" />
              </div>
              <button 
                onClick={() => handleSend()}
                disabled={isTyping || !input.trim() || !state.account}
                className="bg-amber-600 hover:bg-amber-500 px-7 py-4 rounded-2xl text-white shadow-xl disabled:opacity-20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Transmit</span>
              </button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
};

export default OraclePage;