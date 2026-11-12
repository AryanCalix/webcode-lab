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

- **Auth**: Supabase Auth (email + password), dua akun demo, pendaftaran publik dinonaktifkan. Dosen dapat membuat akun mahasiswa baru dari halaman Mahasiswa melalui Edge Function `create-student` (service role hanya di server).
- **Materi & latihan**: modul → pelajaran → latihan; penilaian kode server-side via Edge Function `submit-exercise` dengan validasi HTML/CSS (selector, teks, properti warna) + pencatatan XP.
- **AI**: Edge Functions `ai-chat`, `ai-hint` & `ai-error-explanation` memakai Gemini (fallback Claude) server-side dengan rate limit; fallback ke hint latihan saat AI belum dikonfigurasi.
- **Kuis**: RPC `start_quiz_attempt` / `submit_quiz_attempt`; jawaban dihitung server-side, kunci jawaban hanya dibawa mahasiswa lewat RPC.
- **Proyek mini**: pengumpulan tautan & teks via RPC `submit_project`.
- **Forum**: diskusi mahasiswa + respons dari dosen.
- **Gamifikasi**: XP / level / streak / badge melalui RPC keamanan `SECURITY DEFINER`.
- **Dashboard dosen**: ringkasan mahasiswa, modul, hasil kuis & pengumpulan proyek.

### Blok visual materi

Materi pelajaran ditulis dengan Markdown dan mendukung blok visual berikut:

- `:::flow Judul` … `:::` — alur langkah bernomor.
- `:::compare Judul` … `:::` — kartu perbandingan.
- `:::preview Judul` … `---css---` … `---js---` … `:::` — preview HTML/CSS/JS di iframe sandbox.
- `:::note`, `:::tip`, `:::warning`, `:::key` — kotak catatan, tips, peringatan, dan poin kunci.

Contoh seed materi ada di `supabase/migrations/20261125*_expand_*_content.sql`.

## Struktur Penting

```
supabase/
  config.toml
  migrations/        # schema, RLS, domain functions, seed demo content
  functions/         # _shared + submit-exercise, create-student, ai-hint, ai-error-explanation
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
npx supabase secrets set GEMINI_API_KEY=...
npx supabase secrets set GEMINI_MODEL=gemini-3.5-flash
npx supabase secrets set ALLOWED_ORIGINS=http://localhost:5173
```

## Akun Demo

| Role     | Email               | Password   |
| -------- | ------------------- | ---------- |
| Mahasiswa | budi@webcode.lab | budi1234   |
| Dosen    | siti@webcode.lab   | siti1234   |

> Mahasiswa login dengan akun yang dibuat dosen dari menu **Mahasiswa → Tambah Mahasiswa**; pendaftaran publik dinonaktifkan. Halaman login tidak menampilkan shortcut akun demo.

> Akun dosen dibuat oleh operator melalui `npm run create:lecturer` atau Supabase Dashboard. Tidak ada pendaftaran dosen publik.

## Kolaborasi dengan OpenCode

Repo ini sudah dilengkapi konfigurasi OpenCode agar semua kontributor mendapat panduan yang sama:

- `AGENTS.md` — perintah, arsitektur, konvensi, dan aturan keamanan.
- `opencode.jsonc` — memuat `WebCode-Lab-OpenCode-Context.md` sebagai instruksi tambahan.
- `.opencode/commands/verify.md` — command `/verify`.
- `.opencode/skills/webcode-lab/SKILL.md` — workflow proyek.
- `.opencode/agents/reviewer.md` — subagent review read-only.

Mulai dari clone:

```bash
git clone -b temp https://github.com/AryanCalix/webcode-lab.git
cd webcode-lab
cp .env.production .env.local
npm install
opencode
```

Jangan membagikan `.env.seed`, service role key, access token Supabase, atau API key model. Setiap kontributor memakai akun OpenCode dan kredensial model miliknya sendiri.

## Deploy ke Vercel

Import repo di Vercel, lalu klik **Deploy** tanpa konfigurasi tambahan:

1. `.env.production` sudah berisi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` (publishable), jadi build langsung jalan tanpa mengisi Environment Variables.
2. `vercel.json` sudah menyertakan framework Vite, output `dist`, dan SPA rewrite agar refresh di route seperti `/student/playground/:id` tidak 404.
3. Edge Functions menerima origin `https://*.vercel.app`, jadi tidak perlu mengatur `ALLOWED_ORIGINS` untuk domain Vercel. Domain kustom (jika ada) perlu ditambahkan:
   ```bash
   npx supabase secrets set ALLOWED_ORIGINS=http://localhost:5173,https://domain-anda.com --project-ref <PROJECT_REF>
   ```
4. Di Supabase Dashboard → Authentication → Providers → Email, pastikan **Enable signups** mati agar akun hanya bisa dibuat lewat dashboard dosen.
5. Set **Site URL** di Authentication → URL Configuration ke domain Vercel.
6. Buat akun dosen pertama (service role, bukan dari browser):
   ```bash
   npm run create:lecturer -- dosen@kampus.ac.id 'PasswordKuat123' 'Nama Dosen'
   ```
   Untuk menjadikan akun yang sudah ada sebagai dosen:
   ```bash
   npm run create:lecturer -- --promote dosen@kampus.ac.id 'Nama Dosen'
   ```

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
npm run create:lecturer -- <email> <password> [nama] # buat/promosikan akun dosen
npm run db:push    # supabase db push
npm run db:diff    # supabase db diff
npm run functions:serve
```

## Keamanan

- Row Level Security aktif di semua tabel publik; akses lewat RPC `SECURITY DEFINER` yang sudah divalidasi.
- Quiz kunci jawaban hanya dibagikan lewat RPC `start_quiz_attempt` / `submit_quiz_attempt` (server-side grading).
- Edge Functions memakai auth user JWT + service role server-side; rate limit AI (mis. 20 request / 60 menit untuk hint). Pembuatan akun mahasiswa (`create-student`) memverifikasi role dosen sebelum memakai service role.
- Validasi kode latihan dijalankan di Edge Function, bukan di browser.

## Status

- Fondasi, auth, modul, playground, kuis, proyek, forum, gamifikasi: ✅ selesai.
- AI (Gemini, fallback Anthropic) via Edge Function: ✅ terpasang (butuh secret `GEMINI_API_KEY`).
- Deploy production (Vercel): lihat bagian **Deploy ke Vercel**.
