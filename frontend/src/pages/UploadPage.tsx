import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  User,
  Scan,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  X,
  FileCheck2,
  Loader2,
  Bookmark,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { DemoSample } from '../types';
import { MRZDivider } from '../components/ui/MRZDivider';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();

  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [docPreview, setDocPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [demoSamples, setDemoSamples] = useState<DemoSample[]>([]);

  const docInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load available test scenarios
    api.getDemoSamples()
      .then((samples) => setDemoSamples(samples))
      .catch((err) => console.error('Failed to load demo samples:', err));
  }, []);

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocumentFile(file);
      setDocPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelfieFile(file);
      setSelfiePreview(URL.createObjectURL(file));
    }
  };

  const handleDropDoc = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setDocumentFile(file);
      setDocPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleDropSelfie = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelfieFile(file);
      setSelfiePreview(URL.createObjectURL(file));
    }
  };

  const runScreeningPipeline = async (docId: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      setAnalysisStep('MODULE 1/4: Running OCR Extraction & Text Segmentation...');
      await new Promise((r) => setTimeout(r, 350));

      setAnalysisStep('MODULE 2/4: Validating ICAO 9303 MRZ Check Digits (7-3-1 Weighting)...');
      await new Promise((r) => setTimeout(r, 350));

      setAnalysisStep('MODULE 3/4: Forensic Error Level Analysis & Copy-Move Detection...');
      await new Promise((r) => setTimeout(r, 350));

      setAnalysisStep('MODULE 4/4: Deep Face Biometric Embeddings & Cosine Matching...');
      const result = await api.analyzeDocument(docId);

      setAnalysisStep('Screening Complete! Loading Case Dossier...');
      await new Promise((r) => setTimeout(r, 200));

      navigate(`/analysis/${result.document_id}`);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Screening pipeline failed');
      setIsAnalyzing(false);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!documentFile) {
      setError('Please provide a primary identity document image (Passport, ID Card).');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep('Ingesting document and traveler media...');

    try {
      const uploadRes = await api.uploadDocument(documentFile, selfieFile);
      await runScreeningPipeline(uploadRes.documentId);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setIsAnalyzing(false);
    }
  };

  const handleQuickLoadSample = async (sampleId: string) => {
    setIsAnalyzing(true);
    setAnalysisStep(`Loading pre-configured case dossier: ${sampleId}...`);

    try {
      const uploadRes = await api.loadDemoSample(sampleId);
      await runScreeningPipeline(uploadRes.documentId);
    } catch (err: any) {
      setError(err.message || 'Failed to load demo scenario');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-page-reveal transition-colors duration-200">
      {/* Page Header */}
      <div className="pb-4 border-b border-[#D0D5CA] dark:border-[#2D3949]">
        <div className="flex items-center space-x-2 text-xs font-mono text-[#526071] dark:text-[#9DA3A0] uppercase tracking-wider mb-1">
          <Scan className="w-3.5 h-3.5 text-[#1B2430] dark:text-[#EAEBE3]" />
          <span>Checkpoint Ingestion Portal • Section 04</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1B2430] dark:text-[#EAEBE3]">
          Upload Identity Document for Screening
        </h1>
        <p className="text-sm text-[#526071] dark:text-[#9DA3A0] mt-1">
          Submit a primary travel document image and an optional traveler selfie for automated 4-module forensic verification.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#1B2430] border-2 border-[#A23B2E] dark:border-[#C24B3B] text-[#A23B2E] dark:text-[#C24B3B] text-xs font-mono flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#A23B2E] dark:text-[#C24B3B]" />
            <span className="font-bold">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-[#A23B2E] dark:text-[#C24B3B] hover:opacity-75 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Analysis Progress Official Modal Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-[#1B2430]/70 dark:bg-[#000000]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFFFF] dark:bg-[#1B2430] border-2 border-[#1B2430] dark:border-[#EAEBE3] rounded-xl p-6 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#EAEBE3] dark:bg-[#14161C] border border-[#D0D5CA] dark:border-[#2D3949] flex items-center justify-center mx-auto text-[#1B2430] dark:text-[#EAEBE3]">
              <Loader2 className="w-7 h-7 animate-spin text-[#1B2430] dark:text-[#EAEBE3]" />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase text-[#526071] dark:text-[#9DA3A0] tracking-wider">
                Official Border Screening in Progress
              </div>
              <h3 className="text-lg font-black text-[#1B2430] dark:text-[#EAEBE3]">
                Processing Identity Dossier
              </h3>
            </div>
            
            <div className="p-3 bg-[#E2E4DC] dark:bg-[#181F28] rounded-lg border border-[#D0D5CA] dark:border-[#2D3949] min-h-[44px] flex items-center justify-center">
              <p className="text-xs font-mono text-[#1B2430] dark:text-[#EAEBE3] font-semibold">
                {analysisStep}
              </p>
            </div>

            <div className="w-full bg-[#EAEBE3] dark:bg-[#14161C] h-2 rounded-full overflow-hidden border border-[#D0D5CA] dark:border-[#2D3949]">
              <div className="h-full bg-[#1B2430] dark:bg-[#EAEBE3] w-full rounded-full animate-pulse" />
            </div>

            <div className="text-[10px] font-mono text-[#526071] dark:text-[#9DA3A0]">
              PEHCHAAN Automated Border Forensics Engine • Station Alpha-01
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Drag & Drop Dropzones (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Document Drag-Drop Zone (Mandatory) */}
          <div className="bg-[#FFFFFF] dark:bg-[#1B2430] p-5 rounded-xl border border-[#D0D5CA] dark:border-[#2D3949] shadow-xs">
            <label className="block text-xs font-mono text-[#1B2430] dark:text-[#EAEBE3] font-bold uppercase mb-2">
              1. Primary Identity Document (Passport / ID Card) <span className="text-[#A23B2E] dark:text-[#C24B3B]">*</span>
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropDoc}
              onClick={() => docInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                docPreview
                  ? 'border-[#1B2430] dark:border-[#EAEBE3] bg-[#F4F5F0] dark:bg-[#222B38]'
                  : 'border-[#D0D5CA] dark:border-[#2D3949] hover:border-[#1B2430] dark:hover:border-[#EAEBE3] bg-[#EAEBE3]/40 dark:bg-[#14161C]/40 hover:bg-[#EAEBE3] dark:hover:bg-[#14161C]'
              }`}
            >
              <input
                ref={docInputRef}
                type="file"
                accept="image/*"
                onChange={handleDocChange}
                className="hidden"
              />

              {docPreview ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative max-h-56 rounded-md overflow-hidden border border-[#D0D5CA] dark:border-[#2D3949] bg-[#E2E4DC] dark:bg-[#181F28] p-1 shadow-xs">
                    <img
                      src={docPreview}
                      alt="Document Preview"
                      className="max-h-52 object-contain"
                    />
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-mono text-[#3F4A2C] dark:text-[#6B7D46] font-bold">
                    <FileCheck2 className="w-4 h-4 text-[#3F4A2C] dark:text-[#6B7D46]" />
                    <span>{documentFile?.name || 'Document Loaded'}</span>
                  </div>
                  <span className="text-[10px] text-[#526071] dark:text-[#9DA3A0] font-mono">
                    Click or drag new image to replace
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-[#E2E4DC] dark:bg-[#181F28] border border-[#D0D5CA] dark:border-[#2D3949] flex items-center justify-center text-[#1B2430] dark:text-[#EAEBE3]">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-[#1B2430] dark:text-[#EAEBE3]">
                      Drag & Drop Document Image
                    </span>
                    <span className="block text-xs text-[#526071] dark:text-[#9DA3A0] mt-0.5">
                      or click to browse from local workstation
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#526071] dark:text-[#9DA3A0] uppercase">
                    Supported: JPG, PNG, WEBP (ICAO 9303 Passports, National IDs)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 2. Optional Traveler Selfie Drag-Drop Zone */}
          <div className="bg-[#FFFFFF] dark:bg-[#1B2430] p-5 rounded-xl border border-[#D0D5CA] dark:border-[#2D3949] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-[#1B2430] dark:text-[#EAEBE3] font-bold uppercase">
                2. Live Traveler Selfie (Optional Biometric Check)
              </label>
              <span className="text-[10px] font-mono text-[#526071] dark:text-[#9DA3A0] uppercase">
                Module 4 Face Verification
              </span>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropSelfie}
              onClick={() => selfieInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                selfiePreview
                  ? 'border-[#1B2430] dark:border-[#EAEBE3] bg-[#F4F5F0] dark:bg-[#222B38]'
                  : 'border-[#D0D5CA] dark:border-[#2D3949] hover:border-[#1B2430] dark:hover:border-[#EAEBE3] bg-[#EAEBE3]/40 dark:bg-[#14161C]/40 hover:bg-[#EAEBE3] dark:hover:bg-[#14161C]'
              }`}
            >
              <input
                ref={selfieInputRef}
                type="file"
                accept="image/*"
                onChange={handleSelfieChange}
                className="hidden"
              />

              {selfiePreview ? (
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-20 h-24 rounded-md overflow-hidden border border-[#D0D5CA] dark:border-[#2D3949] bg-[#E2E4DC] dark:bg-[#181F28] p-1 shadow-xs">
                    <img
                      src={selfiePreview}
                      alt="Selfie Preview"
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center space-x-1.5 text-xs font-mono text-[#1B2430] dark:text-[#EAEBE3] font-bold">
                      <User className="w-4 h-4 text-[#526071] dark:text-[#9DA3A0]" />
                      <span>Traveler Selfie Ready</span>
                    </div>
                    <span className="text-[11px] text-[#526071] dark:text-[#9DA3A0] font-mono block mt-0.5">
                      {selfieFile?.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelfieFile(null);
                        setSelfiePreview(null);
                      }}
                      className="mt-2 text-[10px] font-mono text-[#A23B2E] dark:text-[#C24B3B] hover:text-[#7A2A20] dark:hover:text-[#9E3528] hover:underline font-bold cursor-pointer"
                    >
                      Remove Selfie
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3 py-3 text-[#526071] dark:text-[#9DA3A0]">
                  <User className="w-5 h-5 text-[#526071] dark:text-[#9DA3A0]" />
                  <span className="text-xs font-medium">
                    Drag & drop live selfie photo or click to browse
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Primary Action Button — Accent #A23B2E Ink-Stamp Red */}
          <button
            onClick={handleUploadAndAnalyze}
            disabled={!documentFile || isAnalyzing}
            className={`w-full py-4 rounded-lg font-bold text-sm tracking-wide uppercase transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer ${
              !documentFile || isAnalyzing
                ? 'bg-[#D0D5CA] dark:bg-[#2D3949] text-[#526071] dark:text-[#9DA3A0] cursor-not-allowed border border-[#B0B7A6] dark:border-[#3D4B5C]'
                : 'bg-[#A23B2E] dark:bg-[#C24B3B] hover:bg-[#7A2A20] dark:hover:bg-[#9E3528] active:bg-[#7A2A20] text-[#FFFFFF] dark:text-[#14161C] shadow-sm'
            }`}
          >
            <Scan className="w-4 h-4 text-[#FFFFFF] dark:text-[#14161C]" />
            <span>Execute 4-Module Document Screening</span>
          </button>
        </div>

        {/* Right: Quick Load Test Scenarios (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-[#FFFFFF] dark:bg-[#1B2430] border border-[#D0D5CA] dark:border-[#2D3949] shadow-xs">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#D0D5CA] dark:border-[#2D3949]">
              <Bookmark className="w-4 h-4 text-[#1B2430] dark:text-[#EAEBE3]" />
              <h3 className="font-extrabold text-[#1B2430] dark:text-[#EAEBE3] text-sm">
                Pre-Seeded Test Scenarios
              </h3>
            </div>
            <p className="text-xs text-[#526071] dark:text-[#9DA3A0] mt-2">
              Select an official reference scenario to test individual modules and inspection outcomes:
            </p>

            <div className="mt-4 space-y-3">
              {demoSamples.map((sample) => {
                let badgeClass = 'bg-[#E2E4DC] dark:bg-[#181F28] text-[#1B2430] dark:text-[#EAEBE3] border-[#D0D5CA] dark:border-[#2D3949]';
                if (sample.category === 'genuine') {
                  badgeClass = 'bg-[#FFFFFF] dark:bg-[#1B2430] text-[#3F4A2C] dark:text-[#6B7D46] border-2 border-[#3F4A2C] dark:border-[#6B7D46]';
                } else if (sample.category === 'tampered' || sample.category === 'mrz_invalid' || sample.category === 'face_mismatch') {
                  badgeClass = 'bg-[#FFFFFF] dark:bg-[#1B2430] text-[#A23B2E] dark:text-[#C24B3B] border-2 border-[#7A2A20] dark:border-[#9E3528] font-bold';
                }

                return (
                  <div
                    key={sample.id}
                    onClick={() => handleQuickLoadSample(sample.id)}
                    className="p-3.5 rounded-lg bg-[#F4F5F0] dark:bg-[#222B38] border border-[#D0D5CA] dark:border-[#2D3949] hover:border-[#1B2430] dark:hover:border-[#EAEBE3] hover:bg-[#FFFFFF] dark:hover:bg-[#1B2430] cursor-pointer transition-all group shadow-2xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span
                          className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${badgeClass}`}
                        >
                          {sample.category.replace('_', ' ')}
                        </span>
                        <h4 className="text-xs font-bold text-[#1B2430] dark:text-[#EAEBE3] mt-1 group-hover:underline">
                          {sample.title}
                        </h4>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#526071] dark:text-[#9DA3A0] group-hover:text-[#1B2430] dark:group-hover:text-[#EAEBE3] group-hover:translate-x-0.5 transition-all mt-1" />
                    </div>

                    <p className="text-[11px] text-[#526071] dark:text-[#9DA3A0] mt-1 leading-relaxed">
                      {sample.description}
                    </p>

                    <div className="mt-2 text-[10px] font-mono text-[#1B2430] dark:text-[#EAEBE3] flex items-center space-x-1 pt-1.5 border-t border-[#D0D5CA]/60 dark:border-[#2D3949]">
                      <span className="text-[#526071] dark:text-[#9DA3A0]">Expected:</span>
                      <span className="font-bold truncate">{sample.expected_outcome}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
