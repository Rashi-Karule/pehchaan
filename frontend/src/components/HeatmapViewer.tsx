import React, { useState } from 'react';
import { Layers, Eye, AlertTriangle, ShieldCheck, ZoomIn, Info } from 'lucide-react';
import { TamperingDetectionResult } from '../types';

interface HeatmapViewerProps {
  previewUrl: string;
  tampering: TamperingDetectionResult;
}

export const HeatmapViewer: React.FC<HeatmapViewerProps> = ({ previewUrl, tampering }) => {
  const [opacity, setOpacity] = useState<number>(65);
  const [showDifference, setShowDifference] = useState<boolean>(true);

  const {
    ela_score,
    copy_move_score,
    tampering_score,
    is_tampered,
    heatmap_url,
    cloned_regions_count,
    ela_anomaly_detected,
    copy_move_detected,
    details
  } = tampering;

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 shadow-xl flex flex-col h-full">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-slate-100 text-sm tracking-wide">
            Tampering & Forensic Heatmap
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded border ${
              is_tampered
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
            }`}
          >
            {is_tampered ? 'TAMPERING DETECTED' : 'UNALTERED BASELINE'}
          </span>
        </div>
      </div>

      {/* Interactive Opacity Controls */}
      <div className="my-3 p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 flex-1 min-w-[200px]">
          <span className="text-slate-400 font-mono flex items-center space-x-1">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Heatmap Overlay:</span>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="font-mono font-bold text-cyan-400 w-9 text-right">{opacity}%</span>
        </div>

        {/* Preset Quick Toggles */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setOpacity(0)}
            className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
              opacity === 0 ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Original
          </button>
          <button
            onClick={() => setOpacity(50)}
            className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
              opacity === 50 ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            50% Blend
          </button>
          <button
            onClick={() => setOpacity(100)}
            className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
              opacity === 100 ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Heatmap 100%
          </button>
        </div>
      </div>

      {/* Layered Document Display */}
      <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center min-h-[300px] max-h-[420px] group">
        {/* Original Document Layer */}
        <img
          src={previewUrl}
          alt="Identity Document"
          className="w-full h-auto max-h-[400px] object-contain select-none"
        />

        {/* Heatmap Overlay Layer with adjustable opacity */}
        {heatmap_url && (
          <img
            src={heatmap_url}
            alt="Forensic Heatmap Overlay"
            style={{ opacity: opacity / 100 }}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-150 mix-blend-screen"
          />
        )}

        {/* Overlay HUD Badges */}
        <div className="absolute top-2 left-2 flex items-center space-x-1.5 pointer-events-none">
          <span className="px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-[10px] font-mono text-cyan-400 border border-cyan-500/30">
            ELA + COPY-MOVE OVERLAY
          </span>
        </div>
      </div>

      {/* Forensic Diagnostics Grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-[10px] uppercase font-mono text-slate-400">Error Level (ELA)</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-base font-mono font-black text-slate-100">{ela_score}/100</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                ela_anomaly_detected ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {ela_anomaly_detected ? 'ANOMALY' : 'NORMAL'}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-[10px] uppercase font-mono text-slate-400">Copy-Move Clones</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-base font-mono font-black text-slate-100">{cloned_regions_count} Cloned</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                copy_move_detected ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {copy_move_detected ? 'FORGERY' : 'CLEAN'}
            </span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="text-[10px] uppercase font-mono text-slate-400">Composite Tamper</div>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-base font-mono font-black ${is_tampered ? 'text-rose-400' : 'text-emerald-400'}`}>
              {tampering_score}%
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                is_tampered ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {is_tampered ? 'SUSPICIOUS' : 'GENUINE'}
            </span>
          </div>
        </div>
      </div>

      {/* Forensic Log / Notes */}
      {details && details.length > 0 && (
        <div className="mt-3 p-2.5 rounded bg-slate-950/40 border border-slate-800/60 text-[11px] text-slate-400 font-mono space-y-1">
          {details.map((d, i) => (
            <div key={i} className="flex items-start space-x-1.5">
              <span className="text-cyan-400">›</span>
              <span>{d}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
