import { HttpError } from './http.ts';

interface AnthropicMessage {
  role: 'user';
  content: string;
}

interface AnthropicResponse {
  content?: Array<{ type: string; text?: string }>;
  error?: { message?: string };
}

interface GeminiResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

export async function askAnthropic(system: string, userMessage: string, maxTokens = 320): Promise<string> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw new HttpError(503, 'AI belum dikonfigurasi.');
  }

  const model = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-3-5-haiku-latest';
  const messages: AnthropicMessage[] = [{ role: 'user', content: userMessage }];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0.2,
      system,
      messages,
    }),
  });

  const payload = (await response.json().catch(() => null)) as AnthropicResponse | null;

  if (!response.ok) {
    console.error('Anthropic request failed', response.status, payload?.error?.message);
    throw new HttpError(502, 'Layanan AI sedang tidak tersedia.');
  }

  const text = payload?.content
    ?.filter((block) => block.type === 'text' && block.text)
    .map((block) => block.text)
    .join('\n')
    .trim();

  if (!text) {
    throw new HttpError(502, 'Layanan AI tidak mengembalikan jawaban.');
  }

  return text;
}

/**
 * AI gateway: Gemini (OpenAI-compatible) takes priority when GEMINI_API_KEY is
 * set; otherwise falls back to Anthropic via askAnthropic. Both accept the same
 * { system, messages, max_tokens, temperature } shape used by the edge functions.
 */
export async function askAI(system: string, userMessage: string, maxTokens = 320): Promise<string> {
  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  if (geminiKey) {
    const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.0-flash';
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${geminiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    const payload = (await response.json().catch(() => null)) as GeminiResponse | null;

    if (!response.ok) {
      console.error('Gemini request failed', response.status, payload?.error?.message);
      throw new HttpError(502, 'Layanan AI sedang tidak tersedia.');
    }

    const text = payload?.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new HttpError(502, 'Layanan AI tidak mengembalikan jawaban.');
    }

    return text;
  }

  return askAnthropic(system, userMessage, maxTokens);
}
