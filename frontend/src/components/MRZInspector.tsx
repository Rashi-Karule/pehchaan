import React from 'react';
import { Binary, CheckCircle2, XCircle } from 'lucide-react';
import { MRZValidationResult } from '../types';

interface MRZInspectorProps {
  mrz: MRZValidationResult;
}

export const MRZInspector: React.FC<MRZInspectorProps> = ({ mrz }) => {
  const { has_mrz, mrz_type, raw_lines, check_digits, all_valid } = mrz;

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1B2430] rounded-xl border border-[#D0D5CA] dark:border-[#2D3949] p-5 shadow-xs transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D0D5CA] dark:border-[#2D3949]">
        <div className="flex items-center space-x-2">
          <Binary className="w-4 h-4 text-[#1B2430] dark:text-[#EAEBE3]" />
          <h3 className="font-extrabold text-[#1B2430] dark:text-[#EAEBE3] text-sm">
            ICAO 9303 MRZ Validation
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-[#E2E4DC] dark:bg-[#181F28] text-[#526071] dark:text-[#9DA3A0] border border-[#D0D5CA] dark:border-[#2D3949]">
            FORMAT: {mrz_type}
          </span>
          <span
            className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded border-2 uppercase ${
              !has_mrz
                ? 'bg-[#E2E4DC] dark:bg-[#181F28] text-[#526071] dark:text-[#9DA3A0] border-[#D0D5CA] dark:border-[#2D3949]'
                : all_valid
                ? 'bg-[#FFFFFF] dark:bg-[#1B2430] text-[#3F4A2C] dark:text-[#6B7D46] border-[#3F4A2C] dark:border-[#6B7D46]'
                : 'bg-[#FFFFFF] dark:bg-[#1B2430] text-[#A23B2E] dark:text-[#C24B3B] border-[#7A2A20] dark:border-[#9E3528]'
            }`}
          >
            {!has_mrz ? 'NO MRZ DETECTED' : all_valid ? 'PASSED (7-3-1 ICAO)' : 'CHECKSUM FAILED'}
          </span>
        </div>
      </div>

      {!has_mrz ? (
        <div className="my-4 p-4 text-center text-[#526071] dark:text-[#9DA3A0] text-xs font-mono bg-[#F4F5F0] dark:bg-[#222B38] rounded-lg border border-[#D0D5CA] dark:border-[#2D3949]">
          No Machine Readable Zone (MRZ) was detected on this document.
        </div>
      ) : (
        <div className="space-y-4 mt-4">
          {/* Raw Monospace MRZ Display in Recessed Paper Well */}
          <div>
            <div className="text-[10px] uppercase font-mono font-bold text-[#526071] dark:text-[#9DA3A0] mb-1.5 flex items-center justify-between">
              <span>Encoded Machine Readable Zone:</span>
              <span className="text-[#1B2430] dark:text-[#EAEBE3]">{mrz_type} Standard</span>
            </div>
            <div className="bg-[#E2E4DC] dark:bg-[#181F28] p-3.5 rounded-lg border border-[#D0D5CA] dark:border-[#2D3949] font-mono text-xs text-[#1B2430] dark:text-[#EAEBE3] tracking-widest leading-relaxed overflow-x-auto select-all shadow-inner">
              {raw_lines.map((line, idx) => (
                <div key={idx} className="whitespace-pre">
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Check Digits Breakdown */}
          <div>
            <div className="text-[10px] uppercase font-mono font-bold text-[#526071] dark:text-[#9DA3A0] mb-2">
              ICAO 9303 Weighting Algorithm Check Digit Verification:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {check_digits.map((cd, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs font-mono transition-all ${
                    cd.valid
                      ? 'bg-[#F4F5F0] dark:bg-[#222B38] border-[#D0D5CA] dark:border-[#2D3949] text-[#1B2430] dark:text-[#EAEBE3]'
                      : 'bg-[#FFFFFF] dark:bg-[#1B2430] border-2 border-[#A23B2E] dark:border-[#C24B3B] text-[#1B2430] dark:text-[#EAEBE3]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1B2430] dark:text-[#EAEBE3] capitalize text-[11px]">
                      {cd.field_name.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`inline-flex items-center space-x-1 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase border-2 ${
                        cd.valid ? 'bg-[#FFFFFF] dark:bg-[#1B2430] text-[#3F4A2C] dark:text-[#6B7D46] border-[#3F4A2C] dark:border-[#6B7D46]' : 'bg-[#FFFFFF] dark:bg-[#1B2430] text-[#A23B2E] dark:text-[#C24B3B] border-[#7A2A20] dark:border-[#9E3528]'
                      }`}
                    >
                      {cd.valid ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-[#3F4A2C] dark:text-[#6B7D46]" />
                          <span>PASS</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-[#A23B2E] dark:text-[#C24B3B]" />
                          <span>FAIL</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#526071] dark:text-[#9DA3A0]">
                    <div>
                      Printed CD: <strong className="text-[#1B2430] dark:text-[#EAEBE3] font-mono">{cd.check_digit}</strong>
                    </div>
                    <div>
                      Calculated CD: <strong className={cd.valid ? 'text-[#3F4A2C] dark:text-[#6B7D46]' : 'text-[#A23B2E] dark:text-[#C24B3B]'}>{cd.calculated_check_digit}</strong>
                    </div>
                  </div>

                  <div className="mt-1 text-[10px] text-[#526071] dark:text-[#9DA3A0] truncate pt-1 border-t border-[#D0D5CA]/50 dark:border-[#2D3949]">
                    {cd.weight_formula}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
