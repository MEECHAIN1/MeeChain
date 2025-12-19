
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppState';
import { askOracle } from '../lib/ai';
import { triggerSuccessRitual, triggerCelestialRitual } from '../lib/rituals';

const TypewriterText: React.FC<{ text: string, onComplete?: () => void }> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  
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
    }, 25);
    return () => clearInterval(timer);
  }, [text]);

  return <span>{displayedText}</span>;
};

const OraclePage: React.FC = () => {
  const { state, notify } = useApp();
  const [messages, setMessages] = useState<{role: 'user' | 'oracle', text: string}[]>([
    { role: 'oracle', text: 'ยินดีต้อนรับสู่ Core of Knowledge... ข้าสัมผัสได้ถึง Energy Flux ของเจ้าผ่าน Neural Link เจ้าต้องการคำชี้แนะในการทำ Ritual หรือไม่?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);
    triggerCelestialRitual();

    // Passing current balances as telemetry context
    const response = await askOracle(userText, state.balances);
    
    setMessages(prev => [...prev, { role: 'oracle', text: response || '' }]);
    setIsTyping(false);
  };

  const handleShare = (text: string) => {
    const shareText = `🔮 MeeBot Oracle Prophecy:\n"${text}"\n\nAscend via MeeChain: meebot.meechain.io ⚡`;
    if (navigator.share) {
      navigator.share({
        title: 'MeeBot Oracle Prophecy',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      notify('success', 'คัดลอกคำพยากรณ์ไปยัง Neural Clipboard แล้ว ✨');
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col space-y-6 animate-in fade-in duration-1000">
      <header className="text-center space-y-2">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-sky-500 blur-2xl opacity-20 animate-pulse"></div>
          <h1 className="relative text-5xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-sky-400">
            Oracle <span className="text-white">Sanctum</span>
          </h1>
        </div>
        <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Neural Protocol v3.1.4 • Collective Access Only</p>
      </header>

      <div className="flex-grow glass rounded-[3rem] border-white/5 overflow-hidden flex flex-col md:flex-row relative shadow-2xl">
        {/* Oracle Sidebar Visual */}
        <div className="hidden md:flex w-1/3 border-r border-white/5 bg-gradient-to-b from-indigo-500/5 to-transparent flex-col items-center justify-center p-8 space-y-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border border-sky-500/20 animate-spin-slow"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-sky-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="w-10 h-10 meebot-gradient rounded-full shadow-2xl shadow-amber-500/50 flex items-center justify-center relative">
                 <span className="text-xl animate-bounce">🔮</span>
              </div>
            </div>
          </div>
          <div className="text-center space-y-4">
             <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">
               Stream Status: Optimal
             </div>
             <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase italic px-4">
               The Oracle observes all energy vectors across the MeeChain Collective.
             </p>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-grow flex flex-col relative">
          <div className="absolute inset-0 bg-indigo-500/[0.01] pointer-events-none"></div>
          
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-6 custom-scrollbar relative z-10">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}>
                <div className={`max-w-[90%] p-6 rounded-[2rem] relative group transition-all duration-300 ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600/90 text-white rounded-tr-none shadow-xl shadow-indigo-500/10' 
                    : 'glass border-white/10 text-indigo-50 rounded-tl-none bg-white/[0.03]'
                } border border-white/5`}>
                  <p className="text-sm font-medium leading-relaxed tracking-tight">
                    {msg.role === 'oracle' && i === messages.length - 1 && !isTyping ? (
                      <TypewriterText text={msg.text} onComplete={triggerSuccessRitual} />
                    ) : (
                      msg.text
                    )}
                  </p>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
                    <p className="text-[8px] font-black uppercase opacity-40 tracking-widest italic flex items-center gap-2">
                      <span className={`w-1 h-1 rounded-full ${msg.role === 'user' ? 'bg-white' : 'bg-indigo-400'}`}></span>
                      {msg.role === 'user' ? 'Member Uplink' : 'Oracle Insight'}
                    </p>
                    {msg.role === 'oracle' && !isTyping && (
                      <button 
                        onClick={() => handleShare(msg.text)}
                        className="opacity-20 group-hover:opacity-100 transition-opacity text-[8px] font-black uppercase tracking-widest text-indigo-400 hover:text-white bg-white/5 px-2 py-1 rounded-md"
                      >
                        Capture Prophecy ↗
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="glass border-white/10 p-6 rounded-[2rem] rounded-tl-none">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 glass border-t border-white/5 relative z-10 bg-black/20">
            <div className="flex gap-4">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Submit your query to the Eternal Core..."
                className="flex-grow bg-black/40 border-2 border-white/5 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-indigo-500/40 transition-all placeholder:text-slate-700 text-white tracking-tight"
                disabled={isTyping}
              />
              <button 
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
                className="bg-white text-black hover:bg-indigo-50 disabled:opacity-30 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-white/5"
              >
                {isTyping ? 'LINKING...' : 'TRANSMIT'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center opacity-20">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] italic">Encrypted Session • MeeChain Collective Infrastructure</p>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default OraclePage;
