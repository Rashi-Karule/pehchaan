import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  Lock,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisResult } from '../types';
import { MRZDivider } from '../components/ui/MRZDivider';

export const OfficerReviewPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [decision, setDecision] = useState<'CONFIRMED' | 'FLAGGED' | 'ESCALATED' | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) return;

    api.getDocument(caseId)
      .then((data) => {
        setAnalysis(data);
        if (data.review_status && data.review_status !== 'PENDING') {
          setDecision(data.review_status as any);
        }
        if (data.officer_notes) {
          setNotes(data.officer_notes);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load case:', err);
        setError(err.message || 'Could not load case dossier');
        setLoading(false);
      });
  }, [caseId]);

  const handleDecisionSubmit = async (selectedDecision: 'CONFIRMED' | 'FLAGGED' | 'ESCALATED') => {
    if (!caseId) return;

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await api.submitReview(caseId, {
        decision: selectedDecision,
        notes: notes.trim() || undefined,
      });

      setDecision(selectedDecision);
      setSuccessMessage(`Officer decision '${selectedDecision}' has been recorded in the border audit ledger.`);
      setSubmitting(false);

      // Refresh local analysis
      if (analysis) {
        setAnalysis({
          ...analysis,
          review_status: selectedDecision,
          officer_notes: notes,
          officer_decision_at: res.officer_decision_at,
        });
      }
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      setError(err.message || 'Failed to record officer decision');
      setSubmitting(false);
    }
  };

  const handleQuickNote = (preset: string) => {
    setNotes((prev) => (prev ? `${prev} | ${preset}` : preset));
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 animate-page-reveal">
        <Loader2 className="w-8 h-8 text-[#1B2430] animate-spin" />
        <p className="text-xs font-mono text-[#526071]">Loading Officer Adjudication Portal...</p>
      </div>
    );
  }

  if (error && !analysis) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 rounded-xl bg-[#FFFFFF] border-2 border-[#A23B2E] text-center space-y-4 shadow-xs animate-page-reveal">
        <h2 className="text-lg font-black text-[#1B2430]">Error Loading Case</h2>
        <p className="text-xs text-[#526071] font-mono">{error}</p>
        <Link
          to="/upload"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#1B2430] text-[#FFFFFF] text-xs font-mono font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Upload</span>
        </Link>
      </div>
    );
  }

  const {
    preview_url,
    ocr,
    mrz,
    tampering,
    face_verification,
    risk,
    officer_decision_at
  } = analysis!;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-page-reveal transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#D0D5CA] dark:border-[#2D3949]">
        <div>
          <Link
            to={`/analysis/${caseId}`}
            className="inline-flex items-center space-x-1.5 text-xs font-mono text-[#526071] dark:text-[#9DA3A0] hover:text-[#1B2430] dark:hover:text-[#EAEBE3] hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Analysis Dossier</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2430] dark:text-[#EAEBE3]">
            Border Officer Decision Portal
          </h1>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-mono text-[#526071] dark:text-[#9DA3A0] uppercase">Official Dossier</div>
          <div className="text-xs font-mono text-[#1B2430] dark:text-[#EAEBE3] font-bold">{caseId?.slice(0, 13)}...</div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#1B2430] border-2 border-[#3F4A2C] dark:border-[#6B7D46] text-[#3F4A2C] dark:text-[#6B7D46] text-xs font-mono flex items-center space-x-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#3F4A2C] dark:text-[#6B7D46]" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#1B2430] border-2 border-[#A23B2E] dark:border-[#C24B3B] text-[#A23B2E] dark:text-[#C24B3B] text-xs font-mono flex items-center space-x-2 shadow-2xs">
          <XCircle className="w-4 h-4 shrink-0 text-[#A23B2E] dark:text-[#C24B3B]" />
          <span className="font-bold">{error}</span>
        </div>
      )}

      {/* Case Dossier Summary Card */}
      <div className="bg-[#FFFFFF] dark:bg-[#1B2430] rounded-xl border border-[#D0D5CA] dark:border-[#2D3949] p-5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-5 transition-colors duration-200">
        {/* Document Portrait / Preview */}
        <div className="flex flex-col items-center justify-center p-3 bg-[#E2E4DC] dark:bg-[#181F28] rounded-lg border border-[#D0D5CA] dark:border-[#2D3949]">
          <img
            src={preview_url}
            alt="Document"
            className="max-h-36 rounded object-contain"
          />
          <div className="mt-2 text-[10px] font-mono text-[#526071] dark:text-[#9DA3A0] font-bold">
            {ocr.document_type || 'IDENTITY DOCUMENT'} • {ocr.issuing_country || 'UTO'}
          </div>
        </div>

        {/* Identity & Forensic Facts */}
        <div className="md:col-span-2 space-y-2.5 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-[#D0D5CA] dark:border-[#2D3949]">
            <span className="text-[#526071] dark:text-[#9DA3A0] font-sans font-bold text-[11px]">TRAVELER:</span>
            <span className="font-bold text-[#1B2430] dark:text-[#EAEBE3] text-sm">
              {ocr.name || mrz.surname ? `${mrz.surname || ''} ${mrz.given_names || ''}`.trim() : 'UNIDENTIFIED'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-[#526071] dark:text-[#9DA3A0]">DOCUMENT #: </span>
              <span className="text-[#1B2430] dark:text-[#EAEBE3] font-bold">{ocr.document_number || mrz.document_number || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[#526071] dark:text-[#9DA3A0]">DOB: </span>
              <span className="text-[#1B2430] dark:text-[#EAEBE3]">{ocr.date_of_birth || mrz.birth_date || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[#526071] dark:text-[#9DA3A0]">ICAO MRZ: </span>
              <span className={mrz.all_valid ? 'text-[#3F4A2C] dark:text-[#6B7D46] font-bold' : 'text-[#A23B2E] dark:text-[#C24B3B] font-bold'}>
                {mrz.all_valid ? 'PASSED (7-3-1)' : 'CHECKSUM FAILED'}
              </span>
            </div>
            <div>
              <span className="text-[#526071] dark:text-[#9DA3A0]">FORENSICS: </span>
              <span className={tampering.is_tampered ? 'text-[#A23B2E] dark:text-[#C24B3B] font-bold' : 'text-[#3F4A2C] dark:text-[#6B7D46] font-bold'}>
                {tampering.tampering_score}% Tampering
              </span>
            </div>
            <div>
              <span className="text-[#526071] dark:text-[#9DA3A0]">BIOMETRICS: </span>
              <span className={face_verification.is_match ? 'text-[#3F4A2C] dark:text-[#6B7D46] font-bold' : 'text-[#526071] dark:text-[#9DA3A0]'}>
                {face_verification.match_score ? `${face_verification.match_score}% Match` : 'No Selfie'}
              </span>
            </div>
            <div>
              <span className="text-[#526071] dark:text-[#9DA3A0]">RECOMMENDED: </span>
              <span className={risk.recommendation === 'CLEAR' ? 'text-[#3F4A2C] dark:text-[#6B7D46] font-bold' : 'text-[#A23B2E] dark:text-[#C24B3B] font-bold'}>
                {risk.recommendation}
              </span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-[#1B2430] dark:text-[#EAEBE3] font-sans leading-relaxed bg-[#F4F5F0] dark:bg-[#222B38] p-2.5 rounded border border-[#D0D5CA] dark:border-[#2D3949]">
            {risk.plain_english_explanation}
          </div>
        </div>
      </div>

      {/* Decision Adjudication Buttons */}
      <div className="bg-[#FFFFFF] dark:bg-[#1B2430] rounded-xl border border-[#D0D5CA] dark:border-[#2D3949] p-6 shadow-xs space-y-5 transition-colors duration-200">
        <div>
          <h3 className="text-base font-extrabold text-[#1B2430] dark:text-[#EAEBE3]">
            Record Official Officer Adjudication
          </h3>
          <p className="text-xs text-[#526071] dark:text-[#9DA3A0] mt-0.5 font-mono">
            Recorded in SQLite border ledger with officer credential timestamp.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Button 1: CONFIRM / CLEAR — Full-Strength Clearance Green */}
          <button
            onClick={() => handleDecisionSubmit('CONFIRMED')}
            disabled={submitting}
            className={`p-5 rounded-lg border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-xs ${
              decision === 'CONFIRMED'
                ? 'bg-[#3F4A2C] dark:bg-[#6B7D46] border-[#2A3320] dark:border-[#4F5D33] text-[#FFFFFF] dark:text-[#14161C] font-bold ring-2 ring-[#3F4A2C]/40 shadow-sm'
                : 'bg-[#FFFFFF] dark:bg-[#1B2430] border-[#3F4A2C] dark:border-[#6B7D46] text-[#3F4A2C] dark:text-[#6B7D46] hover:bg-[#3F4A2C] hover:text-[#FFFFFF] dark:hover:bg-[#6B7D46] dark:hover:text-[#14161C] active:bg-[#2A3320] group'
            }`}
          >
            <ShieldCheck className={`w-7 h-7 mb-2 ${decision === 'CONFIRMED' ? 'text-[#FFFFFF] dark:text-[#14161C]' : 'text-[#3F4A2C] dark:text-[#6B7D46] group-hover:text-[#FFFFFF] dark:group-hover:text-[#14161C]'}`} />
            <span className="font-extrabold text-sm uppercase tracking-wider">CONFIRM / CLEAR</span>
            <span className={`text-[10px] font-mono mt-1 ${decision === 'CONFIRMED' ? 'text-[#FFFFFF]/90 dark:text-[#14161C]/90' : 'text-[#526071] dark:text-[#9DA3A0] group-hover:text-[#FFFFFF]/90 dark:group-hover:text-[#14161C]/90'}`}>
              Valid document. Grant border crossing.
            </span>
          </button>

          {/* Button 2: FLAG / SECONDARY */}
          <button
            onClick={() => handleDecisionSubmit('FLAGGED')}
            disabled={submitting}
            className={`p-5 rounded-lg border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-xs ${
              decision === 'FLAGGED'
                ? 'bg-[#FFFFFF] dark:bg-[#1B2430] border-[#A23B2E] dark:border-[#C24B3B] text-[#A23B2E] dark:text-[#C24B3B] ring-2 ring-[#A23B2E]/30 font-bold'
                : 'bg-[#FFFFFF] dark:bg-[#1B2430] border-[#D0D5CA] dark:border-[#2D3949] hover:border-[#A23B2E] dark:hover:border-[#C24B3B] text-[#1B2430] dark:text-[#EAEBE3] group'
            }`}
          >
            <AlertTriangle className="w-7 h-7 text-[#A23B2E] dark:text-[#C24B3B] mb-2" />
            <span className="font-extrabold text-sm uppercase tracking-wider">FLAG / SECONDARY</span>
            <span className="text-[10px] text-[#526071] dark:text-[#9DA3A0] font-mono mt-1">
              Refer to secondary inspection room.
            </span>
          </button>

          {/* Button 3: ESCALATE / DETENTION — Primary Stamp Red */}
          <button
            onClick={() => handleDecisionSubmit('ESCALATED')}
            disabled={submitting}
            className={`p-5 rounded-lg border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer shadow-xs ${
              decision === 'ESCALATED'
                ? 'bg-[#A23B2E] dark:bg-[#C24B3B] border-[#7A2A20] dark:border-[#9E3528] text-[#FFFFFF] dark:text-[#14161C] ring-2 ring-[#7A2A20]/40 font-bold shadow-sm'
                : 'bg-[#FFFFFF] dark:bg-[#1B2430] border-[#A23B2E] dark:border-[#C24B3B] text-[#A23B2E] dark:text-[#C24B3B] hover:bg-[#A23B2E] hover:text-[#FFFFFF] dark:hover:bg-[#C24B3B] dark:hover:text-[#14161C] active:bg-[#7A2A20] group'
            }`}
          >
            <ShieldAlert className={`w-7 h-7 mb-2 ${decision === 'ESCALATED' ? 'text-[#FFFFFF] dark:text-[#14161C]' : 'text-[#A23B2E] dark:text-[#C24B3B] group-hover:text-[#FFFFFF] dark:group-hover:text-[#14161C]'}`} />
            <span className="font-extrabold text-sm uppercase tracking-wider">ESCALATE / DETENTION</span>
            <span className={`text-[10px] font-mono mt-1 ${decision === 'ESCALATED' ? 'text-[#FFFFFF]/90 dark:text-[#14161C]/90' : 'text-[#526071] dark:text-[#9DA3A0] group-hover:text-[#FFFFFF]/90 dark:group-hover:text-[#14161C]/90'}`}>
              High fraud severity. Notify supervisor.
            </span>
          </button>
        </div>

        {/* Officer Notes Area */}
        <div className="pt-2">
          <label className="block text-xs font-mono text-[#1B2430] dark:text-[#EAEBE3] font-bold uppercase mb-2">
            Officer Case Notes & Rationale:
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add officer comments, inspection observations, or supervisor escalation details..."
            className="w-full p-3 rounded-lg bg-[#F4F5F0] dark:bg-[#222B38] border border-[#D0D5CA] dark:border-[#2D3949] text-[#1B2430] dark:text-[#EAEBE3] placeholder:text-[#526071]/60 dark:placeholder:text-[#9DA3A0]/60 text-xs font-mono focus:outline-none focus:border-[#1B2430] dark:focus:border-[#EAEBE3] transition-colors"
          />

          {/* Quick presets */}
          <div className="mt-2 flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-mono text-[#526071] dark:text-[#9DA3A0] font-bold">Quick Tags:</span>
            {[
              'Passed all checkpoint checks',
              'Altered ICAO 9303 checksum',
              'Spliced graphic / ELA anomaly',
              'Biometric face mismatch',
              'Secondary interview conducted'
            ].map((tag, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickNote(tag)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E2E4DC] dark:bg-[#181F28] hover:bg-[#1B2430] hover:text-[#FFFFFF] dark:hover:bg-[#EAEBE3] dark:hover:text-[#14161C] text-[#1B2430] dark:text-[#EAEBE3] border border-[#D0D5CA] dark:border-[#2D3949] transition-colors cursor-pointer"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Trail Info */}
        {officer_decision_at && (
          <div className="pt-3 border-t border-[#D0D5CA] dark:border-[#2D3949] flex items-center justify-between text-[10px] font-mono text-[#526071] dark:text-[#9DA3A0]">
            <span className="font-bold text-[#1B2430] dark:text-[#EAEBE3]">AUDIT STATUS: RECORDED IN LEDGER</span>
            <span>DECISION TIME: {new Date(officer_decision_at).toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};
