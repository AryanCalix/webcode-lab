import { z } from 'npm:zod@4';
import { DOMParser } from 'npm:linkedom@0.18.15';
import {
  validateExercise,
  type HtmlDocumentLike,
  type ValidatorConfig,
} from '../_shared/validateExercise.ts';
import { authenticate } from '../_shared/auth.ts';
import { errorResponse, handleOptions, HttpError, jsonResponse, readJson } from '../_shared/http.ts';

const bodySchema = z.object({
  exerciseId: z.uuid(),
  html: z.string().max(100_000),
  css: z.string().max(100_000),
  js: z.string().max(100_000),
});

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  if (request.method !== 'POST') {
    return jsonResponse(request, { error: 'Metode tidak diizinkan.' }, 405);
  }

  try {
    const { user, admin } = await authenticate(request);
    const body = bodySchema.parse(await readJson(request));

    const { data: exercise, error: exerciseError } = await admin
      .from('exercises')
      .select('id, lesson_id, validator_config, is_published')
      .eq('id', body.exerciseId)
      .maybeSingle();

    if (exerciseError) throw new HttpError(500, 'Gagal memuat latihan.');
    if (!exercise?.is_published) throw new HttpError(404, 'Latihan tidak ditemukan.');

    const { data: lesson } = await admin
      .from('lessons')
      .select('id, module_id, is_published')
      .eq('id', exercise.lesson_id)
      .maybeSingle();

    if (!lesson?.is_published) throw new HttpError(404, 'Latihan tidak ditemukan.');

    const { data: moduleRow } = await admin
      .from('modules')
      .select('id, is_published')
      .eq('id', lesson.module_id)
      .maybeSingle();

    if (!moduleRow?.is_published) throw new HttpError(404, 'Latihan tidak ditemukan.');

    const result = validateExercise(
      { html: body.html, css: body.css, js: body.js },
      (exercise.validator_config ?? {}) as ValidatorConfig,
      (html: string) => new DOMParser().parseFromString(html, 'text/html') as unknown as HtmlDocumentLike,
    );

    const { data: submission, error: submissionError } = await admin.rpc(
      'record_exercise_submission',
      {
        p_student_id: user.id,
        p_exercise_id: body.exerciseId,
        p_html: body.html,
        p_css: body.css,
        p_js: body.js,
        p_is_correct: result.isCorrect,
        p_feedback: result.feedback,
      },
    );

    if (submissionError) {
      console.error('record_exercise_submission failed', submissionError);
      throw new HttpError(500, 'Gagal menyimpan jawaban.');
    }

    return jsonResponse(request, submission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonResponse(request, { error: 'Data jawaban tidak valid.' }, 400);
    }
    return errorResponse(request, error);
  }
});
