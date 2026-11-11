import { z } from 'npm:zod@4';
import { authenticate, enforceRateLimit } from '../_shared/auth.ts';
import { askAI } from '../_shared/anthropic.ts';
import { errorResponse, handleOptions, HttpError, jsonResponse, readJson } from '../_shared/http.ts';

const bodySchema = z.object({
  exerciseId: z.uuid(),
  html: z.string().max(50_000).default(''),
  css: z.string().max(50_000).default(''),
  js: z.string().max(50_000).default(''),
  errorMessage: z.string().min(1).max(2_000),
});

const SYSTEM_PROMPT = `Anda adalah tutor Pemrograman Web untuk mahasiswa pemula.
Jelaskan kesalahan pada kode mahasiswa dalam Bahasa Indonesia yang sederhana.
Aturan:
- Sebutkan penyebab kesalahan secara konseptual.
- Berikan langkah perbaikan, tetapi jangan menuliskan solusi lengkap.
- Maksimal 100 kata. Hindari istilah teknis yang tidak dijelaskan.`;

function truncate(value: string, limit = 4_000): string {
  return value.length > limit ? `${value.slice(0, limit)}\n… (dipotong)` : value;
}

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  if (request.method !== 'POST') {
    return jsonResponse(request, { error: 'Metode tidak diizinkan.' }, 405);
  }

  try {
    const { supabase, admin } = await authenticate(request);
    const body = bodySchema.parse(await readJson(request));

    const { data: exercise, error } = await admin
      .from('exercises')
      .select('id, title, instructions, hint, is_published')
      .eq('id', body.exerciseId)
      .maybeSingle();

    if (error) throw new HttpError(500, 'Gagal memuat latihan.');
    if (!exercise?.is_published) throw new HttpError(404, 'Latihan tidak ditemukan.');

    await enforceRateLimit(supabase, 'error-explanation', 15, 60);

    const fallback =
      exercise.hint?.trim() ||
      'Baca kembali pesan kesalahan dan periksa elemen atau properti yang disebutkan.';

    let explanation = fallback;
    let source: 'ai' | 'fallback' = 'fallback';

    if (Deno.env.get('GEMINI_API_KEY') || Deno.env.get('ANTHROPIC_API_KEY')) {
      try {
        explanation = await askAI(
          SYSTEM_PROMPT,
          [
            `Judul latihan: ${exercise.title}`,
            `Instruksi: ${truncate(exercise.instructions, 2_000)}`,
            `Pesan kesalahan: ${truncate(body.errorMessage, 1_500)}`,
            `HTML:\n${truncate(body.html)}`,
            `CSS:\n${truncate(body.css)}`,
            `JavaScript:\n${truncate(body.js)}`,
          ].join('\n\n'),
        );
        source = 'ai';
      } catch (aiError) {
        console.error('AI explanation failed, using fallback', aiError);
      }
    }

    return jsonResponse(request, { explanation, source });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonResponse(request, { error: 'Data permintaan tidak valid.' }, 400);
    }
    return errorResponse(request, error);
  }
});
