import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { ProfileRow } from '../lib/database.types';
import { queryClient } from '../lib/queryClient';
import { getSupabase } from '../lib/supabase';
import { AuthContext, type AuthContextValue, type LoginResult } from './AuthContext';

function mapAuthError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid login credentials')) {
    return 'Email atau password salah.';
  }
  if (normalized.includes('email not confirmed')) {
    return 'Email belum dikonfirmasi. Hubungi dosen atau administrator.';
  }
  if (normalized.includes('too many requests')) {
    return 'Terlalu banyak percobaan masuk. Coba lagi beberapa saat lagi.';
  }
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [user, setUser] = useState<ProfileRow | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const client = getSupabase();
    let active = true;

    client.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session === undefined) return;

    if (!session) {
      setUser(null);
      setProfileLoading(false);
      return;
    }

    let active = true;
    setProfileLoading(true);

    getSupabase()
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error('Gagal memuat profil pengguna', error);
          setUser(null);
        } else {
          setUser(data);
        }
        setProfileLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session]);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const { error } = await getSupabase().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return { ok: false, error: mapAuthError(error.message) };
    }

    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await getSupabase().auth.signOut();
    queryClient.clear();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session: session ?? null,
      loading: session === undefined || profileLoading,
      login,
      logout,
    }),
    [user, session, profileLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
