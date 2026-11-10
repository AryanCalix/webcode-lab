import { z } from 'npm:zod@4';
import { authenticate, enforceRateLimit } from '../_shared/auth.ts';
import { askAI } from '../_shared/anthropic.ts';
import { errorResponse, handleOptions, HttpError, jsonResponse, readJson } from '../_shared/http.ts';

const bodySchema = z.object({
  exerciseId: z.uuid(),
  html: z.string().max(50_000).default(''),
  css: z.string().max(50_000).default(''),
  js: z.string().max(50_000).default(''),
  errorMessage: z.string().max(2_000).optional(),
});

const SYSTEM_PROMPT = `Anda adalah asisten dosen Pemrograman Web untuk mahasiswa pemula.
Tugas Anda memberi petunjuk singkat dalam Bahasa Indonesia, bukan jawaban lengkap.
Aturan:
- Jangan pernah menuliskan solusi lengkap atau kode akhir yang bisa langsung disalin.
- Ajukan satu pertanyaan pemandu atau sebutkan satu konsep yang perlu diperiksa.
- Maksimal 70 kata. Gunakan nada ramah dan suportif.
- Jika kode sudah hampir benar, sebutkan bagian mana yang perlu dicek.`;

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
    const { user, supabase, admin } = await authenticate(request);
    const body = bodySchema.parse(await readJson(request));

    const { data: exercise, error } = await admin
      .from('exercises')
      .select('id, title, instructions, hint, is_published')
      .eq('id', body.exerciseId)
      .maybeSingle();

    if (error) throw new HttpError(500, 'Gagal memuat latihan.');
    if (!exercise?.is_published) throw new HttpError(404, 'Latihan tidak ditemukan.');

    await enforceRateLimit(supabase, 'hint', 20, 60);

    const fallbackHint =
      exercise.hint?.trim() ||
      'Periksa kembali instruksi latihan dan bandingkan dengan elemen atau properti yang Anda tulis.';

    let hint = fallbackHint;
    let source: 'ai' | 'fallback' = 'fallback';

    if (Deno.env.get('GEMINI_API_KEY') || Deno.env.get('ANTHROPIC_API_KEY')) {
      try {
        hint = await askAI(
          SYSTEM_PROMPT,
          [
            `Judul latihan: ${exercise.title}`,
            `Instruksi: ${truncate(exercise.instructions, 2_000)}`,
            body.errorMessage ? `Umpan balik terakhir: ${truncate(body.errorMessage, 1_000)}` : '',
            `HTML saat ini:\n${truncate(body.html)}`,
            `CSS saat ini:\n${truncate(body.css)}`,
            `JavaScript saat ini:\n${truncate(body.js)}`,
            `Nama mahasiswa: ${user.email ?? 'mahasiswa'}`,
          ]
            .filter(Boolean)
            .join('\n\n'),
        );
        source = 'ai';
      } catch (aiError) {
        console.error('AI hint failed, using fallback', aiError);
      }
    }

    return jsonResponse(request, { hint, source });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonResponse(request, { error: 'Data permintaan tidak valid.' }, 400);
    }
    return errorResponse(request, error);
  }
});
