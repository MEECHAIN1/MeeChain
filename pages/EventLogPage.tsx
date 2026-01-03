
import React from 'react';
import { useApp } from '../context/AppState';

// EventLogPage component for displaying blockchain event logs
const EventLogPage: React.FC = () => {
  const { events } = useApp();

  const handleExport = () => {
    // Replacer function to handle BigInt serialization
    const jsonString = JSON.stringify(events, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    , 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meebot-ritual-logs-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Live <span className="text-emerald-400">Logs</span></h1>
          <p className="text-slate-400">Real-time monitoring of contract events on MeeChain.</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-white/5 hover:bg-white/10 text-xs font-bold px-6 py-2.5 rounded-xl border border-white/10 transition-all active:scale-95"
        >
          Export JSON
        </button>
      </header>

      <div className="glass rounded-[2rem] overflow-hidden border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-8 py-5">Time</th>
                <th className="px-8 py-5">Event</th>
                <th className="px-8 py-5">Contract</th>
                <th className="px-8 py-5">Details</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {events.length > 0 ? events.map((event) => (
                <tr key={event.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5 text-sm font-mono text-slate-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      event.type === 'Minted' ? 'bg-indigo-500/10 text-indigo-400' :
                      event.type === 'Staked' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-sky-500/10 text-sky-400'
                    }`}>
                      {event.type}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{event.contract}</span>
                  </td>
                  <td className="px-8 py-5 text-xs text-slate-300">
                    {event.amount || `Token #${event.tokenId}`}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <a href={`https://explorer.meechain.com/tx/${event.hash}`} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-emerald-300 font-bold text-xs uppercase tracking-widest">
                      Tx ↗
                    </a>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-600 italic font-medium uppercase tracking-[0.2em]">
                    No ritual logs detected...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Added missing default export
export default EventLogPage;
