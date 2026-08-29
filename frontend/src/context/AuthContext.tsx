import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { OfficerInfo, LoginResponse } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  token: string | null;
  officer: OfficerInfo | null;
  isAuthenticated: boolean;
  sessionExpiredMessage: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearSessionExpiredMessage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // CRITICAL: Stored in memory ONLY for security on shared checkpoint workstations.
  // Never written to localStorage or sessionStorage.
  const [token, setToken] = useState<string | null>(null);
  const [officer, setOfficer] = useState<OfficerInfo | null>(null);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  const logout = useCallback(() => {
    setToken(null);
    setOfficer(null);
  }, []);

  const handleSessionExpired = useCallback((msg: string) => {
    setToken(null);
    setOfficer(null);
    setSessionExpiredMessage(msg);
  }, []);

  // Wire auth token getter and session expiration callback with the api service
  useEffect(() => {
    api.setTokenGetter(() => token);
    api.setOnSessionExpired(handleSessionExpired);
  }, [token, handleSessionExpired]);

  const login = async (username: string, password: string): Promise<void> => {
    setSessionExpiredMessage(null);
    const res: LoginResponse = await api.login({ username, password });
    setToken(res.access_token);
    setOfficer(res.officer);
  };

  const clearSessionExpiredMessage = () => {
    setSessionExpiredMessage(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        officer,
        isAuthenticated: !!token,
        sessionExpiredMessage,
        login,
        logout,
        clearSessionExpiredMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
