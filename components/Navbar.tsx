
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useConnect } from 'wagmi';
import { useApp } from '../context/AppState';
import { triggerSuccessRitual } from '../lib/rituals';

const Navbar: React.FC = () => {
  const { state, connectWallet, disconnectWallet } = useApp();
  const { connectors } = useConnect();
  const location = useLocation();
  const [showConnectors, setShowConnectors] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Staking', path: '/staking' },
    { label: 'Oracle', path: '/oracle' },
    { label: 'Logs', path: '/logs' }
  ];

  const handleConnect = async (connector: any) => {
    setShowConnectors(false);
    await connectWallet(connector);
    triggerSuccessRitual();
  };

  return (
    <>
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <span className="text-black font-black text-xl italic">M</span>
            </div>
            <span className="font-black text-xl tracking-tighter hidden sm:block italic">
              MeeBot <span className="text-amber-500">Chain</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-6">
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg transition-all duration-200 text-[10px] font-black uppercase tracking-widest ${
                  location.pathname === item.path 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/debug" className="px-4 py-2 rounded-lg text-slate-800 hover:text-white transition-all text-[8px] font-black uppercase tracking-widest border border-transparent hover:border-white/5 ml-2">Debug</Link>
          </div>

          {state.account ? (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
              <div className="hidden sm:block text-right">
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Verified Identity</p>
                <p className="text-[10px] font-mono font-bold text-amber-500/80">{state.account.slice(0, 6)}...{state.account.slice(-4)}</p>
              </div>
              <button 
                onClick={disconnectWallet}
                className="text-[10px] font-black text-rose-500/70 hover:text-rose-400 transition-colors uppercase tracking-widest"
              >
                Unlink
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConnectors(true)}
              disabled={state.isConnecting}
              className="bg-white text-black px-6 py-2.5 rounded-xl font-black text-[10px] shadow-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest"
            >
              {state.isConnecting ? 'Syncing...' : 'Link Identity'}
            </button>
          )}
        </div>
      </nav>

      {/* Connection Selection Ritual Overlay */}
      {showConnectors && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass w-full max-w-sm p-8 rounded-[2.5rem] border-white/10 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">Choose Ritual</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select your mechanical identity provider</p>
            </div>
            
            <div className="grid gap-3">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-amber-500/30 transition-all group"
                >
                  <span className="font-black text-sm uppercase tracking-tight group-hover:text-amber-500">{connector.name}</span>
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-lg">
                    {connector.id === 'walletConnect' ? '📱' : '🦊'}
                  </div>
                </button>
              ))}
            </div>

            <button 
              onClick={() => setShowConnectors(false)}
              className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              Cancel Link
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
