import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck,
  ArrowLeft,
  Loader2,
  Clock,
  Send,
  UserCheck,
  Building2
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisResult } from '../types';

export const OfficerReviewPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

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
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-xs font-mono text-slate-400">Loading Officer Adjudication Portal...</p>
      </div>
    );
  }

  if (error && !analysis) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-100">Error Loading Case</h2>
        <p className="text-xs text-slate-400 font-mono">{error}</p>
        <Link
          to="/upload"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 text-cyan-400 text-xs font-mono font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Upload</span>
        </Link>
      </div>
    );
  }

  const {
    created_at,
    preview_url,
    ocr,
    mrz,
    tampering,
    face_verification,
    risk,
    officer_decision_at
  } = analysis!;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <Link
            to={`/analysis/${caseId}`}
            className="inline-flex items-center space-x-1.5 text-xs font-mono text-cyan-400 hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Analysis Cockpit</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-100">
            Border Officer Decision Portal
          </h1>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-mono text-slate-500 uppercase">Case Dossier</div>
          <div className="text-xs font-mono text-slate-300 font-bold">{caseId?.slice(0, 13)}...</div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center space-x-2">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Case Dossier Summary Card */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Document Portrait / Preview */}
        <div className="flex flex-col items-center justify-center p-3 bg-slate-950/60 rounded-lg border border-slate-800">
          <img
            src={preview_url}
            alt="Document"
            className="max-h-36 rounded object-contain"
          />
          <div className="mt-2 text-[10px] font-mono text-slate-400">
            {ocr.document_type || 'IDENTITY DOCUMENT'} • {ocr.issuing_country || 'UTO'}
          </div>
        </div>

        {/* Identity & Forensic Facts */}
        <div className="md:col-span-2 space-y-2.5 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-slate-400">TRAVELER:</span>
            <span className="font-bold text-slate-100 text-sm">
              {ocr.name || mrz.surname ? `${mrz.surname || ''} ${mrz.given_names || ''}`.trim() : 'UNIDENTIFIED'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500">DOCUMENT #: </span>
              <span className="text-cyan-300 font-bold">{ocr.document_number || mrz.document_number || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500">DOB: </span>
              <span className="text-slate-300">{ocr.date_of_birth || mrz.birth_date || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500">ICAO MRZ: </span>
              <span className={mrz.all_valid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {mrz.all_valid ? 'PASSED (7-3-1)' : 'CHECKSUM FAILED'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">FORENSICS: </span>
              <span className={tampering.is_tampered ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                {tampering.tampering_score}% Tampering
              </span>
            </div>
            <div>
              <span className="text-slate-500">BIOMETRICS: </span>
              <span className={face_verification.is_match ? 'text-emerald-400' : 'text-slate-400'}>
                {face_verification.match_score ? `${face_verification.match_score}% Match` : 'No Selfie'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">RECOMMENDED: </span>
              <span className="text-amber-400 font-bold">{risk.recommendation}</span>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-400 leading-relaxed bg-slate-950/40 p-2.5 rounded border border-slate-850">
            {risk.plain_english_explanation}
          </div>
        </div>
      </div>

      {/* Decision Adjudication Buttons */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 shadow-xl space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-100">
            Select Final Officer Decision
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Recorded in SQLite database with officer timestamp.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Button 1: CONFIRM / CLEAR */}
          <button
            onClick={() => handleDecisionSubmit('CONFIRMED')}
            disabled={submitting}
            className={`p-5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
              decision === 'CONFIRMED'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-slate-300'
            }`}
          >
            <ShieldCheck className="w-8 h-8 text-emerald-400 mb-2" />
            <span className="font-black text-sm uppercase tracking-wider">CONFIRM / CLEAR</span>
            <span className="text-[10px] text-slate-400 font-mono mt-1">
              Valid document. Grant border crossing.
            </span>
          </button>

          {/* Button 2: FLAG / SECONDARY */}
          <button
            onClick={() => handleDecisionSubmit('FLAGGED')}
            disabled={submitting}
            className={`p-5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
              decision === 'FLAGGED'
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-amber-500/50 hover:bg-amber-950/20 text-slate-300'
            }`}
          >
            <AlertTriangle className="w-8 h-8 text-amber-400 mb-2" />
            <span className="font-black text-sm uppercase tracking-wider">FLAG / SECONDARY</span>
            <span className="text-[10px] text-slate-400 font-mono mt-1">
              Refer to secondary inspection room.
            </span>
          </button>

          {/* Button 3: ESCALATE / DETENTION */}
          <button
            onClick={() => handleDecisionSubmit('ESCALATED')}
            disabled={submitting}
            className={`p-5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
              decision === 'ESCALATED'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
                : 'bg-slate-950/60 border-slate-800 hover:border-rose-500/50 hover:bg-rose-950/20 text-slate-300'
            }`}
          >
            <ShieldAlert className="w-8 h-8 text-rose-400 mb-2" />
            <span className="font-black text-sm uppercase tracking-wider">ESCALATE / DETENTION</span>
            <span className="text-[10px] text-slate-400 font-mono mt-1">
              High fraud severity. Notify supervisor.
            </span>
          </button>
        </div>

        {/* Officer Notes Area */}
        <div className="pt-2">
          <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-2">
            Officer Case Notes & Rationale:
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add officer comments, inspection observations, or supervisor escalation details..."
            className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500 transition-colors"
          />

          {/* Quick presets */}
          <div className="mt-2 flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-mono text-slate-500">Quick Tags:</span>
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
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Trail Info */}
        {officer_decision_at && (
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>AUDIT STATUS: RECORDED</span>
            <span>DECISION TIME: {new Date(officer_decision_at).toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};
