# WebCode Lab — Panduan OpenCode

Platform pembelajaran interaktif untuk mata kuliah Pemrograman Web.

## Stack

- React 19 + Vite 8 + TypeScript strict
- Tailwind CSS v4 + React Router v7
- Supabase Auth + Postgres + RLS + Edge Functions (Deno)
- TanStack Query, Zod, Vitest, Playwright, oxlint

## Perintah

```bash
npm install
npm run dev          # dev server
npm run typecheck    # tsc -b
npm run lint         # oxlint
npm run test         # vitest run
npm run build        # production build
npx playwright test e2e/smoke.spec.ts
```

Untuk Edge Function:

```bash
deno check supabase/functions/<nama>/index.ts
```

## Environment

- Gunakan Node.js 22.x.
- Untuk dev lokal: `cp .env.production .env.local`.
- `.env.production` hanya berisi `VITE_SUPABASE_URL` dan anon/publishable key.
- **Jangan pernah** membaca, menyalin, atau membagikan `.env.seed` — isinya service role key.
- Service role key, API key AI, dan access token Supabase tidak boleh masuk kode frontend, README, atau log.
- Jangan menulis kredensial akun ke source code atau dokumentasi.

## Supabase

- Project live: `ohaolgcyzjxcamgeliqq`.
- Edge Functions: `ai-chat`, `ai-hint`, `ai-error-explanation`, `create-student`, `submit-exercise`.
- Deploy fungsi:
  ```bash
  npx supabase functions deploy <nama> --project-ref <PROJECT_REF>
  ```
- Migration baru dibuat di `supabase/migrations/`; jangan mengubah migration yang sudah diterapkan.
- `npx supabase db push` dan `db reset` hanya dengan persetujuan eksplisit — bisa mengubah data production.
- `create-student` wajib tetap **lecturer-only**. Pendaftaran publik dan pendaftaran dosen dari halaman login tidak boleh ditambahkan kembali.

## Arsitektur

- `src/App.tsx` — definisi route dan guard.
- `src/pages/student/` dan `src/pages/lecturer/` — halaman per role.
- `src/features/<domain>/` — API dan hooks per domain (modules, quizzes, projects, forum, dll.).
- `src/auth/` — AuthProvider dan RequireAuth.
- `src/components/ui/` — komponen UI bersama.
- `src/lib/` — Supabase client, database types, error helper, formatter.
- `supabase/functions/` — Edge Functions; kode bersama di `_shared/`.
- `supabase/migrations/` — schema, RLS, dan domain functions.

## Konvensi

- Ikuti pola komponen, hooks, dan API yang sudah ada; jangan membuat abstraksi baru tanpa alasan.
- TypeScript strict: hindari `any`, gunakan tipe dari `src/lib/database.types.ts`.
- Validasi input dengan Zod, tampilkan error lewat helper yang ada.
- Pertahankan RLS; jangan bypass dari frontend.
- Jangan membuat fitur yang terlihat aktif tetapi tidak berfungsi.
- Jangan mengubah konsep produk tanpa alasan teknis kuat.

## Verifikasi sebelum selesai

Jalankan:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Untuk perubahan UI, jalankan juga smoke test Playwright. Laporkan perintah yang dijalankan dan hasilnya.

## Referensi

- Spesifikasi produk lengkap: `WebCode-Lab-OpenCode-Context.md` (otomatis dimuat lewat `opencode.jsonc`).
- Skill proyek: `.opencode/skills/webcode-lab/SKILL.md`.
- Command `/verify` untuk menjalankan seluruh verifikasi.
