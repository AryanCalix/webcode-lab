import { createClient, type SupabaseClient, type User } from 'npm:@supabase/supabase-js@2';
import { HttpError } from './http.ts';

export interface AuthenticatedRequest {
  user: User;
  /** Client bound to the caller's JWT; respects RLS and auth.uid(). */
  supabase: SupabaseClient;
  /** Service-role client. Never return raw rows to the browser. */
  admin: SupabaseClient;
}

function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new HttpError(500, `Konfigurasi server tidak lengkap: ${name}.`);
  return value;
}

export async function authenticate(request: Request): Promise<AuthenticatedRequest> {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    throw new HttpError(401, 'Sesi tidak ditemukan. Silakan masuk kembali.');
  }

  const url = requireEnv('SUPABASE_URL');
  const anonKey = requireEnv('SUPABASE_ANON_KEY');

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new HttpError(401, 'Sesi tidak valid atau sudah kedaluwarsa.');
  }

  return { user, supabase, admin: createServiceClient() };
}

/** Service-role client for endpoints without a caller session (e.g. registration). */
export function createServiceClient(): SupabaseClient {
  const url = requireEnv('SUPABASE_URL');
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function enforceRateLimit(
  supabase: SupabaseClient,
  kind: string,
  limit: number,
  windowMinutes: number,
): Promise<void> {
  const { data, error } = await supabase.rpc('check_ai_rate_limit', {
    p_kind: kind,
    p_limit: limit,
    p_window_minutes: windowMinutes,
  });

  if (error) {
    throw new HttpError(500, 'Tidak dapat memeriksa batas penggunaan AI.');
  }

  if (!data) {
    throw new HttpError(429, 'Terlalu banyak permintaan AI. Coba lagi beberapa menit lagi.');
  }
}
