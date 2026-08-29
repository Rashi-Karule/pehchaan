import React, { useState } from 'react';
import { Layers, Eye } from 'lucide-react';
import { TamperingDetectionResult } from '../types';

import { AuthImage } from './ui/AuthImage';

interface HeatmapViewerProps {
  previewUrl: string;
  tampering: TamperingDetectionResult;
}

export const HeatmapViewer: React.FC<HeatmapViewerProps> = ({ previewUrl, tampering }) => {
  const [opacity, setOpacity] = useState<number>(65);

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
    <div className="bg-[#FFFFFF] dark:bg-[#1B2430] rounded-xl border border-[#D0D5CA] dark:border-[#2D3949] p-5 shadow-xs flex flex-col h-full transition-colors duration-200">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D0D5CA] dark:border-[#2D3949]">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#1B2430] dark:text-[#EAEBE3]" />
          <h3 className="font-extrabold text-[#1B2430] dark:text-[#EAEBE3] text-sm">
            Tampering & Forensic Heatmap
          </h3>
        </div>
        <div>
          <span
            className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded border-2 uppercase ${
              is_tampered
                ? 'bg-[#FFFFFF] dark:bg-[#1B2430] text-[#A23B2E] dark:text-[#C24B3B] border-[#7A2A20] dark:border-[#9E3528]'
                : 'bg-[#FFFFFF] dark:bg-[#1B2430] text-[#3F4A2C] dark:text-[#6B7D46] border-[#3F4A2C] dark:border-[#6B7D46]'
            }`}
          >
            {is_tampered ? 'TAMPERING DETECTED' : 'UNALTERED BASELINE'}
          </span>
        </div>
      </div>

      {/* Interactive Opacity Controls */}
      <div className="my-3 p-3 bg-[#F4F5F0] dark:bg-[#222B38] rounded-lg border border-[#D0D5CA] dark:border-[#2D3949] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 flex-1 min-w-[190px]">
          <span className="text-[#526071] dark:text-[#9DA3A0] font-mono text-[11px] flex items-center space-x-1">
            <Eye className="w-3.5 h-3.5 text-[#1B2430] dark:text-[#EAEBE3]" />
            <span>Overlay Blend:</span>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full h-1.5 bg-[#D0D5CA] dark:bg-[#2D3949] rounded-lg appearance-none cursor-pointer accent-[#1B2430] dark:accent-[#EAEBE3]"
          />
          <span className="font-mono font-bold text-[#1B2430] dark:text-[#EAEBE3] w-9 text-right">{opacity}%</span>
        </div>

        {/* Preset Quick Toggles */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setOpacity(0)}
            className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
              opacity === 0
                ? 'bg-[#1B2430] dark:bg-[#EAEBE3] text-[#FFFFFF] dark:text-[#14161C] font-bold'
                : 'bg-[#E2E4DC] dark:bg-[#181F28] text-[#526071] dark:text-[#9DA3A0] hover:text-[#1B2430] dark:hover:text-[#EAEBE3] border border-[#D0D5CA] dark:border-[#2D3949]'
            }`}
          >
            Original
          </button>
          <button
            onClick={() => setOpacity(50)}
            className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
              opacity === 50
                ? 'bg-[#1B2430] dark:bg-[#EAEBE3] text-[#FFFFFF] dark:text-[#14161C] font-bold'
                : 'bg-[#E2E4DC] dark:bg-[#181F28] text-[#526071] dark:text-[#9DA3A0] hover:text-[#1B2430] dark:hover:text-[#EAEBE3] border border-[#D0D5CA] dark:border-[#2D3949]'
            }`}
          >
            50% Blend
          </button>
          <button
            onClick={() => setOpacity(100)}
            className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
              opacity === 100
                ? 'bg-[#1B2430] dark:bg-[#EAEBE3] text-[#FFFFFF] dark:text-[#14161C] font-bold'
                : 'bg-[#E2E4DC] dark:bg-[#181F28] text-[#526071] dark:text-[#9DA3A0] hover:text-[#1B2430] dark:hover:text-[#EAEBE3] border border-[#D0D5CA] dark:border-[#2D3949]'
            }`}
          >
            Heatmap 100%
          </button>
        </div>
      </div>

      {/* Layered Document Display */}
      <div className="relative rounded-lg overflow-hidden border border-[#D0D5CA] dark:border-[#2D3949] bg-[#E2E4DC] dark:bg-[#181F28] p-1 flex items-center justify-center min-h-[290px] max-h-[400px]">
        {/* Original Document Layer */}
        <AuthImage
          src={previewUrl}
          alt="Identity Document"
          className="w-full h-auto max-h-[380px] object-contain select-none rounded"
        />

        {/* Heatmap Overlay Layer with adjustable opacity */}
        {heatmap_url && (
          <AuthImage
            src={heatmap_url}
            alt="Forensic Heatmap Overlay"
            style={{ opacity: opacity / 100 }}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-150 mix-blend-multiply dark:mix-blend-screen rounded p-1"
          />
        )}

        {/* Overlay Badge */}
        <div className="absolute top-2 left-2 flex items-center space-x-1.5 pointer-events-none">
          <span className="px-2 py-0.5 rounded bg-[#FFFFFF]/90 dark:bg-[#1B2430]/90 text-[9px] font-mono font-bold text-[#1B2430] dark:text-[#EAEBE3] border border-[#D0D5CA] dark:border-[#2D3949] shadow-2xs">
            ELA + COPY-MOVE MATRIX
          </span>
        </div>
      </div>

      {/* Forensic Diagnostics Grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-2.5 rounded-lg bg-[#F4F5F0] dark:bg-[#222B38] border border-[#D0D5CA] dark:border-[#2D3949]">
          <div className="text-[9px] uppercase font-mono text-[#526071] dark:text-[#9DA3A0] font-bold">Error Level (ELA)</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-base font-mono font-black text-[#1B2430] dark:text-[#EAEBE3]">{ela_score}/100</span>
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border-2 ${
                ela_anomaly_detected ? 'bg-[#FFFFFF] dark:bg-[#1B2430] text-[#A23B2E] dark:text-[#C24B3B] border-[#7A2A20] dark:border-[#9E3528]' : 'bg-[#FFFFFF] dark:bg-[#1B2430] text-[#3F4A2C] dark:text-[#6B7D46] border-[#3F4A2C] dark:border-[#6B7D46]'
              }`}
            >
              {ela_anomaly_detected ? 'ANOMALY' : 'NORMAL'}
            </span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-[#F4F5F0] dark:bg-[#222B38] border border-[#D0D5CA] dark:border-[#2D3949]">
          <div className="text-[9px] uppercase font-mono text-[#526071] dark:text-[#9DA3A0] font-bold">Copy-Move Clones</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-base font-mono font-black text-[#1B2430] dark:text-[#EAEBE3]">{cloned_regions_count} Cloned</span>
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border-2 ${
                copy_move_detected ? 'bg-[#FFFFFF] dark:bg-[#1B2430] text-[#A23B2E] dark:text-[#C24B3B] border-[#7A2A20] dark:border-[#9E3528]' : 'bg-[#FFFFFF] dark:bg-[#1B2430] text-[#3F4A2C] dark:text-[#6B7D46] border-[#3F4A2C] dark:border-[#6B7D46]'
              }`}
            >
              {copy_move_detected ? 'FORGERY' : 'CLEAN'}
            </span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg bg-[#F4F5F0] dark:bg-[#222B38] border border-[#D0D5CA] dark:border-[#2D3949]">
          <div className="text-[9px] uppercase font-mono text-[#526071] dark:text-[#9DA3A0] font-bold">Composite Tamper</div>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-base font-mono font-black ${is_tampered ? 'text-[#A23B2E] dark:text-[#C24B3B]' : 'text-[#3F4A2C] dark:text-[#6B7D46]'}`}>
              {tampering_score}%
            </span>
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border-2 ${
                is_tampered ? 'bg-[#FFFFFF] dark:bg-[#1B2430] text-[#A23B2E] dark:text-[#C24B3B] border-[#7A2A20] dark:border-[#9E3528]' : 'bg-[#FFFFFF] dark:bg-[#1B2430] text-[#3F4A2C] dark:text-[#6B7D46] border-[#3F4A2C] dark:border-[#6B7D46]'
              }`}
            >
              {is_tampered ? 'SUSPICIOUS' : 'GENUINE'}
            </span>
          </div>
        </div>
      </div>

      {/* Forensic Log / Notes */}
      {details && details.length > 0 && (
        <div className="mt-3 p-2.5 rounded-lg bg-[#E2E4DC] dark:bg-[#181F28] border border-[#D0D5CA] dark:border-[#2D3949] text-[10px] text-[#1B2430] dark:text-[#EAEBE3] font-mono space-y-1">
          {details.map((d, i) => (
            <div key={i} className="flex items-start space-x-1.5">
              <span className="text-[#526071] dark:text-[#9DA3A0] font-bold">›</span>
              <span>{d}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
