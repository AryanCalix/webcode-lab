import type { FunctionsHttpError } from '@supabase/supabase-js';
import { getSupabase } from '../../lib/supabase';

export interface ExerciseSubmissionResult {
  id: string;
  exercise_id: string;
  is_correct: boolean;
  feedback: string;
  submitted_at: string;
}

export interface AiHintResult {
  hint: string;
  source: 'ai' | 'fallback';
}

export interface AiExplanationResult {
  explanation: string;
  source: 'ai' | 'fallback';
}

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

async function invoke<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await getSupabase().functions.invoke(name, { body });

  if (error) {
    throw new Error(await readFunctionError(error));
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Layanan mengembalikan respons yang tidak valid.');
  }

  return data as T;
}

export function submitExercise(input: {
  exerciseId: string;
  html: string;
  css: string;
  js: string;
}): Promise<ExerciseSubmissionResult> {
  return invoke<ExerciseSubmissionResult>('submit-exercise', input);
}

export function requestAiHint(input: {
  exerciseId: string;
  html: string;
  css: string;
  js: string;
  errorMessage?: string;
}): Promise<AiHintResult> {
  return invoke<AiHintResult>('ai-hint', input);
}

export function requestAiExplanation(input: {
  exerciseId: string;
  html: string;
  css: string;
  js: string;
  errorMessage: string;
}): Promise<AiExplanationResult> {
  return invoke<AiExplanationResult>('ai-error-explanation', input);
}
