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

interface ProfileState {
  userId: string | null;
  profile: ProfileRow | null;
}

const EMPTY_PROFILE: ProfileState = { userId: null, profile: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [profileState, setProfileState] = useState<ProfileState>(EMPTY_PROFILE);

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
        setProfileState(EMPTY_PROFILE);
        queryClient.clear();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const sessionUserId = session?.user.id ?? null;

  useEffect(() => {
    if (!sessionUserId) return;

    let active = true;

    getSupabase()
      .from('profiles')
      .select('*')
      .eq('id', sessionUserId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error('Gagal memuat profil pengguna', error);
          setProfileState({ userId: sessionUserId, profile: null });
        } else {
          setProfileState({ userId: sessionUserId, profile: data });
        }
      });

    return () => {
      active = false;
    };
  }, [sessionUserId]);

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

  const profileReady = !session || profileState.userId === sessionUserId;
  const user = session && profileReady ? profileState.profile : null;
  const loading = session === undefined || (session !== null && !profileReady);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session: session ?? null,
      loading,
      login,
      logout,
    }),
    [user, session, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
