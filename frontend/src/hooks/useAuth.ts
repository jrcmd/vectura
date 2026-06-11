import React, { createContext, useContext, useEffect, useState } from 'react';

type Session = {
  id: string;
  email: string;
  role: string;
  status: string;
  firstName?: string | null;
  lastName?: string | null;
  accessToken: string;
  refreshToken: string;
};

type AuthContextValue = {
  session: Session | null;
  login: (session: Session) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('vectura.session');
      if (raw) setSession(JSON.parse(raw));
    } catch {
      setSession(null);
    }
  }, []);

  const login = (next: Session) => {
    setSession(next);
    sessionStorage.setItem('vectura.session', JSON.stringify(next));
  };

  const logout = () => {
    setSession(null);
    sessionStorage.removeItem('vectura.session');
  };

  return React.createElement(AuthContext.Provider, { value: { session, login, logout } }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
