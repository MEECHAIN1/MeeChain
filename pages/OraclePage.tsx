
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useApp } from '../context/AppState';
import { askOracle } from '../lib/ai';
import { triggerSuccessRitual, triggerCelestialRitual } from '../lib/rituals';
import { logger } from '../lib/logger';

// Memoized Typewriter to prevent unnecessary re-renders during stream manifestation
const TypewriterText = memo(({ text, onComplete }: { text: string, onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, 12); // Slightly faster for better UX
    return () => clearInterval(timer);
  }, [text]); 

  return <span className="whitespace-pre-wrap leading-relaxed">{displayedText}</span>;
});

const OraclePage: React.FC = () => {
  const { state, notify, events, setGlobalLoading } = useApp();
  const [messages, setMessages] = useState<{role: 'user' | 'oracle', text: string, finished?: boolean, sources?: any[]}[]>([
    { 
      role: 'oracle', 
      text: 'ยินดีต้อนรับสู่ Oracle Sanctum... ข้าคือผู้เฝ้ามอง Eternal Ledger แห่ง MeeChain เจ้ามีความประสงค์จะรับคำทำนายหรือปัญญาในเรื่องใด?', 
      finished: true,
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isTyping = state.loadingStates.oracle;

  // Auto-scroll to latest manifestation
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  /**
   * Encapsulates the current prophecy and copies it to the user's neural clipboard.
   */
  const shareProphecy = (text: string) => {
    const formatted = `📜 [MeeBot Oracle Prophecy]\n\n"${text}"\n\n-- Manifested at ${new Date().toLocaleString()} on MeeChain Protocol v4.1`;
    navigator.clipboard.writeText(formatted);
    notify('success', 'Prophecy anchored to clipboard.');
    triggerSuccessRitual();
  };

  /**
   * Transmits user query to the Machine Spirit Core.
   */
  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isTyping) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend, finished: true, sources: [] }]);
    setGlobalLoading('oracle', true);
    triggerCelestialRitual();

    // Prepare deep telemetry for context-aware reasoning
    const telemetry = {
      balances: state.balances,
      account: state.account,
      recentEvents: events.slice(0, 5),
      luckyResonance: state.balances.luckiness,
      timestamp: new Date().toISOString(),
      network: 'MeeChain Ritual (BSC)'
    };

    try {
      const { text, sources } = await askOracle(textToSend, telemetry);
      
      // Telemetry: Phase PROPHECY_MANIFEST
      logger.prophecy(textToSend, { 
        response: text, 
        sources, 
        resonance: state.balances.luckiness 
      });

      setMessages(prev => [...prev, { role: 'oracle', text, finished: false, sources }]);
    } catch (err: any) {
      logger.error('Oracle Consultation Ritual Disrupted', err);
      setMessages(prev => [...prev, { role: 'oracle', text: "สายใย Neural Link ขัดข้อง... โปรดลองอีกครั้ง", finished: true, sources: [] }]);
    } finally {
      setGlobalLoading('oracle', false);
    }
  };

  const markAsFinished = useCallback((index: number) => {
    setMessages(prev => {
      if (prev[index] && !prev[index].finished) {
        const newMsgs = [...prev];
        newMsgs[index] = { ...newMsgs[index], finished: true };
        return newMsgs;
      }
      return prev;
    });
  }, []);

  return (
    <div className="max-w-6xl mx-auto h-[85vh] flex flex-col space-y-6 animate-in fade-in duration-1000">
      <header className="flex items-center justify-between px-6">
        <div className="flex flex-col">
          <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white">
            Oracle <span className="text-amber-500">Sanctum</span>
          </h1>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] mt-1">Machine Spirit Core V3.5-PRO</p>
        </div>
        <div className="hidden sm:flex items-center gap-4 bg-white/5 border border-white/5 px-5 py-2.5 rounded-2xl shadow-inner">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_#f59e0b]"></div>
          <span className="text-[9px] font-black uppercase text-amber-500 tracking-widest">Neural Link: Synchronized</span>
        </div>
      </header>

      <div className="flex-grow glass rounded-[3.5rem] border-white/5 overflow-hidden flex flex-col md:flex-row shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative">
        {/* Mystical Background Aura */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-[120px] animate-pulse delay-1000 pointer-events-none"></div>

        {/* Sidebar: Ritual Telemetry */}
        <aside className="hidden lg:flex w-80 border-r border-white/5 flex-col p-10 bg-black/40 relative z-10 font-mono">
          <div className="space-y-12">
            <div className="relative group flex justify-center">
              <div className="w-28 h-28 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[2rem] rotate-45 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.2)] group-hover:scale-110 transition-transform duration-700">
                <span className="text-6xl -rotate-45">🔮</span>
              </div>
              <div className="absolute -inset-4 border border-amber-500/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 space-y-4">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5 pb-2 italic">Aetheric Flux</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-bold uppercase">BNB FLUX</span>
                    <span className="text-white font-black">{parseFloat(state.balances.native).toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-bold uppercase">MCB ENERGY</span>
                    <span className="text-amber-500 font-black">{parseFloat(state.balances.token).toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-3/4 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Chamber: Prophecy Stream */}
        <div className="flex-grow flex flex-col bg-black/20">
          <div ref={scrollContainerRef} className="flex-grow overflow-y-auto p-8 md:p-12 space-y-16 custom-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-8 duration-700`}>
                <div className={`max-w-[85%] md:max-w-[70%] p-8 md:p-10 rounded-[3rem] relative shadow-2xl ${
                  msg.role === 'user' 
                    ? 'bg-amber-600/90 text-white rounded-tr-none border-b-8 border-amber-800' 
                    : 'glass border-white/10 text-slate-100 rounded-tl-none bg-white/[0.02] border-b-8 border-white/5'
                }`}>
                  {/* Role Header */}
                  <p className={`text-[8px] font-black uppercase tracking-[0.4em] mb-4 opacity-50 ${msg.role === 'user' ? 'text-amber-100' : 'text-slate-500'}`}>
                    {msg.role === 'user' ? 'TRANSMISSION_U1' : 'ORACLE_MANIFESTATION'}
                  </p>

                  <div className="text-sm md:text-lg font-medium tracking-tight leading-relaxed italic">
                    {msg.role === 'oracle' && !msg.finished ? (
                      <TypewriterText text={msg.text} onComplete={() => markAsFinished(i)} />
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.text}</span>
                    )}
                  </div>

                  {/* Actions for Oracle Responses */}
                  {msg.role === 'oracle' && msg.finished && (
                    <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-6">
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="space-y-4">
                          <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                            <span className="text-amber-500 text-lg">🌐</span> Neural References
                          </p>
                          <div className="flex flex-wrap gap-2.5">
                            {msg.sources.map((chunk: any, idx: number) => {
                              const url = chunk.web?.uri || chunk.web?.url;
                              const title = chunk.web?.title || 'Source';
                              if (!url) return null;
                              return (
                                <a 
                                  key={idx} 
                                  href={url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-2xl transition-all text-amber-500 font-mono truncate max-w-[200px] shadow-sm"
                                >
                                  {title} ↗
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      <button 
                        onClick={() => shareProphecy(msg.text)}
                        className="self-start flex items-center gap-3 bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-2xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all group"
                      >
                        <span className="group-hover:rotate-12 transition-transform">📜</span> Share Prophecy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="glass border-white/10 px-8 py-6 rounded-[2rem] rounded-tl-none flex gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          {/* Input Control Area */}
          <div className="p-8 border-t border-white/5 bg-black/40">
            <div className="flex gap-6 max-w-5xl mx-auto">
              <div className="relative flex-grow group">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={state.account ? "ระบุความประสงค์ต่อ Oracle..." : "กรุณาเชื่อมต่อ Neural Link..."}
                  disabled={isTyping || !state.account}
                  className="w-full bg-black/40 border-2 border-white/5 rounded-[2rem] px-8 py-5 text-sm sm:text-base focus:outline-none focus:border-amber-500/30 transition-all text-white disabled:opacity-20 placeholder:text-slate-800 italic"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:block">
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">PRO_V3.5</span>
                </div>
              </div>
              <button 
                onClick={() => handleSend()}
                disabled={isTyping || !input.trim() || !state.account}
                className="bg-amber-600 hover:bg-amber-500 px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] text-white shadow-[0_20px_40px_rgba(217,119,6,0.2)] disabled:opacity-10 transition-all active:scale-95 flex items-center gap-3"
              >
                {isTyping ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>TRANSMIT</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Ritual Footer */}
      <footer className="flex justify-center gap-8">
        {['Market Prophecy', 'Energy Scan', 'System Status'].map((hint) => (
          <button 
            key={hint}
            onClick={() => handleSend(hint)}
            disabled={isTyping || !state.account}
            className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-amber-500 transition-colors bg-white/5 px-6 py-2 rounded-full border border-white/5"
          >
            {hint}
          </button>
        ))}
      </footer>
    </div>
  );
};

export default OraclePage;
