// Shared HTTP helpers for WebCode Lab Edge Functions.
// CORS is restricted to an explicit allow-list in production.

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

function allowedOrigins(): string[] {
  const configured = Deno.env.get('ALLOWED_ORIGINS');
  if (!configured) return DEFAULT_ALLOWED_ORIGINS;
  return configured
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('Origin');
  const allowList = allowedOrigins();
  const allowed = origin && isAllowedOrigin(origin, allowList) ? origin : allowList[0];

  return {
    'Access-Control-Allow-Origin': allowed ?? DEFAULT_ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function isAllowedOrigin(origin: string, allowList: string[]): boolean {
  if (allowList.includes('*') || allowList.includes(origin)) return true;

  // Allow Vercel production and preview deployments without hardcoding every
  // generated URL. Authorization still relies on Supabase JWTs.
  try {
    const url = new URL(origin);
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'vercel.app' || url.hostname.endsWith('.vercel.app'))
    );
  } catch {
    return false;
  }
}

export function jsonResponse(
  request: Request,
  body: unknown,
  status = 200,
  extraHeaders: HeadersInit = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

export function handleOptions(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }
  return null;
}

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function readJson(request: Request): Promise<unknown> {
  const contentType = request.headers.get('Content-Type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new HttpError(415, 'Content-Type harus application/json.');
  }

  const raw = await request.text();
  if (raw.length > 200_000) {
    throw new HttpError(413, 'Payload terlalu besar.');
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, 'Body bukan JSON yang valid.');
  }
}

export function errorResponse(request: Request, error: unknown): Response {
  if (error instanceof HttpError) {
    return jsonResponse(request, { error: error.message }, error.status);
  }

  console.error('Unhandled edge function error', error);
  return jsonResponse(request, { error: 'Terjadi kesalahan pada server.' }, 500);
}
