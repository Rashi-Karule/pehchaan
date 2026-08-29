import React from 'react';
import { Binary, CheckCircle2, XCircle, AlertOctagon, HelpCircle } from 'lucide-react';
import { MRZValidationResult } from '../types';

interface MRZInspectorProps {
  mrz: MRZValidationResult;
}

export const MRZInspector: React.FC<MRZInspectorProps> = ({ mrz }) => {
  const { has_mrz, mrz_type, raw_lines, check_digits, all_valid, surname, given_names, document_number, birth_date, expiry_date } = mrz;

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Binary className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-slate-100 text-sm tracking-wide">
            ICAO 9303 MRZ Validation
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
            FORMAT: {mrz_type}
          </span>
          <span
            className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded border ${
              !has_mrz
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : all_valid
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
            }`}
          >
            {!has_mrz ? 'NO MRZ DETECTED' : all_valid ? 'PASSED (7-3-1 ICAO)' : 'CHECKSUM FAILED'}
          </span>
        </div>
      </div>

      {!has_mrz ? (
        <div className="my-4 p-4 text-center text-slate-400 text-xs font-mono bg-slate-950/50 rounded-lg border border-slate-850">
          No Machine Readable Zone (MRZ) was detected on this document.
        </div>
      ) : (
        <div className="space-y-4 mt-4">
          {/* Raw Monospace MRZ Display */}
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Encoded Machine Readable Zone:</span>
              <span className="text-cyan-400 font-semibold">{mrz_type} Standard</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs text-cyan-300 tracking-widest leading-relaxed overflow-x-auto select-all shadow-inner">
              {raw_lines.map((line, idx) => (
                <div key={idx} className="whitespace-pre">
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Check Digits Breakdown */}
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-400 mb-2">
              ICAO 9303 Weighting Algorithm Check Digit Verification:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {check_digits.map((cd, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs font-mono transition-all ${
                    cd.valid
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                      : 'bg-rose-950/30 border-rose-500/50 text-rose-200 shadow-rose-950/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 capitalize text-[11px]">
                      {cd.field_name.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`inline-flex items-center space-x-1 text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        cd.valid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/30 text-rose-300'
                      }`}
                    >
                      {cd.valid ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PASS</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>FAIL</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <div>
                      Printed CD: <strong className="text-white font-mono">{cd.check_digit}</strong>
                    </div>
                    <div>
                      Calculated CD: <strong className={cd.valid ? 'text-emerald-400' : 'text-rose-400'}>{cd.calculated_check_digit}</strong>
                    </div>
                  </div>

                  <div className="mt-1 text-[10px] text-slate-400/80 truncate">
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
