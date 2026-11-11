import { z } from 'npm:zod@4';
import { authenticate, enforceRateLimit } from '../_shared/auth.ts';
import { askAIChat } from '../_shared/anthropic.ts';
import { errorResponse, handleOptions, HttpError, jsonResponse, readJson } from '../_shared/http.ts';

const bodySchema = z.object({
  exerciseId: z.uuid().optional(),
  code: z
    .object({
      html: z.string().max(50_000).default(''),
      css: z.string().max(50_000).default(''),
      js: z.string().max(50_000).default(''),
    })
    .optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(4_000),
      }),
    )
    .min(1)
    .max(24),
});

const CHAT_SYSTEM_PROMPT = `Anda adalah asisten tutor AI untuk WebCode Lab, platform pembelajaran Pemrograman Web.
Tugas Anda memberi bimbingan dan petunjuk dalam Bahasa Indonesia, bukan jawaban langsung.
Aturan:
- Jangan pernah menuliskan solusi lengkap atau kode akhir yang bisa langsung disalin.
- Ajukan pertanyaan pemandu atau sebutkan konsep/parts yang perlu dipelajari.
- Batas sekitar 120 kata per balasan. Gunakan nada ramah dan suportif.
- Sesuaikan jawaban dengan konteks: judul latihan, instruksi, dan kode yang sedang dikerjakan.`;

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

    const contextLines: string[] = [`Nama mahasiswa: ${user.email ?? 'mahasiswa'}`];

    if (body.exerciseId) {
      const { data: exercise, error } = await admin
        .from('exercises')
        .select('id, title, instructions, hint, is_published')
        .eq('id', body.exerciseId)
        .maybeSingle();

      if (error) throw new HttpError(500, 'Gagal memuat latihan.');
      if (!exercise?.is_published) throw new HttpError(404, 'Latihan tidak ditemukan.');

      contextLines.push(
        `Judul latihan: ${exercise.title}`,
        `Instruksi: ${truncate(exercise.instructions, 2_000)}`,
        `Hint awal: ${truncate(exercise.hint ?? '', 1_000)}`,
      );
    }

    if (body.code) {
      contextLines.push(
        `HTML saat ini:\n${truncate(body.code.html)}`,
        `CSS saat ini:\n${truncate(body.code.css)}`,
        `JavaScript saat ini:\n${truncate(body.code.js)}`,
      );
    }

    const conversation = body.messages
      .map((message) => `${message.role === 'assistant' ? 'Asisten' : 'Mahasiswa'}: ${message.content}`)
      .join('\n\n');

    const userMessage = conversation
      ? [...contextLines, `Percakapan terakhir:\n${conversation}`]
          .filter(Boolean)
          .join('\n\n')
      : contextLines.join('\n\n');

    await enforceRateLimit(supabase, 'ai-chat', 10, 60);

    const fallbackReply =
      'Maaf, bantuan AI saat ini belum tersedia. Coba lagi sebentar lagi atau gunakan hint dari latihan.';

    let reply = fallbackReply;
    let source: 'ai' | 'fallback' = 'fallback';

    if (Deno.env.get('GEMINI_API_KEY') || Deno.env.get('ANTHROPIC_API_KEY')) {
      try {
        reply = await askAIChat(CHAT_SYSTEM_PROMPT, [
          { role: 'user', content: userMessage },
        ]);
        source = 'ai';
      } catch (aiError) {
        console.error('AI chat failed, using fallback', aiError);
      }
    }

    return jsonResponse(request, { reply, source });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonResponse(request, { error: 'Data permintaan tidak valid.' }, 400);
    }
    return errorResponse(request, error);
  }
});
