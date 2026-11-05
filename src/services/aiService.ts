export interface AiHintResult {
  status: 'ok' | 'unconfigured';
  hint?: string;
  message?: string;
}

export interface AiErrorExplanationResult {
  status: 'ok' | 'unconfigured';
  explanation?: string;
  message?: string;
}

function getApiKey(): string | undefined {
  const key = import.meta.env.VITE_AI_API_KEY;
  return key ? String(key) : undefined;
}

export function isAiHintAvailable(): boolean {
  return Boolean(getApiKey());
}

/**
 * Meminta hint dari AI (Claude) berdasarkan instruksi latihan, kode pengguna,
 * dan konteks error (jika ada).
 *
 * Pada implementasi saat ini, pemanggilan AI diarahkan melalui backend proxy.
 * Jika API key belum dikonfigurasi, mengembalikan status `unconfigured`.
 */
export async function requestHint(input: {
  exerciseId: string;
  instructions: string;
  code: string;
  errorMessage?: string;
}): Promise<AiHintResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      status: 'unconfigured',
      message: 'Bantuan AI belum dikonfigurasi.',
    };
  }

  const response = await fetch(`${String(import.meta.env.VITE_AI_BASE_URL ?? 'http://localhost:8787')}/v1/hints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      exerciseId: input.exerciseId,
      instructions: input.instructions,
      code: input.code,
      errorMessage: input.errorMessage ?? null,
    }),
  });

  if (!response.ok) {
    return { status: 'unconfigured', message: 'Bantuan AI sedang tidak tersedia.' };
  }

  const data = (await response.json()) as { hint?: string };
  if (!data.hint) {
    return { status: 'unconfigured', message: 'Bantuan AI belum dikonfigurasi.' };
  }

  return { status: 'ok', hint: data.hint };
}

export async function requestErrorExplanation(input: {
  exerciseId: string;
  instructions: string;
  code: string;
  errorMessage: string;
}): Promise<AiErrorExplanationResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      status: 'unconfigured',
      message: 'Penjelasan error AI belum dikonfigurasi.',
    };
  }

  const response = await fetch(`${String(import.meta.env.VITE_AI_BASE_URL ?? 'http://localhost:8787')}/v1/error-explanations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      exerciseId: input.exerciseId,
      instructions: input.instructions,
      code: input.code,
      errorMessage: input.errorMessage,
    }),
  });

  if (!response.ok) {
    return { status: 'unconfigured', message: 'Penjelasan error AI sedang tidak tersedia.' };
  }

  const data = (await response.json()) as { explanation?: string };
  if (!data.explanation) {
    return { status: 'unconfigured', message: 'Penjelasan error AI belum dikonfigurasi.' };
  }

  return { status: 'ok', explanation: data.explanation };
}
