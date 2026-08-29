import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Scan, Sun, Moon, UserCheck, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { MRZDivider } from './ui/MRZDivider';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { officer, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#F4F5F0] dark:bg-[#1B2430] border-b border-[#D0D5CA] dark:border-[#2D3949] shadow-[0_1px_3px_rgba(27,36,48,0.04)] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Authority Info */}
          <div className="flex items-center space-x-3">
            <Link to={isAuthenticated ? "/" : "/login"} className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-md bg-[#1B2430] dark:bg-[#14161C] text-[#EAEBE3] flex items-center justify-center border border-[#1B2430] dark:border-[#2D3949] transition-colors">
                <Shield className="w-5 h-5 text-[#EAEBE3]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold tracking-tight text-[#1B2430] dark:text-[#EAEBE3] text-lg">PEHCHAAN</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#E2E4DC] dark:bg-[#14161C] text-[#1B2430] dark:text-[#EAEBE3] border border-[#D0D5CA] dark:border-[#2D3949] rounded">
                    DOC-9303
                  </span>
                </div>
                <div className="text-[10px] text-[#526071] dark:text-[#9DA3A0] font-mono tracking-wider uppercase">
                  Border Checkpoint Screening
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Links (visible when authenticated) */}
          {isAuthenticated && (
            <nav className="flex items-center space-x-2 sm:space-x-3">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors ${
                  location.pathname === '/'
                    ? 'bg-[#FFFFFF] dark:bg-[#222B38] text-[#1B2430] dark:text-[#EAEBE3] border border-[#D0D5CA] dark:border-[#2D3949] shadow-xs'
                    : 'text-[#526071] dark:text-[#9DA3A0] hover:text-[#1B2430] dark:hover:text-[#EAEBE3] hover:bg-[#EAEBE3] dark:hover:bg-[#222B38]'
                }`}
              >
                Overview
              </Link>
              <Link
                to="/upload"
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors ${
                  location.pathname === '/upload'
                    ? 'bg-[#1B2430] dark:bg-[#EAEBE3] text-[#EAEBE3] dark:text-[#14161C] font-bold shadow-xs'
                    : 'bg-[#FFFFFF] dark:bg-[#222B38] text-[#1B2430] dark:text-[#EAEBE3] hover:bg-[#EAEBE3] dark:hover:bg-[#14161C] border border-[#D0D5CA] dark:border-[#2D3949]'
                }`}
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Verify Document</span>
              </Link>
            </nav>
          )}

          {/* Officer Session Status, Station Beacon & Theme Toggle */}
          <div className="flex items-center space-x-2.5">
            {/* Authenticated Officer Badge & Logout */}
            {isAuthenticated && officer ? (
              <div className="flex items-center space-x-2 pl-2 sm:pl-3 border-l border-[#D0D5CA] dark:border-[#2D3949]">
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#E2E4DC] dark:bg-[#14161C] border border-[#D0D5CA] dark:border-[#2D3949] text-xs font-mono text-[#1B2430] dark:text-[#EAEBE3]">
                  <UserCheck className="w-3.5 h-3.5 text-[#3F4A2C] dark:text-[#6B7D46]" />
                  <span className="text-[#526071] dark:text-[#9DA3A0] hidden sm:inline">Officer:</span>
                  <span className="font-bold">{officer.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Log out of screening workstation"
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold text-[#A23B2E] dark:text-[#C24B3B] hover:bg-[#A23B2E]/10 dark:hover:bg-[#C24B3B]/15 border border-[#A23B2E]/30 dark:border-[#C24B3B]/30 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Log out</span>
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-md bg-[#E2E4DC] dark:bg-[#14161C] border border-[#D0D5CA] dark:border-[#2D3949] text-[10px] font-mono text-[#1B2430] dark:text-[#EAEBE3]">
                <span className="w-2 h-2 rounded-full bg-[#3F4A2C] dark:bg-[#6B7D46]"></span>
                <span className="font-bold">STATION: CP-ALPHA-01</span>
                <span className="text-[#A0A796] dark:text-[#68717B]">|</span>
                <span className="text-[#526071] dark:text-[#9DA3A0]">SECURE LOGIN</span>
              </div>
            )}

            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="p-2 rounded-md bg-[#E2E4DC] dark:bg-[#14161C] border border-[#D0D5CA] dark:border-[#2D3949] text-[#1B2430] dark:text-[#EAEBE3] hover:bg-[#D0D5CA] dark:hover:bg-[#222B38] transition-colors cursor-pointer"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-[#1B2430]" />
              ) : (
                <Sun className="w-4 h-4 text-[#EAEBE3]" />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* MRZ Signature divider accent on bottom of header */}
      <MRZDivider
        text="P<UTOPEHCHAAN<<STATION<ALPHA<01<ICAO<9303<ENFORCEMENT<NODE<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<"
        opacity="opacity-15 dark:opacity-25"
        className="border-t border-[#D0D5CA]/50 dark:border-[#2D3949] bg-[#EAEBE3]/80 dark:bg-[#14161C]/80 py-0.5 px-4"
      />
    </header>
  );
};
