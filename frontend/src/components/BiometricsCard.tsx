import React from 'react';
import { UserCheck, UserX, ScanFace, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { FaceVerificationResult } from '../types';

interface BiometricsCardProps {
  face: FaceVerificationResult;
}

export const BiometricsCard: React.FC<BiometricsCardProps> = ({ face }) => {
  const {
    selfie_provided,
    document_face_detected,
    selfie_face_detected,
    match_score,
    cosine_similarity,
    is_match,
    document_face_url,
    selfie_face_url,
    details
  } = face;

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <ScanFace className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-slate-100 text-sm tracking-wide">
            Biometric Face Verification
          </h3>
        </div>
        <div>
          {!selfie_provided ? (
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded bg-slate-800 text-slate-400 border border-slate-700">
              NO SELFIE PROVIDED
            </span>
          ) : is_match ? (
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              BIOMETRIC MATCH
            </span>
          ) : (
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
              FACE MISMATCH
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Faces Comparison Gallery */}
        <div className="flex items-center justify-center space-x-4 w-full md:w-auto">
          {/* Document Extracted Face */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-28 rounded-lg overflow-hidden border-2 border-slate-700 bg-slate-950 flex items-center justify-center shadow-md">
              {document_face_url ? (
                <img
                  src={document_face_url}
                  alt="Document Face"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2 text-[10px] text-slate-500 font-mono">
                  {document_face_detected ? 'Extracted' : 'No Face in Doc'}
                </div>
              )}
            </div>
            <span className="mt-1.5 text-[11px] font-mono text-slate-400 uppercase font-semibold">
              ID Portrait
            </span>
          </div>

          <div className="text-slate-600 font-mono text-xs font-black">VS</div>

          {/* Traveler Live Selfie */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-28 rounded-lg overflow-hidden border-2 border-slate-700 bg-slate-950 flex items-center justify-center shadow-md">
              {selfie_face_url ? (
                <img
                  src={selfie_face_url}
                  alt="Traveler Selfie"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2 text-[10px] text-slate-500 font-mono">
                  {selfie_provided ? 'Processing...' : 'No Traveler Selfie'}
                </div>
              )}
            </div>
            <span className="mt-1.5 text-[11px] font-mono text-slate-400 uppercase font-semibold">
              Live Traveler
            </span>
          </div>
        </div>

        {/* Match Statistics & Diagnostics */}
        <div className="flex-1 w-full bg-slate-950/70 p-4 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-slate-400 uppercase font-bold">
              Deep Neural Match Score
            </div>
            {match_score !== null && match_score !== undefined && (
              <div
                className={`text-lg font-mono font-black ${
                  is_match ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {match_score}%
              </div>
            )}
          </div>

          {match_score !== null && match_score !== undefined && (
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  is_match ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-rose-500'
                }`}
                style={{ width: `${match_score}%` }}
              />
            </div>
          )}

          <div className="mt-3 text-xs text-slate-300 font-mono leading-relaxed">
            {details}
          </div>

          {cosine_similarity !== null && cosine_similarity !== undefined && (
            <div className="mt-2 text-[10px] font-mono text-slate-500">
              SFace 128D Embedding Cosine Similarity: <span className="text-slate-300">{cosine_similarity}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
