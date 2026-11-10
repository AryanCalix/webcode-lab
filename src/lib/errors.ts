import type { PostgrestError } from '@supabase/supabase-js';

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') return message;
  }
  return 'Terjadi kesalahan yang tidak diketahui.';
}

export function throwIfError(error: PostgrestError | null): void {
  if (error) throw new Error(error.message);
}

export function requireData<T>(data: T | null, error: PostgrestError | null): T {
  throwIfError(error);
  if (data === null) throw new Error('Data tidak ditemukan.');
  return data;
}
