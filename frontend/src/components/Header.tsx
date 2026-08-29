import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, ShieldAlert, Scan, FileSearch, CheckCircle2, Terminal } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Terminal Info */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold tracking-wider text-slate-100 text-lg">TRUST-LENS</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded">AI</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                  Border Checkpoint Screening
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-4">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors ${
                location.pathname === '/'
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Overview
            </Link>
            <Link
              to="/upload"
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors ${
                location.pathname === '/upload'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800/80 text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/30'
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span>Verify Document</span>
            </Link>
          </nav>

          {/* System Status Beacon */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>STATION: CP-ALPHA-01</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">ICAO 9303 ENG ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
