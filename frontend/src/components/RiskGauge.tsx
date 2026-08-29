import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';
import { RiskAssessment } from '../types';

interface RiskGaugeProps {
  risk: RiskAssessment;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ risk }) => {
  const { overall_score, risk_level, recommendation, plain_english_explanation, risk_factors } = risk;

  const getColorConfig = () => {
    switch (risk_level) {
      case 'LOW':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: ShieldCheck,
          accent: '#10b981',
          shadow: 'shadow-emerald-500/10'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          text: 'text-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: AlertTriangle,
          accent: '#f59e0b',
          shadow: 'shadow-amber-500/10'
        };
      case 'HIGH':
      case 'CRITICAL':
      default:
        return {
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          text: 'text-rose-400',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: ShieldAlert,
          accent: '#f43f5e',
          shadow: 'shadow-rose-500/10'
        };
    }
  };

  const config = getColorConfig();
  const Icon = config.icon;

  // Arc calculation for radial gauge
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall_score / 100) * circumference;

  return (
    <div className={`p-5 rounded-xl border ${config.border} ${config.bg} ${config.shadow} shadow-lg backdrop-blur-sm transition-all`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Score Gauge & Verdict */}
        <div className="flex items-center space-x-4">
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={config.accent}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black font-mono tracking-tight text-white">
                {Math.round(overall_score)}
              </span>
              <span className="text-[9px] uppercase font-bold text-slate-400">Risk Score</span>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 text-xs font-black uppercase rounded-full border ${config.badge}`}>
                {risk_level} RISK
              </span>
              <span className="text-xs font-mono text-slate-400">
                ACTION: <strong className={config.text}>{recommendation}</strong>
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 mt-1 flex items-center space-x-1.5">
              <Icon className={`w-5 h-5 ${config.text}`} />
              <span>
                {recommendation === 'CLEAR' && 'Document Cleared for Passage'}
                {recommendation === 'INVESTIGATE' && 'Secondary Inspection Recommended'}
                {recommendation === 'REJECT' && 'High Fraud Probability — Escalate'}
              </span>
            </h3>
          </div>
        </div>

        {/* Right: Plain-English Summary */}
        <div className="flex-1 md:max-w-xl text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800/80">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
            <span>Automated Screening Assessment</span>
          </div>
          <p className="leading-relaxed text-slate-200">
            {plain_english_explanation}
          </p>
        </div>
      </div>

      {/* Contributing Factors */}
      {risk_factors && risk_factors.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
            Screening Factor Diagnostics:
          </div>
          <div className="flex flex-wrap gap-2">
            {risk_factors.map((factor, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1 text-[11px] px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-slate-300 font-mono"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${risk_level === 'LOW' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span>{factor}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
