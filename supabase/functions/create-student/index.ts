import { z } from 'npm:zod@4';
import { authenticate } from '../_shared/auth.ts';
import {
  errorResponse,
  handleOptions,
  HttpError,
  jsonResponse,
  readJson,
} from '../_shared/http.ts';

const bodySchema = z.object({
  fullName: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(120),
  email: z.email('Email tidak valid.'),
  password: z.string().min(8, 'Password minimal 8 karakter.').max(72),
});

Deno.serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  if (request.method !== 'POST') {
    return jsonResponse(request, { error: 'Metode tidak diizinkan.' }, 405);
  }

  try {
    const { user, supabase, admin } = await authenticate(request);

    const { data: caller, error: callerError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (callerError) throw new HttpError(500, 'Gagal memeriksa izin pengguna.');
    if (caller?.role !== 'lecturer') {
      throw new HttpError(403, 'Hanya dosen yang dapat menambah mahasiswa.');
    }

    const body = bodySchema.parse(await readJson(request));
    const email = body.email.trim().toLowerCase();

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password: body.password,
      email_confirm: true,
      user_metadata: { full_name: body.fullName },
    });

    if (createError || !created.user) {
      const message = createError?.message ?? '';
      if (/already|registered|exists/i.test(message)) {
        throw new HttpError(409, 'Email sudah terdaftar.');
      }
      console.error('create student failed', createError);
      throw new HttpError(500, 'Gagal membuat akun mahasiswa.');
    }

    // The auth trigger creates the profile and gamification row. Update the name
    // defensively in case the trigger fell back to the email prefix.
    const { error: profileError } = await admin
      .from('profiles')
      .update({ full_name: body.fullName })
      .eq('id', created.user.id);

    if (profileError) {
      console.error('update student profile failed', profileError);
      await admin.auth.admin.deleteUser(created.user.id);
      throw new HttpError(500, 'Gagal menyimpan profil mahasiswa.');
    }

    return jsonResponse(
      request,
      { id: created.user.id, email, fullName: body.fullName },
      201,
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonResponse(
        request,
        { error: error.issues[0]?.message ?? 'Data mahasiswa tidak valid.' },
        400,
      );
    }
    return errorResponse(request, error);
  }
});
