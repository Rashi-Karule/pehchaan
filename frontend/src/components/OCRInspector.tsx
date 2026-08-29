import React from 'react';
import { FileText, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { OCRExtractionResult, ConsistencyCheck } from '../types';

interface OCRInspectorProps {
  ocr: OCRExtractionResult;
  consistency: ConsistencyCheck[];
}

export const OCRInspector: React.FC<OCRInspectorProps> = ({ ocr, consistency }) => {
  const { name, surname, given_names, date_of_birth, document_number, expiration_date, issuing_country, confidence_score } = ocr;

  // Map consistency checks by field name
  const consistencyMap = new Map<string, ConsistencyCheck>();
  consistency.forEach((c) => consistencyMap.set(c.field_name, c));

  const renderField = (label: string, value: string | null | undefined, fieldKey?: string) => {
    const cons = fieldKey ? consistencyMap.get(fieldKey) : undefined;

    return (
      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono text-slate-400">{label}</span>
          {cons && (
            <span
              className={`inline-flex items-center space-x-1 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                cons.status === 'MATCH'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : cons.status === 'MISMATCH'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-slate-800 text-slate-400'
              }`}
              title={cons.details}
            >
              {cons.status === 'MATCH' && (
                <>
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>VIZ-MRZ MATCH</span>
                </>
              )}
              {cons.status === 'MISMATCH' && (
                <>
                  <XCircle className="w-2.5 h-2.5" />
                  <span>MISMATCH</span>
                </>
              )}
              {cons.status === 'NOT_APPLICABLE' && <span>UNVERIFIED</span>}
            </span>
          )}
        </div>
        <div className="mt-1 text-sm font-bold font-mono text-slate-100 truncate">
          {value || <span className="text-slate-500 italic font-normal">Not Detected</span>}
        </div>
        {cons && cons.status === 'MISMATCH' && (
          <div className="mt-1 text-[10px] text-rose-300/90 font-mono truncate">
            {cons.details}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-slate-100 text-sm tracking-wide">
            OCR Extraction & Consistency
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-slate-400">
            CONFIDENCE: <strong className="text-cyan-400">{confidence_score}%</strong>
          </span>
        </div>
      </div>

      {/* Grid of Extracted Fields */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {renderField('Document Number', document_number, 'document_number')}
        {renderField('Full Legal Name', name || (surname ? `${surname} ${given_names || ''}` : null), 'name')}
        {renderField('Date of Birth', date_of_birth, 'date_of_birth')}
        {renderField('Expiration Date', expiration_date, 'expiration_date')}
        {renderField('Issuing State / Country', issuing_country)}
        {renderField('Surname', surname)}
      </div>
    </div>
  );
};
