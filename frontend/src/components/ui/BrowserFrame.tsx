import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

interface BrowserFrameProps {
  children: React.ReactNode;
  url?: string;
  stationName?: string;
  className?: string;
}

export const BrowserFrame: React.FC<BrowserFrameProps> = ({
  children,
  url = 'https://checkpoint.border.gov/dossier/CP-9812-A01',
  stationName = 'STATION ALPHA-01',
  className = '',
}) => {
  return (
    <div className={`rounded-xl border border-[#D0D5CA] dark:border-[#2D3949] bg-[#FFFFFF] dark:bg-[#1B2430] shadow-sm overflow-hidden flex flex-col transition-colors duration-200 ${className}`}>
      {/* Browser Chrome Header */}
      <div className="bg-[#EAEBE3] dark:bg-[#14161C] border-b border-[#D0D5CA] dark:border-[#2D3949] px-3.5 py-2.5 flex items-center justify-between gap-3 select-none">
        {/* Window controls */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#D0D5CA] dark:bg-[#2D3949] border border-[#B0B7A6] dark:border-[#3D4B5C]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#D0D5CA] dark:bg-[#2D3949] border border-[#B0B7A6] dark:border-[#3D4B5C]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#D0D5CA] dark:bg-[#2D3949] border border-[#B0B7A6] dark:border-[#3D4B5C]" />
        </div>

        {/* Address / Status Bar */}
        <div className="flex-1 max-w-md mx-auto flex items-center justify-center space-x-2 bg-[#FFFFFF] dark:bg-[#1B2430] border border-[#D0D5CA] dark:border-[#2D3949] px-3 py-1 rounded-md text-[11px] font-mono text-[#526071] dark:text-[#9DA3A0]">
          <Lock className="w-3 h-3 text-[#1B2430]/70 dark:text-[#EAEBE3]/70 shrink-0" />
          <span className="truncate">{url}</span>
        </div>

        {/* Station Indicator */}
        <div className="hidden sm:flex items-center space-x-1.5 text-[10px] font-mono font-semibold text-[#1B2430] dark:text-[#EAEBE3] uppercase shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3F4A2C] dark:bg-[#6B7D46]" />
          <span>{stationName}</span>
        </div>
      </div>

      {/* Frame Viewport Content */}
      <div className="bg-[#F4F5F0] dark:bg-[#222B38] overflow-hidden flex-1">
        {children}
      </div>
    </div>
  );
};
