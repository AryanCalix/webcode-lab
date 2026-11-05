import { createContext, useContext } from 'react';

export interface AuthContextValue {
  user: import('../data/demoData').User | null;
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  }
  return context;
}
