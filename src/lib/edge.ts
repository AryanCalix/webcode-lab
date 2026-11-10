import type { FunctionsHttpError } from '@supabase/supabase-js';
import { getSupabase } from './supabase';

async function readFunctionError(error: FunctionsHttpError): Promise<string> {
  try {
    const body = (await error.context.json()) as { error?: string; message?: string };
    if (typeof body.error === 'string') return body.error;
    if (typeof body.message === 'string') return body.message;
  } catch {
    // Fall through to the generic message.
  }
  return error.message || 'Layanan tidak dapat dihubungi.';
}

/** Invokes a Supabase Edge Function and surfaces its JSON error message. */
export async function invokeFunction<T>(
  name: string,
  body: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await getSupabase().functions.invoke(name, { body });

  if (error) {
    throw new Error(await readFunctionError(error));
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Layanan mengembalikan respons yang tidak valid.');
  }

  return data as T;
}
