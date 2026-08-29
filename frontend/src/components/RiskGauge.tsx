import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import { RiskAssessment } from '../types';
import { useTheme } from '../context/ThemeContext';

interface RiskGaugeProps {
  risk: RiskAssessment;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ risk }) => {
  const { overall_score, risk_level, recommendation, plain_english_explanation, risk_factors } = risk;
  const { theme } = useTheme();

  const getColorConfig = () => {
    switch (risk_level) {
      case 'LOW':
        return {
          bg: 'bg-[#FFFFFF] dark:bg-[#1B2430]',
          border: 'border-2 border-[#3F4A2C] dark:border-[#6B7D46] shadow-sm',
          badge: 'bg-[#3F4A2C] text-[#FFFFFF] border-2 border-[#2A3320] dark:bg-[#6B7D46] dark:border-[#4F5D33] font-black',
          text: 'text-[#3F4A2C] dark:text-[#6B7D46]',
          icon: ShieldCheck,
          accent: theme === 'dark' ? '#6B7D46' : '#3F4A2C',
          summaryBorder: 'border border-[#3F4A2C]/30 dark:border-[#6B7D46]/40',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-[#FFFFFF] dark:bg-[#1B2430]',
          border: 'border-2 border-[#A23B2E] dark:border-[#C24B3B] shadow-sm',
          badge: 'bg-[#FFFFFF] dark:bg-[#1B2430] text-[#A23B2E] dark:text-[#C24B3B] border-2 border-[#A23B2E] dark:border-[#C24B3B] font-bold',
          text: 'text-[#A23B2E] dark:text-[#C24B3B]',
          icon: AlertTriangle,
          accent: theme === 'dark' ? '#C24B3B' : '#A23B2E',
          summaryBorder: 'border border-[#A23B2E]/30 dark:border-[#C24B3B]/40',
        };
      case 'HIGH':
      case 'CRITICAL':
      default:
        return {
          bg: 'bg-[#FFFFFF] dark:bg-[#1B2430]',
          border: 'border-2 border-[#7A2A20] dark:border-[#9E3528] shadow-sm',
          badge: 'bg-[#A23B2E] text-[#FFFFFF] border-2 border-[#7A2A20] dark:bg-[#C24B3B] dark:border-[#9E3528] font-black',
          text: 'text-[#A23B2E] dark:text-[#C24B3B]',
          icon: ShieldAlert,
          accent: theme === 'dark' ? '#C24B3B' : '#A23B2E',
          summaryBorder: 'border border-[#7A2A20]/40 dark:border-[#9E3528]/50',
        };
    }
  };

  const config = getColorConfig();
  const Icon = config.icon;

  // Arc calculation for radial gauge
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall_score / 100) * circumference;

  return (
    <div className={`p-5 rounded-xl ${config.bg} ${config.border} transition-all duration-200`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left: Score Gauge & Verdict */}
        <div className="flex items-center space-x-4">
          <div className="relative w-22 h-22 flex items-center justify-center shrink-0">
            <svg className="w-22 h-22 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-[#E2E4DC] dark:stroke-[#2D3949]"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={config.accent}
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black font-mono tracking-tight text-[#1B2430] dark:text-[#EAEBE3]">
                {Math.round(overall_score)}
              </span>
              <span className="text-[8px] uppercase font-mono font-bold text-[#526071] dark:text-[#9DA3A0]">Risk / 100</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded ${config.badge}`}>
                {risk_level} RISK
              </span>
              <span className="text-xs font-mono text-[#526071] dark:text-[#9DA3A0]">
                ACTION: <strong className={config.text}>{recommendation}</strong>
              </span>
            </div>
            <h3 className="text-lg font-black text-[#1B2430] dark:text-[#EAEBE3] flex items-center space-x-1.5">
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
        <div className={`flex-1 md:max-w-xl text-xs text-[#1B2430] dark:text-[#EAEBE3] bg-[#F4F5F0] dark:bg-[#222B38] p-4 rounded-lg ${config.summaryBorder}`}>
          <div className="text-[10px] font-bold text-[#526071] dark:text-[#9DA3A0] font-mono uppercase tracking-wider mb-1 flex items-center space-x-1">
            <span>Automated Screening Assessment</span>
          </div>
          <p className="leading-relaxed font-sans text-xs">
            {plain_english_explanation}
          </p>
        </div>
      </div>

      {/* Contributing Factors */}
      {risk_factors && risk_factors.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#D0D5CA] dark:border-[#2D3949]">
          <div className="text-[10px] font-mono uppercase font-bold text-[#526071] dark:text-[#9DA3A0] mb-2 tracking-wider">
            Screening Factor Diagnostics:
          </div>
          <div className="flex flex-wrap gap-2">
            {risk_factors.map((factor, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1.5 text-[11px] px-2.5 py-1 rounded bg-[#E2E4DC] dark:bg-[#181F28] border border-[#D0D5CA] dark:border-[#2D3949] text-[#1B2430] dark:text-[#EAEBE3] font-mono"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${risk_level === 'LOW' ? 'bg-[#3F4A2C] dark:bg-[#6B7D46]' : 'bg-[#A23B2E] dark:bg-[#C24B3B]'}`} />
                <span>{factor}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
