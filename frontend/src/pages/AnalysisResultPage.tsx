import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowRight,
  RotateCcw,
  Loader2,
  Clock,
  AlertOctagon,
  FileCheck2
} from 'lucide-react';
import { api } from '../services/api';
import { AnalysisResult } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { HeatmapViewer } from '../components/HeatmapViewer';
import { MRZInspector } from '../components/MRZInspector';
import { OCRInspector } from '../components/OCRInspector';
import { BiometricsCard } from '../components/BiometricsCard';
import { MRZDivider } from '../components/ui/MRZDivider';

export const AnalysisResultPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();

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
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 animate-page-reveal">
        <Loader2 className="w-8 h-8 text-[#1B2430] dark:text-[#EAEBE3] animate-spin" />
        <p className="text-xs font-mono text-[#526071] dark:text-[#9DA3A0]">Loading Case Dossier...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 rounded-xl bg-[#FFFFFF] dark:bg-[#1B2430] border-2 border-[#A23B2E] dark:border-[#C24B3B] text-center space-y-4 shadow-xs animate-page-reveal">
        <div className="w-12 h-12 rounded-full bg-[#FFFFFF] dark:bg-[#1B2430] border-2 border-[#A23B2E] dark:border-[#C24B3B] flex items-center justify-center mx-auto text-[#A23B2E] dark:text-[#C24B3B]">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-[#1B2430] dark:text-[#EAEBE3]">Case Dossier Unavailable</h2>
        <p className="text-xs text-[#526071] dark:text-[#9DA3A0] font-mono">{error || 'No analysis data found for this document ID.'}</p>
        <Link
          to="/upload"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#1B2430] dark:bg-[#EAEBE3] text-[#FFFFFF] dark:text-[#14161C] text-xs font-mono font-bold hover:bg-[#324050] dark:hover:bg-[#FFFFFF] transition-colors"
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
    review_status
  } = analysis;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-page-reveal transition-colors duration-200">
      {/* Top Banner: Case Header & Officer Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#D0D5CA] dark:border-[#2D3949]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#526071] dark:text-[#9DA3A0]">
            <span className="font-bold text-[#1B2430] dark:text-[#EAEBE3]">CASE ID: {case_id}</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(created_at).toLocaleString()}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2430] dark:text-[#EAEBE3] mt-0.5">
            Border Screening Dossier
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {review_status !== 'PENDING' ? (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#FFFFFF] dark:bg-[#1B2430] border border-[#D0D5CA] dark:border-[#2D3949]">
              <span className="text-[10px] font-mono text-[#526071] dark:text-[#9DA3A0] uppercase">Decision:</span>
              <span
                className={`text-xs font-mono font-black uppercase px-2 py-0.5 rounded border-2 ${
                  review_status === 'CONFIRMED'
                    ? 'bg-[#FFFFFF] dark:bg-[#1B2430] text-[#3F4A2C] dark:text-[#6B7D46] border-[#3F4A2C] dark:border-[#6B7D46]'
                    : review_status === 'FLAGGED'
                    ? 'bg-[#FFFFFF] dark:bg-[#1B2430] text-[#A23B2E] dark:text-[#C24B3B] border-[#A23B2E] dark:border-[#C24B3B]'
                    : 'bg-[#FFFFFF] dark:bg-[#1B2430] text-[#A23B2E] dark:text-[#C24B3B] border-[#7A2A20] dark:border-[#9E3528]'
                }`}
              >
                {review_status}
              </span>
            </div>
          ) : null}

          {/* Primary Action Button — Accent #A23B2E Ink-Stamp Red */}
          <Link
            to={`/review/${case_id}`}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-[#A23B2E] dark:bg-[#C24B3B] text-[#FFFFFF] dark:text-[#14161C] font-bold text-xs uppercase tracking-wider shadow-xs hover:bg-[#7A2A20] dark:hover:bg-[#9E3528] active:bg-[#7A2A20] transition-all cursor-pointer"
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
        <div className="lg:col-span-6">
          <HeatmapViewer previewUrl={preview_url} tampering={tampering} />
        </div>

        {/* Right Column: OCR Extraction & ICAO 9303 MRZ Validation (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <OCRInspector ocr={ocr} consistency={consistency} />
          <MRZInspector mrz={mrz} />
        </div>
      </div>

      {/* Biometric Verification Card (Full-width row) */}
      <BiometricsCard face={face_verification} />

      {/* Quick Navigation Footer */}
      <div className="pt-4 border-t border-[#D0D5CA] dark:border-[#2D3949] flex items-center justify-between">
        <Link
          to="/upload"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-[#526071] dark:text-[#9DA3A0] hover:text-[#1B2430] dark:hover:text-[#EAEBE3] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Screen Another Document</span>
        </Link>

        <Link
          to={`/review/${case_id}`}
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-[#1B2430] dark:text-[#EAEBE3] hover:underline font-bold"
        >
          <span>Open Adjudication Panel</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
