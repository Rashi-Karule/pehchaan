import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, AlertTriangle, KeyRound, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, sessionExpiredMessage, clearSessionExpiredMessage } = useAuth();

  const [username, setUsername] = useState('officer_chen');
  const [password, setPassword] = useState('Checkpoint2026!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login(username.trim(), password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setUsername('officer_chen');
    setPassword('Checkpoint2026!');
    setError(null);
    clearSessionExpiredMessage();
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center px-4 py-12 animate-page-reveal">
      <div className="w-full max-w-md space-y-6">
        
        {/* Official Station Header Card */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E2E4DC] dark:bg-[#181F28] border border-[#D0D5CA] dark:border-[#2D3949] text-[11px] font-mono text-[#526071] dark:text-[#9DA3A0] uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5 text-[#1B2430] dark:text-[#EAEBE3]" />
            <span>Restricted Border Workstation • CP-Alpha-01</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2430] dark:text-[#EAEBE3] tracking-tight">
            Officer Authentication
          </h1>
          <p className="text-xs text-[#526071] dark:text-[#9DA3A0] max-w-sm mx-auto">
            Authorized border checkpoint screening personnel only. All access, scans, and adjudications are recorded for audit compliance.
          </p>
        </div>

        {/* Session Expired Alert */}
        {sessionExpiredMessage && (
          <div className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#1B2430] border-2 border-[#A23B2E] dark:border-[#C24B3B] text-[#A23B2E] dark:text-[#C24B3B] text-xs font-mono flex items-start space-x-3 shadow-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block uppercase tracking-wider">Session Invalidation</span>
              <span>{sessionExpiredMessage}</span>
            </div>
          </div>
        )}

        {/* Authentication Error Alert */}
        {error && (
          <div className="p-4 rounded-lg bg-[#FFFFFF] dark:bg-[#1B2430] border-2 border-[#A23B2E] dark:border-[#C24B3B] text-[#A23B2E] dark:text-[#C24B3B] text-xs font-mono flex items-center space-x-2 shadow-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {/* Login Form Surface */}
        <div className="bg-[#FFFFFF] dark:bg-[#1B2430] rounded-xl border border-[#D0D5CA] dark:border-[#2D3949] p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="pb-4 border-b border-[#D0D5CA] dark:border-[#2D3949] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <KeyRound className="w-4 h-4 text-[#1B2430] dark:text-[#EAEBE3]" />
              <span className="text-xs font-mono font-bold uppercase text-[#1B2430] dark:text-[#EAEBE3]">
                Officer Credentials
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase text-[#526071] dark:text-[#9DA3A0]">
              Shift Length: 8h
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#1B2430] dark:text-[#EAEBE3] font-bold uppercase mb-1.5">
                Officer Username / Badge ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#526071] dark:text-[#9DA3A0]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. officer_chen"
                  autoComplete="username"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F4F5F0] dark:bg-[#222B38] border border-[#D0D5CA] dark:border-[#2D3949] rounded-lg text-sm text-[#1B2430] dark:text-[#EAEBE3] font-mono focus:outline-none focus:border-[#1B2430] dark:focus:border-[#EAEBE3] focus:ring-1 focus:ring-[#1B2430] dark:focus:ring-[#EAEBE3] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#1B2430] dark:text-[#EAEBE3] font-bold uppercase mb-1.5">
                Workstation Security Keycode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#526071] dark:text-[#9DA3A0]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F4F5F0] dark:bg-[#222B38] border border-[#D0D5CA] dark:border-[#2D3949] rounded-lg text-sm text-[#1B2430] dark:text-[#EAEBE3] font-mono focus:outline-none focus:border-[#1B2430] dark:focus:border-[#EAEBE3] focus:ring-1 focus:ring-[#1B2430] dark:focus:ring-[#EAEBE3] transition-all"
                />
              </div>
            </div>

            {/* Primary Action Button — Accent #A23B2E Ink-Stamp Red */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-lg font-bold text-sm tracking-wide uppercase bg-[#A23B2E] dark:bg-[#C24B3B] hover:bg-[#7A2A20] dark:hover:bg-[#9E3528] active:bg-[#7A2A20] text-[#FFFFFF] dark:text-[#14161C] shadow-xs hover:shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating Station...</span>
                </>
              ) : (
                <>
                  <span>Begin Screening Shift</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Seeded Credential Helper Card */}
          <div className="pt-4 border-t border-[#D0D5CA] dark:border-[#2D3949] space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#526071] dark:text-[#9DA3A0] uppercase text-[10px]">
                Active Checkpoint Officer Account
              </span>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-[10px] font-bold text-[#3F4A2C] dark:text-[#6B7D46] hover:underline cursor-pointer flex items-center space-x-1"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Autofill Credentials</span>
              </button>
            </div>

            <div className="p-2.5 rounded-lg bg-[#E2E4DC] dark:bg-[#181F28] border border-[#D0D5CA] dark:border-[#2D3949] text-xs font-mono text-[#1B2430] dark:text-[#EAEBE3] flex items-center justify-between">
              <div>
                <span className="text-[#526071] dark:text-[#9DA3A0]">Username: </span>
                <span className="font-bold">officer_chen</span>
              </div>
              <div>
                <span className="text-[#526071] dark:text-[#9DA3A0]">Keycode: </span>
                <span className="font-bold">Checkpoint2026!</span>
              </div>
            </div>
          </div>

        </div>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-[10px] font-mono text-[#526071] dark:text-[#9DA3A0]">
            PEHCHAAN Automated Border Forensics Engine • Session Security Protocol v2.4
          </p>
        </div>

      </div>
    </div>
  );
};
