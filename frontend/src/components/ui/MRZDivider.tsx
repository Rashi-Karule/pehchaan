import React from 'react';

interface MRZDividerProps {
  text?: string;
  secondaryText?: string;
  variant?: 'single' | 'double' | 'dense';
  className?: string;
  opacity?: string;
}

export const MRZDivider: React.FC<MRZDividerProps> = ({
  text = 'P<UTOPEHCHAAN<<INSPECTION<<DOC<SYSTEM<ICAO<9303<STATION<ALPHA<01<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
  secondaryText = 'L898902C33UTO7408122F1204159ZE184226B<<<<<<<10<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
  variant = 'single',
  className = '',
  opacity = 'opacity-30'
}) => {
  return (
    <div className={`w-full overflow-hidden select-none py-1.5 ${className}`} aria-hidden="true">
      <div className={`font-mono text-[10px] sm:text-[11px] font-bold text-[#1B2430] tracking-[0.22em] uppercase whitespace-nowrap overflow-hidden leading-tight ${opacity}`}>
        <div>{text}</div>
        {(variant === 'double' || variant === 'dense') && (
          <div className="mt-0.5">{secondaryText}</div>
        )}
      </div>
    </div>
  );
};
