
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import WalletConnectButton from './WalletConnectButton';
import { useApp } from '../context/AppState';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { state } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Factory', path: '/mint', icon: '🏭' },
    { label: 'Gallery', path: '/gallery', icon: '🖼️' },
    { label: 'Staking', path: '/staking', icon: '⚙️' },
    { label: 'Swap', path: '/swap', icon: '⇅' },
    { label: 'Oracle', path: '/oracle', icon: '🔮' },
    { label: 'Logs', path: '/logs', icon: '📝' }
  ];

  return (
    <nav className="glass sticky top-0 z-[80] px-6 py-4 border-b border-white/5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform duration-500">
            <span className="text-black font-black text-xl italic">M</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tighter leading-none italic text-white">
              MeeBot <span className="text-amber-500">Chain</span>
            </span>
            <span className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-500">Protocol V3.1</span>
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
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <span className="opacity-50 group-hover:opacity-100 transition-opacity">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Connection Area */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4">
             {state.account && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full animate-in fade-in slide-in-from-right-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">Neural Link Active</span>
                </div>
             )}
             <WalletConnectButton />
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 glass rounded-xl flex items-center justify-center text-white text-lg active:scale-90 transition-all"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full glass border-b border-white/5 p-6 animate-in slide-in-from-top-4 duration-300 shadow-2xl z-[70]">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`w-full p-4 rounded-2xl flex items-center justify-between text-xs font-black uppercase tracking-widest transition-all ${
                  location.pathname === item.path 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span>{item.label}</span>
                <span>{item.icon}</span>
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-white/5 sm:hidden">
               <WalletConnectButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
