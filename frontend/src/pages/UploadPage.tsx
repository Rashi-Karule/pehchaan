import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  User,
  Scan,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  X,
  FileCheck2,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { DemoSample } from '../types';

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
      setAnalysisStep('Module 1/4: Running OCR Extraction & Text Segmentation...');
      await new Promise((r) => setTimeout(r, 350));

      setAnalysisStep('Module 2/4: Validating ICAO 9303 MRZ Check Digits (7-3-1 Weighting)...');
      await new Promise((r) => setTimeout(r, 350));

      setAnalysisStep('Module 3/4: Forensic Error Level Analysis & Copy-Move Detection...');
      await new Promise((r) => setTimeout(r, 350));

      setAnalysisStep('Module 4/4: Deep Face Biometric Embeddings & Cosine Matching...');
      const result = await api.analyzeDocument(docId);

      setAnalysisStep('Screening Complete! Loading Case Cockpit...');
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
      setError('Please provide a document image (Passport, ID Card, Driver’s License).');
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
    setAnalysisStep(`Loading pre-configured case: ${sampleId}...`);

    try {
      const uploadRes = await api.loadDemoSample(sampleId);
      await runScreeningPipeline(uploadRes.documentId);
    } catch (err: any) {
      setError(err.message || 'Failed to load demo scenario');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
          <Scan className="w-4 h-4" />
          <span>Checkpoint Ingestion Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Upload Identity Document for Screening
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload a primary identity document image and an optional traveler selfie for 4-module forensic verification.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Analysis Progress HUD Modal Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              Screening Document
            </h3>
            <p className="text-xs font-mono text-cyan-400 min-h-[36px] flex items-center justify-center">
              {analysisStep}
            </p>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 animate-pulse w-full rounded-full" />
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              TRUST-LENS AI Automated Border Forensics Engine
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Drag & Drop Dropzones (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Document Drag-Drop Zone (Mandatory) */}
          <div>
            <label className="block text-xs font-mono text-slate-300 font-bold uppercase mb-2">
              1. Primary Identity Document (Passport / ID Card) <span className="text-rose-400">*</span>
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropDoc}
              onClick={() => docInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                docPreview
                  ? 'border-cyan-500/50 bg-slate-900/90'
                  : 'border-slate-700 hover:border-cyan-500/40 bg-slate-900/40 hover:bg-slate-900/60'
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
                  <div className="relative max-h-56 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                    <img
                      src={docPreview}
                      alt="Document Preview"
                      className="max-h-52 object-contain"
                    />
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
                    <FileCheck2 className="w-4 h-4" />
                    <span>{documentFile?.name || 'Document Loaded'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Click or drag new image to replace
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-200">
                      Drag & Drop Document Image
                    </span>
                    <span className="block text-xs text-slate-400 mt-0.5">
                      or click to browse from your device
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    Supported: JPG, PNG, WEBP (ICAO 9303 Passports, National IDs)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 2. Optional Traveler Selfie Drag-Drop Zone */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono text-slate-300 font-bold uppercase">
                2. Live Traveler Selfie (Optional Biometric Check)
              </label>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                Module 4 Face Verification
              </span>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDropSelfie}
              onClick={() => selfieInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                selfiePreview
                  ? 'border-blue-500/50 bg-slate-900/90'
                  : 'border-slate-800 hover:border-blue-500/40 bg-slate-900/30 hover:bg-slate-900/50'
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
                  <div className="w-20 h-24 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                    <img
                      src={selfiePreview}
                      alt="Selfie Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center space-x-1.5 text-xs font-mono text-blue-400 font-bold">
                      <User className="w-4 h-4" />
                      <span>Traveler Selfie Ready</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {selfieFile?.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelfieFile(null);
                        setSelfiePreview(null);
                      }}
                      className="mt-2 text-[10px] font-mono text-rose-400 hover:underline"
                    >
                      Remove Selfie
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3 py-3 text-slate-400">
                  <User className="w-5 h-5 text-slate-500" />
                  <span className="text-xs font-medium">
                    Drag & drop live selfie photo or click to browse
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Screening Submission Button */}
          <button
            onClick={handleUploadAndAnalyze}
            disabled={!documentFile || isAnalyzing}
            className={`w-full py-4 rounded-xl font-black text-sm tracking-wider uppercase transition-all flex items-center justify-center space-x-2 shadow-xl ${
              !documentFile || isAnalyzing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.01]'
            }`}
          >
            <Scan className="w-5 h-5" />
            <span>Execute 4-Module Document Screening</span>
          </button>
        </div>

        {/* Right: Quick Load Test Scenarios (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-xl">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-slate-100 text-sm">
                Quick-Load Test Scenarios
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Select one of the pre-configured test documents to evaluate all four screening modules instantly:
            </p>

            <div className="mt-4 space-y-3">
              {demoSamples.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleQuickLoadSample(sample.id)}
                  className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/90 hover:border-cyan-500/50 hover:bg-slate-950 cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${
                          sample.category === 'genuine'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : sample.category === 'tampered'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : sample.category === 'mrz_invalid'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        }`}
                      >
                        {sample.category.replace('_', ' ')}
                      </span>
                      <h4 className="text-xs font-bold text-slate-100 mt-1 group-hover:text-cyan-400 transition-colors">
                        {sample.title}
                      </h4>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all mt-1" />
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {sample.description}
                  </p>

                  <div className="mt-2 text-[10px] font-mono text-cyan-400/90 flex items-center space-x-1">
                    <span>Expected:</span>
                    <span className="text-slate-300">{sample.expected_outcome}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
