import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { ProfileRow } from '../lib/database.types';

export interface LoginResult {
  ok: boolean;
  error?: string;
}

export interface AuthContextValue {
  user: ProfileRow | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  }
  return context;
}
