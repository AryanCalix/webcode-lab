# WebCode Lab

Platform pembelajaran interaktif untuk mata kuliah Pemrograman Web — menggabungkan materi, editor kode dengan live preview, kuis, proyek mini, forum, dan gamifikasi.

Aplikasi ini dibangun berdasarkan dokumen konteks produk **WebCode Lab — Rancang Software Pembelajaran Interaktif**.

## Tech Stack

- React 19 + Vite 8 + TypeScript (strict)
- Tailwind CSS v4
- React Router v7
- Monaco Editor (self-hosted, lazy-loaded) + iframe sandbox
- Supabase Auth + Postgres + Row Level Security + Edge Functions
- TanStack Query, Zod, Vitest, Playwright, oxlint

## Fitur (produksi)

- **Auth**: Supabase Auth (email + password), dua akun demo, pendaftaran publik dinonaktifkan.
- **Materi & latihan**: modul → pelajaran → latihan; penilaian kode server-side via Edge Function `submit-exercise` dengan validasi HTML/CSS (selector, teks, properti warna) + pencatatan XP.
- **AI**: Edge Functions `ai-hint` & `ai-error-explanation` memakai Claude API (server-side only) dengan rate limit; fallback ke hint latihan saat AI belum dikonfigurasi.
- **Kuis**: RPC `start_quiz_attempt` / `submit_quiz_attempt`; jawaban dihitung server-side, kunci jawaban hanya dibawa mahasiswa lewat RPC.
- **Proyek mini**: pengumpulan tautan & teks via RPC `submit_project`.
- **Forum**: diskusi mahasiswa + respons dari dosen.
- **Gamifikasi**: XP / level / streak / badge melalui RPC keamanan `SECURITY DEFINER`.
- **Dashboard dosen**: ringkasan mahasiswa, modul, hasil kuis & pengumpulan proyek.

## Struktur Penting

```
supabase/
  config.toml
  migrations/        # schema, RLS, domain functions, seed demo content
  functions/         # _shared + submit-exercise, ai-hint, ai-error-explanation
src/
  features/          # modul, dashboard, quizzes, projects, forum, lecturer, exercises
  lib/               # supabase client, database types, format, errors, queryClient
  pages/             # student & lecturer pages
  auth/              # Supabase session handling + guards
e2e/                 # Playwright smoke tests
scripts/             # seed auth demo users via service role
```

## Environment

```bash
cp .env.example .env.local   # lalu isi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY
cp .env.seed.example .env.seed # lalu isi SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY
```

Hanya nilai `VITE_*` berikut yang boleh ada di frontend (publishable key); service role & kunci AI tidak pernah boleh masuk ke browser.

## Setup Backend (Supabase)

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push          # terapkan migrasi + seed demo content
npm run seed:auth             # buat akun auth demo + aktivitas awal
npx supabase functions deploy --project-ref <PROJECT_REF>
npx supabase secrets set ANTHROPIC_API_KEY=...
npx supabase secrets set ANTHROPIC_MODEL=claude-3-5-haiku-latest
npx supabase secrets set ALLOWED_ORIGINS=http://localhost:5173
```

## Akun Demo

| Role     | Email               | Password   |
| -------- | ------------------- | ---------- |
| Mahasiswa | budi@webcode.lab | budi1234   |
| Dosen    | siti@webcode.lab   | siti1234   |

## Perintah

```bash
npm run dev        # dev server
npm run build      # typecheck + build production
npm run typecheck  # tsc -b
npm run lint       # oxlint
npm run test       # vitest
npm run test:e2e   # playwright (butuh dev server & browser)
npm run preview    # preview build production
npm run seed:auth # seed akun demo + aktivitas awal
npm run db:push    # supabase db push
npm run db:diff    # supabase db diff
npm run functions:serve
```

## Keamanan

- Row Level Security aktif di semua tabel publik; akses lewat RPC `SECURITY DEFINER` yang sudah divalidasi.
- Quiz kunci jawaban hanya dibagikan lewat RPC `start_quiz_attempt` / `submit_quiz_attempt` (server-side grading).
- Edge Functions memakai auth user JWT + service role server-side; rate limit AI (mis. 20 request / 60 menit untuk hint).
- Validasi kode latihan dijalankan di Edge Function, bukan di browser.

## Status

- Fondasi, auth, modul, playground, kuis, proyek, forum, gamifikasi: ✅ selesai.
- AI (Claude) via Edge Function dengan fallback: ✅ terpasang (mengbut pengaturan secret).
- End-to-end & production deploy: menunggu kredensial Supabase / Anthropic.
