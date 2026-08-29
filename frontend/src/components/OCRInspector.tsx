import React from 'react';
import { FileText, CheckCircle2, XCircle } from 'lucide-react';
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
      <div className="p-3 rounded-lg bg-[#F4F5F0] dark:bg-[#222B38] border border-[#D0D5CA] dark:border-[#2D3949] flex flex-col justify-between transition-colors duration-200">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-sans font-bold text-[#526071] dark:text-[#9DA3A0]">{label}</span>
          {cons && (
            <span
              className={`inline-flex items-center space-x-1 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase border-2 ${
                cons.status === 'MATCH'
                  ? 'bg-[#FFFFFF] dark:bg-[#1B2430] text-[#3F4A2C] dark:text-[#6B7D46] border-[#3F4A2C] dark:border-[#6B7D46]'
                  : cons.status === 'MISMATCH'
                  ? 'bg-[#FFFFFF] dark:bg-[#1B2430] text-[#A23B2E] dark:text-[#C24B3B] border-[#7A2A20] dark:border-[#9E3528]'
                  : 'bg-[#E2E4DC] dark:bg-[#181F28] text-[#526071] dark:text-[#9DA3A0] border-[#D0D5CA] dark:border-[#2D3949]'
              }`}
              title={cons.details}
            >
              {cons.status === 'MATCH' && (
                <>
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#3F4A2C] dark:text-[#6B7D46]" />
                  <span>VIZ-MRZ MATCH</span>
                </>
              )}
              {cons.status === 'MISMATCH' && (
                <>
                  <XCircle className="w-2.5 h-2.5 text-[#A23B2E] dark:text-[#C24B3B]" />
                  <span>MISMATCH</span>
                </>
              )}
              {cons.status === 'NOT_APPLICABLE' && <span>UNVERIFIED</span>}
            </span>
          )}
        </div>
        <div className="mt-1.5 text-sm font-mono font-bold text-[#1B2430] dark:text-[#EAEBE3] truncate">
          {value || <span className="text-[#A0A796] dark:text-[#68717B] italic font-normal">Not Detected</span>}
        </div>
        {cons && cons.status === 'MISMATCH' && (
          <div className="mt-1 text-[10px] text-[#A23B2E] dark:text-[#C24B3B] font-mono truncate font-semibold">
            {cons.details}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1B2430] rounded-xl border border-[#D0D5CA] dark:border-[#2D3949] p-5 shadow-xs transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D0D5CA] dark:border-[#2D3949]">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-[#1B2430] dark:text-[#EAEBE3]" />
          <h3 className="font-extrabold text-[#1B2430] dark:text-[#EAEBE3] text-sm">
            OCR Extraction & Consistency
          </h3>
        </div>
        <div>
          <span className="text-[11px] font-mono text-[#526071] dark:text-[#9DA3A0]">
            CONFIDENCE: <strong className="text-[#1B2430] dark:text-[#EAEBE3]">{confidence_score}%</strong>
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
