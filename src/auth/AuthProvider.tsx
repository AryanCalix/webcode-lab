import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { demoUsers, type User } from '../data/demoData';
import { AuthContext, type AuthContextValue } from './AuthContext';

const SESSION_STORAGE_KEY = 'webcode.session';

function readStoredSessionUser(): User | null {
  try {
    const storedId = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!storedId) {
      return null;
    }
    const storedUser = demoUsers.find((candidate) => candidate.id === storedId);
    return storedUser ?? null;
  } catch {
    // localStorage bisa diblokir (mis. private mode); anggap tidak ada sesi.
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredSessionUser());

  const login = useCallback((email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const found = demoUsers.find(
      (candidate) =>
        candidate.email.toLowerCase() === normalizedEmail && candidate.password === password,
    );

    if (!found) {
      return { ok: false as const, error: 'Email atau password tidak cocok dengan akun demo.' };
    }

    setUser(found);
    try {
      window.localStorage.setItem(SESSION_STORAGE_KEY, found.id);
    } catch {
      // abaikan kegagalan penyimpanan lokal
    }
    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // abaikan
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, login, logout }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
