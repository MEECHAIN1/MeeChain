
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import WalletConnectButton from './WalletConnectButton';

const Navbar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Staking', path: '/staking' },
    { label: 'Swap', path: '/swap' },
    { label: 'Oracle', path: '/oracle' },
    { label: 'Logs', path: '/logs' }
  ];

  return (
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

        <WalletConnectButton />
      </div>
    </nav>
  );
};

export default Navbar;
