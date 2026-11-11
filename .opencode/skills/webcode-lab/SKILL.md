---
name: WebCode Lab Workflow
description: Workflow untuk mengembangkan, memverifikasi, dan men-deploy aplikasi WebCode Lab (React/Vite + Supabase). Gunakan untuk perubahan fitur, perbaikan bug, Edge Function, atau migration di repo ini.
---

# WebCode Lab Workflow

## Sebelum menulis kode

1. Baca `AGENTS.md` dan `WebCode-Lab-OpenCode-Context.md`.
2. Periksa pola yang sudah ada di area terkait (`src/features`, `src/pages`, `supabase/functions`).
3. Tentukan apakah perubahan menyentuh frontend, Edge Function, migration, atau lebih dari satu.

## Saat menulis kode

- Ikuti TypeScript strict dan komponen/hooks yang sudah ada.
- Validasi input dengan Zod; gunakan helper error yang ada.
- Jangan pernah menambahkan service role key, API key AI, atau kredensial ke frontend.
- Jangan mengubah migration yang sudah diterapkan; buat migration baru.
- Jangan menambahkan pendaftaran dosen publik atau shortcut demo di halaman login.
- `create-student` harus tetap hanya bisa dipanggil dosen.

## Verifikasi

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Untuk perubahan UI, jalankan `npx playwright test e2e/smoke.spec.ts`.
Untuk Edge Function, jalankan `deno check supabase/functions/<nama>/index.ts`.

## Deploy

- Frontend: push ke `main`; Vercel build otomatis.
- Edge Function: `npx supabase functions deploy <nama> --project-ref <PROJECT_REF>`.
- Migration: `npx supabase db push` hanya dengan persetujuan eksplisit.

## Aturan keamanan

- `.env.seed` tidak boleh dibaca, disalin, atau dibagikan.
- Jangan menjalankan `db reset` atau `functions delete` terhadap project live tanpa persetujuan.
- Jangan menulis kredensial ke README, kode, atau commit message.
