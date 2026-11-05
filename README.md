# WebCode Lab

Platform pembelajaran interaktif untuk mata kuliah Pemrograman Web — menggabungkan materi, editor kode dengan live preview, kuis, proyek mini, forum, dan gamifikasi.

Aplikasi ini dibangun berdasarkan dokumen konteks produk **WebCode Lab — Rancang Software Pembelajaran Interaktif**.

## Tech Stack

- React 19 + Vite 8 + TypeScript
- Tailwind CSS v4
- React Router v7
- Monaco Editor, iframe sandbox, dan AI (Claude API) akan ditambahkan pada fase berikutnya

## Fitur yang sudah berfungsi (Fase 1)

- Halaman login dengan dua akun demo (mahasiswa & dosen).
- Autentikasi mock (localStorage) dengan dua role: `student` dan `lecturer`.
- Proteksi route berdasarkan role.
- Layout aplikasi dengan navigasi sidebar (desktop) dan chip navigasi (mobile).
- Dashboard mahasiswa: greeting, level, total XP, streak, dan daftar modul dengan progress bar.
- Tombol **Lanjutkan Belajar** yang membuka modul pertama yang belum selesai.
- Dashboard dosen: ringkasan kelas, rata-rata progres, dan perkembangan mahasiswa (demo).
- Halaman daftar modul dan detail modul dengan status/progres.

## Cara Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:5173

## Akun Demo

| Role     | Email               | Password   |
| -------- | ------------------- | ---------- |
| Mahasiswa | budi@webcode.lab | budi1234   |
| Dosen    | siti@webcode.lab   | siti1234   |

## Perintah Lain

```bash
npm run build   # typecheck + build production
npm run lint    # oxlint
npm run preview # preview build production
```

## Status Fase

- **Fase 1** — fondasi aplikasi, auth/role, routing, dashboard: ✅ selesai (build & lint lolos).
- **Fase 2** — materi, playground, hint, cek jawaban: ✅ selesai.
- **Fase 3** — kuis, proyek mini: ✅ selesai (CRUD + publish kuis, pengerjaan/penilaian kuis, daftar proyek & pengumpulan).
- **Fase 4** — forum, gamifikasi: ✅ selesai (forum thread & replies, XP/level/streak/badge dengan anti-duplikat).
- **Fase 5** — integrasi AI dan penyempurnaan: 🚧 in progress (AI service + hint flow + loading state; integrasi backend Claude API produksi menunggu backend server).
