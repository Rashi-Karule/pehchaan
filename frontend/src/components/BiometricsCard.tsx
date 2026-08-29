import React from 'react';
import { ScanFace } from 'lucide-react';
import { FaceVerificationResult } from '../types';

import { AuthImage } from './ui/AuthImage';

interface BiometricsCardProps {
  face: FaceVerificationResult;
}

export const BiometricsCard: React.FC<BiometricsCardProps> = ({ face }) => {
  const {
    selfie_provided,
    document_face_detected,
    match_score,
    cosine_similarity,
    is_match,
    document_face_url,
    selfie_face_url,
    details
  } = face;

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#1B2430] rounded-xl border border-[#D0D5CA] dark:border-[#2D3949] p-5 shadow-xs transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D0D5CA] dark:border-[#2D3949]">
        <div className="flex items-center space-x-2">
          <ScanFace className="w-4 h-4 text-[#1B2430] dark:text-[#EAEBE3]" />
          <h3 className="font-extrabold text-[#1B2430] dark:text-[#EAEBE3] text-sm">
            Biometric Face Verification
          </h3>
        </div>
        <div>
          {!selfie_provided ? (
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded bg-[#E2E4DC] dark:bg-[#181F28] text-[#526071] dark:text-[#9DA3A0] border border-[#D0D5CA] dark:border-[#2D3949]">
              NO SELFIE PROVIDED
            </span>
          ) : is_match ? (
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded bg-[#FFFFFF] dark:bg-[#1B2430] text-[#3F4A2C] dark:text-[#6B7D46] border-2 border-[#3F4A2C] dark:border-[#6B7D46] uppercase">
              BIOMETRIC MATCH
            </span>
          ) : (
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded bg-[#FFFFFF] dark:bg-[#1B2430] text-[#A23B2E] dark:text-[#C24B3B] border-2 border-[#7A2A20] dark:border-[#9E3528] uppercase">
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
            <div className="w-24 h-28 rounded-md overflow-hidden border border-[#D0D5CA] dark:border-[#2D3949] bg-[#E2E4DC] dark:bg-[#181F28] p-1 flex items-center justify-center shadow-2xs">
              {document_face_url ? (
                <AuthImage
                  src={document_face_url}
                  alt="Document Face"
                  fallbackText="No Face Crop"
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="text-center p-2 text-[9px] text-[#526071] dark:text-[#9DA3A0] font-mono">
                  {document_face_detected ? 'Extracted' : 'No Face Detected'}
                </div>
              )}
            </div>
            <span className="mt-1.5 text-[10px] font-mono text-[#526071] dark:text-[#9DA3A0] uppercase font-bold">
              ID Portrait
            </span>
          </div>

          <div className="text-[#526071] dark:text-[#9DA3A0] font-mono text-xs font-black">VS</div>

          {/* Traveler Live Selfie */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-28 rounded-md overflow-hidden border border-[#D0D5CA] dark:border-[#2D3949] bg-[#E2E4DC] dark:bg-[#181F28] p-1 flex items-center justify-center shadow-2xs">
              {selfie_face_url ? (
                <AuthImage
                  src={selfie_face_url}
                  alt="Traveler Selfie"
                  fallbackText="No Selfie Crop"
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="text-center p-2 text-[9px] text-[#526071] dark:text-[#9DA3A0] font-mono">
                  {selfie_provided ? 'Processing...' : 'No Live Selfie'}
                </div>
              )}
            </div>
            <span className="mt-1.5 text-[10px] font-mono text-[#526071] dark:text-[#9DA3A0] uppercase font-bold">
              Live Traveler
            </span>
          </div>
        </div>

        {/* Match Statistics & Diagnostics */}
        <div className="flex-1 w-full bg-[#F4F5F0] dark:bg-[#222B38] p-4 rounded-lg border border-[#D0D5CA] dark:border-[#2D3949]">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-mono text-[#526071] dark:text-[#9DA3A0] uppercase font-bold">
              Deep Neural Match Score
            </div>
            {match_score !== null && match_score !== undefined && (
              <div
                className={`text-base font-mono font-black ${
                  is_match ? 'text-[#3F4A2C] dark:text-[#6B7D46]' : 'text-[#A23B2E] dark:text-[#C24B3B]'
                }`}
              >
                {match_score}%
              </div>
            )}
          </div>

          {match_score !== null && match_score !== undefined && (
            <div className="w-full bg-[#E2E4DC] dark:bg-[#181F28] h-2 rounded-full mt-2 overflow-hidden border border-[#D0D5CA] dark:border-[#2D3949]">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  is_match ? 'bg-[#3F4A2C] dark:bg-[#6B7D46]' : 'bg-[#A23B2E] dark:bg-[#C24B3B]'
                }`}
                style={{ width: `${match_score}%` }}
              />
            </div>
          )}

          <div className="mt-3 text-xs text-[#1B2430] dark:text-[#EAEBE3] font-sans leading-relaxed">
            {details}
          </div>

          {cosine_similarity !== null && cosine_similarity !== undefined && (
            <div className="mt-2 text-[10px] font-mono text-[#526071] dark:text-[#9DA3A0] pt-2 border-t border-[#D0D5CA] dark:border-[#2D3949]">
              SFace 128D Embedding Cosine: <strong className="text-[#1B2430] dark:text-[#EAEBE3]">{cosine_similarity}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
