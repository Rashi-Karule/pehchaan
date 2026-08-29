import React from 'react';
import { Link } from 'react-router-dom';
import {
  Scan,
  ArrowRight,
  Shield,
  FileCheck2,
  CheckCircle2,
  Lock,
  Layers,
  Binary,
  UserCheck
} from 'lucide-react';
import { MRZDivider } from '../components/ui/MRZDivider';
import { BrowserFrame } from '../components/ui/BrowserFrame';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between animate-page-reveal transition-colors duration-200">
      {/* Top MRZ Structural Decorative Device */}
      <MRZDivider
        text="P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
        secondaryText="L898902C33UTO7408122F1204159ZE184226B<<<<<<<10<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
        variant="double"
        opacity="opacity-20 dark:opacity-30"
        className="border-b border-[#D0D5CA] dark:border-[#2D3949] bg-[#E2E4DC]/50 dark:bg-[#181F28]/50 px-4 py-1"
      />

      {/* Main Split Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Headline & Primary Action (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            {/* Stamp Tag */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-[#FFFFFF] dark:bg-[#1B2430] border border-[#D0D5CA] dark:border-[#2D3949] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#A23B2E] dark:bg-[#C24B3B]"></span>
              <span className="text-[11px] font-mono font-bold tracking-wider text-[#1B2430] dark:text-[#EAEBE3] uppercase">
                ICAO Doc 9303 Verification Standard
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-black text-[#1B2430] dark:text-[#EAEBE3] tracking-tight leading-[1.08]">
                Forensic identity document screening for border checkpoints.
              </h1>
              <p className="text-base text-[#526071] dark:text-[#9DA3A0] leading-relaxed">
                Real-time optical character recognition, 7-3-1 check digit validation, error level tampering analysis, and deep neural biometric matching — compiled into one official border inspection dossier.
              </p>
            </div>

            {/* Document Telemetry Facts in Monospace */}
            <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs text-[#1B2430] dark:text-[#EAEBE3]">
              <div className="p-3 bg-[#FFFFFF] dark:bg-[#1B2430] rounded-lg border border-[#D0D5CA] dark:border-[#2D3949] space-y-0.5">
                <div className="text-[10px] text-[#526071] dark:text-[#9DA3A0] uppercase">Screening Engine</div>
                <div className="font-bold">4-Module Forensic</div>
              </div>
              <div className="p-3 bg-[#FFFFFF] dark:bg-[#1B2430] rounded-lg border border-[#D0D5CA] dark:border-[#2D3949] space-y-0.5">
                <div className="text-[10px] text-[#526071] dark:text-[#9DA3A0] uppercase">Compliance Spec</div>
                <div className="font-bold">TD1 / TD2 / TD3 MRZ</div>
              </div>
            </div>

            {/* Primary Action Button — Accent #A23B2E Ink-Stamp Red */}
            <div className="pt-2">
              <Link
                to="/upload"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-lg bg-[#A23B2E] dark:bg-[#C24B3B] text-[#FFFFFF] dark:text-[#14161C] font-bold text-sm tracking-wide shadow-sm hover:bg-[#7A2A20] dark:hover:bg-[#9E3528] active:bg-[#7A2A20] transition-all cursor-pointer"
              >
                <Scan className="w-4 h-4 text-[#FFFFFF] dark:text-[#14161C]" />
                <span>Start Document Verification</span>
                <ArrowRight className="w-4 h-4 text-[#FFFFFF] dark:text-[#14161C]" />
              </Link>
              <div className="mt-2.5 text-[11px] font-mono text-[#526071] dark:text-[#9DA3A0] flex items-center space-x-2">
                <span>› Supports JPEG, PNG, WEBP</span>
                <span>•</span>
                <span>Instant Pre-Seeded Test Scenarios</span>
              </div>
            </div>
          </div>

          {/* Right Column: Embedded Real SaaS Product Preview (7 cols) */}
          <div className="lg:col-span-7">
            <BrowserFrame
              url="https://checkpoint.border.gov/analysis/case_cp8912_ut"
              stationName="STATION CP-ALPHA-01"
              className="border-2 border-[#1B2430] dark:border-[#2D3949] shadow-md"
            >
              {/* Product Screenshot Viewport */}
              <div className="p-5 sm:p-6 space-y-4 bg-[#F4F5F0] dark:bg-[#222B38]">
                {/* Dossier Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#D0D5CA] dark:border-[#2D3949]">
                  <div>
                    <div className="text-[10px] font-mono text-[#526071] dark:text-[#9DA3A0] flex items-center space-x-1.5">
                      <span>CASE ID: CP-9812-UTO-84</span>
                      <span>•</span>
                      <span>2026-08-29 19:42:15 UTC</span>
                    </div>
                    <div className="text-base font-extrabold text-[#1B2430] dark:text-[#EAEBE3]">
                      Border Screening Dossier
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-[#FFFFFF] dark:bg-[#1B2430] border-2 border-[#3F4A2C] dark:border-[#6B7D46] text-[#3F4A2C] dark:text-[#6B7D46] font-mono text-[10px] font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-[#3F4A2C] dark:text-[#6B7D46]" />
                    <span>PASSED CHECKS</span>
                  </div>
                </div>

                {/* Risk Meter Card */}
                <div className="p-3.5 rounded-lg bg-[#FFFFFF] dark:bg-[#1B2430] border-2 border-[#3F4A2C] dark:border-[#6B7D46] flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-md bg-[#E2E4DC] dark:bg-[#181F28] border border-[#D0D5CA] dark:border-[#2D3949] flex flex-col items-center justify-center font-mono">
                      <span className="text-sm font-black text-[#1B2430] dark:text-[#EAEBE3]">04</span>
                      <span className="text-[8px] text-[#526071] dark:text-[#9DA3A0] uppercase">Score</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#3F4A2C] dark:bg-[#6B7D46] text-[#FFFFFF] dark:text-[#14161C]">
                          LOW RISK
                        </span>
                        <span className="text-[10px] font-mono text-[#526071] dark:text-[#9DA3A0]">
                          ACTION: <strong className="text-[#3F4A2C] dark:text-[#6B7D46]">CLEAR</strong>
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#1B2430] dark:text-[#EAEBE3] mt-0.5">
                        Document Authenticity Verified
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block text-[11px] text-[#526071] dark:text-[#9DA3A0] max-w-[210px] text-right font-sans">
                    All check digits valid. Zero tampering detected across ELA matrix.
                  </div>
                </div>

                {/* Analysis 2-Col Split inside Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  {/* Left Box: Forensics & Biometrics */}
                  <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#1B2430] border border-[#D0D5CA] dark:border-[#2D3949] space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#D0D5CA] dark:border-[#2D3949]">
                      <span className="font-bold text-[#1B2430] dark:text-[#EAEBE3] flex items-center space-x-1">
                        <Layers className="w-3.5 h-3.5 text-[#526071] dark:text-[#9DA3A0]" />
                        <span>Forensic Heatmap</span>
                      </span>
                      <span className="text-[10px] text-[#3F4A2C] dark:text-[#6B7D46] font-bold border-2 border-[#3F4A2C] dark:border-[#6B7D46] px-1 py-0.2 rounded bg-[#FFFFFF] dark:bg-[#1B2430]">CLEAN (0.02)</span>
                    </div>
                    <div className="h-20 bg-[#E2E4DC] dark:bg-[#181F28] rounded border border-[#D0D5CA] dark:border-[#2D3949] flex items-center justify-center text-[10px] text-[#526071] dark:text-[#9DA3A0] relative overflow-hidden">
                      <div className="text-center">
                        <div className="font-bold text-[#1B2430] dark:text-[#EAEBE3]">ELA + COPY-MOVE MATRIX</div>
                        <div className="text-[9px]">0 Alterations • 0 Cloned Keypoints</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#D0D5CA]/50 dark:border-[#2D3949] text-[#526071] dark:text-[#9DA3A0]">
                      <span>Biometric Face SFace:</span>
                      <span className="text-[#3F4A2C] dark:text-[#6B7D46] font-bold">96.4% Match</span>
                    </div>
                  </div>

                  {/* Right Box: OCR & MRZ */}
                  <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#1B2430] border border-[#D0D5CA] dark:border-[#2D3949] space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#D0D5CA] dark:border-[#2D3949]">
                      <span className="font-bold text-[#1B2430] dark:text-[#EAEBE3] flex items-center space-x-1">
                        <Binary className="w-3.5 h-3.5 text-[#526071] dark:text-[#9DA3A0]" />
                        <span>ICAO 9303 MRZ</span>
                      </span>
                      <span className="text-[10px] text-[#3F4A2C] dark:text-[#6B7D46] font-bold border-2 border-[#3F4A2C] dark:border-[#6B7D46] px-1 py-0.2 rounded bg-[#FFFFFF] dark:bg-[#1B2430]">7-3-1 PASS</span>
                    </div>
                    <div className="p-2 bg-[#E2E4DC] dark:bg-[#181F28] rounded border border-[#D0D5CA] dark:border-[#2D3949] text-[9px] text-[#1B2430] dark:text-[#EAEBE3] font-mono leading-tight whitespace-pre truncate">
                      P&lt;UTOERIKSSON&lt;&lt;ANNA&lt;MARIA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
                      {'\n'}L898902C33UTO7408122F1204159ZE184226B&lt;&lt;&lt;&lt;&lt;&lt;&lt;10
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 border-t border-[#D0D5CA]/50 dark:border-[#2D3949]">
                      <div>
                        <span className="text-[#526071] dark:text-[#9DA3A0]">DOC:</span> <strong className="text-[#1B2430] dark:text-[#EAEBE3]">L898902C3</strong>
                      </div>
                      <div>
                        <span className="text-[#526071] dark:text-[#9DA3A0]">DOB:</span> <strong className="text-[#1B2430] dark:text-[#EAEBE3]">12 AUG 1974</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </BrowserFrame>
          </div>
        </div>
      </div>

      {/* Bottom MRZ Structural Footer Divider */}
      <div>
        <MRZDivider
          text="PEHCHAAN<BORDER<SECURITY<ICAO<DOC<9303<TD1<TD2<TD3<STANDARDS<ENFORCED<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
          opacity="opacity-25 dark:opacity-35"
          className="border-t border-[#D0D5CA] dark:border-[#2D3949] bg-[#E2E4DC]/60 dark:bg-[#181F28]/60 px-4 py-1"
        />
        <footer className="bg-[#EAEBE3] dark:bg-[#14161C] py-4 px-4 text-center text-xs font-mono text-[#526071] dark:text-[#9DA3A0] border-t border-[#D0D5CA] dark:border-[#2D3949] transition-colors duration-200">
          PEHCHAAN Screening Console • ICAO Doc 9303 Compliant • Border Control Station Edition
        </footer>
      </div>
    </div>
  );
};
