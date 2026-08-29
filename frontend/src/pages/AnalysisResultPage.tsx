import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Layers,
  FileText,
  Binary,
  ScanFace,
  ArrowRight,
  RotateCcw,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  UserX,
  AlertOctagon,
  FileSearch
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisResult } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { HeatmapViewer } from '../components/HeatmapViewer';
import { MRZInspector } from '../components/MRZInspector';
import { OCRInspector } from '../components/OCRInspector';
import { BiometricsCard } from '../components/BiometricsCard';

export const AnalysisResultPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) return;

    api.getDocument(documentId)
      .then((data) => {
        setAnalysis(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load analysis:', err);
        setError(err.message || 'Could not load document analysis');
        setLoading(false);
      });
  }, [documentId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-xs font-mono text-slate-400">Loading Case Dossier...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-100">Case Dossier Unavailable</h2>
        <p className="text-xs text-slate-400 font-mono">{error || 'No analysis data found for this document ID.'}</p>
        <Link
          to="/upload"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 text-cyan-400 text-xs font-mono font-bold hover:bg-slate-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Upload Another Document</span>
        </Link>
      </div>
    );
  }

  const {
    case_id,
    created_at,
    preview_url,
    ocr,
    mrz,
    consistency,
    tampering,
    face_verification,
    risk,
    review_status,
    officer_notes,
    officer_decision_at
  } = analysis;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner: Case Header & Officer Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <span>CASE ID: {case_id}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(created_at).toLocaleString()}</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-100 mt-0.5">
            Border Screening Dossier
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {review_status !== 'PENDING' ? (
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700">
              <span className="text-[11px] font-mono text-slate-400 uppercase">Decision:</span>
              <span
                className={`text-xs font-mono font-black uppercase px-2 py-0.5 rounded ${
                  review_status === 'CONFIRMED'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : review_status === 'FLAGGED'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {review_status}
              </span>
            </div>
          ) : null}

          <Link
            to={`/review/${case_id}`}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all"
          >
            <span>Proceed to Officer Review</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Module Summary Risk Gauge Card */}
      <RiskGauge risk={risk} />

      {/* Main Analysis Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tampering Heatmap & Forensics (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <HeatmapViewer previewUrl={preview_url} tampering={tampering} />
          <BiometricsCard face={face_verification} />
        </div>

        {/* Right Column: OCR Extraction & ICAO 9303 MRZ Validation (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <OCRInspector ocr={ocr} consistency={consistency} />
          <MRZInspector mrz={mrz} />
        </div>
      </div>

      {/* Quick Navigation Footer */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <Link
          to="/upload"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Screen Another Document</span>
        </Link>

        <Link
          to={`/review/${case_id}`}
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-cyan-400 hover:underline font-bold"
        >
          <span>Open Adjudication Panel</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
