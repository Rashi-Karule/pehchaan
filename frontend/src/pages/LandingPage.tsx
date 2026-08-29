import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Scan,
  Binary,
  Layers,
  ScanFace,
  FileCheck2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Eye,
  AlertTriangle
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-grid-pattern">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BORDER CONTROL DOCUMENT SCREENING SYSTEM</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-100 tracking-tight leading-[1.15]">
            TRUST-LENS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">AI</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-slate-300 font-medium leading-relaxed">
            Real-time identity document screening and forensic verification for border checkpoint officers.
          </p>

          {/* Single Primary Call-to-Action */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/upload"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-base shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all"
            >
              <Scan className="w-5 h-5 text-slate-950" />
              <span>Start Document Verification</span>
              <ArrowRight className="w-5 h-5 text-slate-950" />
            </Link>
          </div>
        </div>

        {/* 4 Specialized Screening Modules Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Module 1 */}
          <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm hover:border-cyan-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <Scan className="w-6 h-6" />
            </div>
            <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
              Module 1
            </div>
            <h3 className="text-lg font-bold text-slate-100 mt-1">OCR Extraction</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Extracts Name, Date of Birth, Document Number, and Expiry Date with automated contrast enhancement and semantic parsing.
            </p>
          </div>

          {/* Module 2 */}
          <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm hover:border-blue-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
              <Binary className="w-6 h-6" />
            </div>
            <div className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-wider">
              Module 2
            </div>
            <h3 className="text-lg font-bold text-slate-100 mt-1">MRZ Validation</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Validates ICAO 9303 check digits across TD1, TD2, and TD3 zones with standard 7-3-1 weighting checksum calculation.
            </p>
          </div>

          {/* Module 3 */}
          <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm hover:border-indigo-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <div className="text-[11px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
              Module 3
            </div>
            <h3 className="text-lg font-bold text-slate-100 mt-1">Tampering Detection</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Combines Error Level Analysis (ELA) and OpenCV Copy-Move vector clustering into an interactive transparent heatmap overlay.
            </p>
          </div>

          {/* Module 4 */}
          <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm hover:border-emerald-500/40 transition-colors group">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <ScanFace className="w-6 h-6" />
            </div>
            <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
              Module 4
            </div>
            <h3 className="text-lg font-bold text-slate-100 mt-1">Face Verification</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Compares document portrait against live traveler selfie using deep neural facial embeddings (SFace) and cosine distance.
            </p>
          </div>
        </div>
      </div>

      {/* Terminal Footer Info */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-4 px-4 text-center text-xs font-mono text-slate-500">
        TRUST-LENS AI Screening Console • ICAO Doc 9303 Compliant • Tactical Edition
      </footer>
    </div>
  );
};
