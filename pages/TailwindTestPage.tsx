import React from 'react';

const TailwindTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="space-y-6 text-center">
        <div className="w-20 h-20 bg-amber-500 rounded-2xl mx-auto shadow-[0_0_50px_rgba(245,158,11,0.3)] animate-bounce flex items-center justify-center text-3xl">
          🚀
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
          Tailwind <span className="text-amber-500">Engine</span> Status
        </h1>
        <p className="text-slate-500 font-mono text-xs tracking-widest uppercase">
          If you see a bouncing orange box, the CSS ritual is successful.
        </p>
        <div className="grid grid-cols-3 gap-2">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="h-1 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-amber-500 animate-pulse" style={{ width: `${(i+1)*30}%` }}></div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default TailwindTestPage;