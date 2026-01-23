
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useApp } from '../context/AppState';
import { triggerSuccessRitual } from '../lib/rituals';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { state, notify, connectWallet, disconnectWallet } = useApp();
  const { isConnected, address } = useAccount();
  const { connectors } = useConnect();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Summon', path: '/summon', icon: '🌀' },
    { label: 'Factory', path: '/mint', icon: '🏭' },
    { label: 'Gallery', path: '/gallery', icon: '🖼️' },
    { label: 'Staking', path: '/staking', icon: '⚙️' },
    { label: 'Swap', path: '/swap', icon: '⇅' },
    { label: 'Oracle', path: '/oracle', icon: '🔮' }
  ];

  const handleConnect = async (connector: any) => {
    try {
      setShowWalletModal(false);
      await connectWallet(connector);
      triggerSuccessRitual();
    } catch (err: any) {
      notify('error', `Connection failed: ${err.message}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      setIsMenuOpen(false);
      triggerSuccessRitual();
    } catch (err: any) {
      notify('error', `Disconnection failed: ${err.message}`);
    }
  };

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowWalletModal(false);
      }
    };
    if (showWalletModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showWalletModal]);

  return (
    <nav className="glass sticky top-0 z-[80] px-6 py-4 border-b border-white/5 shadow-2xl bg-[#0f0f0f]/90 backdrop-blur-xl font-mono">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform duration-500">
            <span className="text-black font-black text-xl italic">M</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tighter leading-none italic text-white uppercase">
              MeeChain
            </span>
            <span className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-500">Protocol V5.1.0</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-xl transition-all duration-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group ${
                location.pathname === item.path 
                  ? 'text-amber-500 bg-white/5' 
                  : 'text-slate-500 hover:text-white transition-colors'
              }`}
            >
              <span className="opacity-50 group-hover:opacity-100 transition-opacity">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* Desktop Wallet Section */}
          <div className="hidden sm:flex items-center gap-4">
            {state.account ? (
              <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 pl-4 pr-1.5 py-1.5 rounded-2xl group hover:border-amber-500/20 transition-all">
                <div className="text-right">
                  <p className="text-[6px] text-slate-600 font-black uppercase tracking-[0.3em] mb-0.5">Linked Node</p>
                  <p className="text-[10px] font-mono font-black text-white group-hover:text-amber-500 transition-colors">
                    {state.account.slice(0, 6)}...{state.account.slice(-4)}
                  </p>
                </div>
                <button 
                  onClick={handleDisconnect}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 flex items-center justify-center text-slate-500 transition-all active:scale-90"
                  title="Sever Neural Link"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowWalletModal(true)}
                className="bg-white text-black px-8 py-3 rounded-2xl font-black text-[10px] shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.3em]"
              >
                Link Identity
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 glass rounded-xl flex items-center justify-center text-white text-lg active:scale-90 transition-all border border-white/5"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div ref={modalRef} className="glass w-full max-w-sm p-10 rounded-[3.5rem] border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] space-y-8 relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl"></div>
            
            <div className="text-center space-y-3 relative">
              <div className="w-16 h-16 bg-white/5 rounded-3xl mx-auto flex items-center justify-center text-3xl mb-4 border border-white/5">
                🔗
              </div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Neural Link</h2>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Choose your connection substrate</p>
            </div>
            
            <div className="grid gap-3 relative">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/30 text-left transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      {connector.id === 'injected' ? '🦊' : '📱'}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-white">{connector.name}</p>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Neural Link Standard</p>
                    </div>
                  </div>
                  <span className="text-slate-700 group-hover:text-amber-500 transition-colors">→</span>
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setShowWalletModal(false)}
              className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors"
            >
              Abort Connection
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full glass border-b border-white/5 p-6 animate-in slide-in-from-top-4 duration-300 shadow-2xl z-[70] bg-[#05080f]/95 backdrop-blur-3xl">
          <div className="space-y-4">
            <div className="pb-4 border-b border-white/5">
               {state.account ? (
                 <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-black font-black text-xs">M</div>
                      <div>
                        <p className="text-[7px] text-slate-600 font-black uppercase">Active Link</p>
                        <p className="text-[10px] font-mono font-black text-white">{state.account.slice(0, 8)}...{state.account.slice(-4)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleDisconnect}
                      className="text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-4 py-2 rounded-xl"
                    >
                      Sever
                    </button>
                 </div>
               ) : (
                 <button 
                   onClick={() => setShowWalletModal(true)}
                   className="w-full bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg"
                 >
                   Link Identity
                 </button>
               )}
            </div>
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`w-full p-4 rounded-2xl flex items-center justify-between text-xs font-black uppercase tracking-widest transition-all ${
                    location.pathname === item.path 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <span className="opacity-20">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
