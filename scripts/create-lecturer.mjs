#!/usr/bin/env node
/**
 * Creates a lecturer account (or promotes an existing account).
 *
 * Usage:
 *   npm run create:lecturer -- <email> <password> [fullName]
 *   npm run create:lecturer -- --promote <email> [fullName]
 *
 * Requires the service role key (see .env.seed). Never run in the browser.
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. See .env.seed.example.');
  process.exit(1);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const args = process.argv.slice(2);
const promote = args[0] === '--promote';
if (promote) args.shift();

const [emailArg, ...rest] = args;
const email = emailArg?.trim().toLowerCase();
const password = promote ? undefined : rest[0];
const fullNameArg = promote ? rest[0] : rest[1];

if (!email || !EMAIL_PATTERN.test(email)) {
  console.error('Usage: npm run create:lecturer -- <email> <password> [fullName]');
  console.error('       npm run create:lecturer -- --promote <email> [fullName]');
  process.exit(1);
}

if (!promote && (!password || password.length < 8)) {
  console.error('Password minimal 8 karakter.');
  process.exit(1);
}

const fullName = (fullNameArg?.trim() || email.split('@')[0]).slice(0, 120);

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(target) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;

    const found = data.users.find((user) => user.email?.toLowerCase() === target);
    if (found) return found;
    if (data.users.length < 200) return null;
  }

  return null;
}

async function promoteProfile(userId) {
  const { error } = await admin
    .from('profiles')
    .upsert({ id: userId, full_name: fullName, role: 'lecturer' }, { onConflict: 'id' });

  if (error) throw error;
}

async function main() {
  let userId;
  let created = false;

  if (promote) {
    const existing = await findUserByEmail(email);
    if (!existing) {
      throw new Error(
        `Akun ${email} tidak ditemukan. Jalankan tanpa --promote untuk membuat akun baru.`,
      );
    }
    userId = existing.id;
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (error) {
      if (/already|registered|exists/i.test(error.message)) {
        throw new Error(
          'Email sudah terdaftar. Gunakan --promote <email> untuk menjadikannya dosen.',
        );
      }
      throw error;
    }

    userId = data.user.id;
    created = true;
  }

  await promoteProfile(userId);

  console.log(`${created ? 'Akun dosen dibuat' : 'Akun dipromosikan menjadi dosen'}: ${email}`);
  console.log(`Nama: ${fullName}`);
  console.log('Akun langsung aktif dan sudah bisa dipakai login.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
