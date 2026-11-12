# Panduan WebCode Lab

Panduan singkat untuk menjalankan, memeriksa, dan menggunakan WebCode Lab — platform pembelajaran interaktif Pemrograman Web.

## 1. Ringkasan aplikasi

WebCode Lab memiliki dua peran:

- **Mahasiswa**: membaca materi, mengerjakan latihan kode, kuis, proyek mini, forum, dan melihat XP/level/streak.
- **Dosen**: mengelola modul dan pelajaran, kuis, proyek, absensi, serta memantau progres dan nilai mahasiswa.

Database demo sudah berisi lima modul:

1. Pengantar Web
2. HTML Dasar
3. CSS Dasar
4. Flexbox dan Grid
5. JavaScript Dasar

Total ada 38 pelajaran. Materi memakai blok visual: alur langkah, kartu perbandingan, catatan, dan live preview HTML/CSS/JavaScript.

## 2. Kebutuhan

- Node.js 22.x
- npm
- Akun Supabase (opsional jika memakai project yang sudah disertakan)
- Browser modern (Chrome, Edge, Firefox, atau Safari)

## 3. Menjalankan aplikasi

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

Untuk build production:

```bash
npm run build
npm run preview
```

## 4. Akun yang tersedia

Seluruh akun di bawah ini sudah terdaftar di database Supabase project `ohaolgcyzjxcamgeliqq` dan sudah diuji login, akses menu, pembatasan peran, serta logout.

| Peran | Nama | Email | Password |
| --- | --- | --- | --- |
| Mahasiswa | Budi Santoso | `budi@webcode.lab` | `budi1234` |
| Mahasiswa | Benjamin Engel | `benjamin@webcode.lab` | `webcodelabBenjamin` |
| Dosen | Dr. Siti Aminah | `siti@webcode.lab` | `siti1234` |
| Dosen | Jarwo | `jarwo@webcode.lab` | `webcodelabJarwo` |

Catatan:

- Akun **Jarwo** dan **Benjamin** adalah akun yang dibuat pemilik project dan tersambung ke database yang sama dengan akun demo.
- Password di atas hanya untuk lingkungan demo/kelas. Ganti sebelum dipakai untuk data mahasiswa sungguhan.
- Jangan membagikan file `panduan.md` ini ke publik karena berisi kredensial.

### Membuat akun mahasiswa baru

1. Login sebagai dosen.
2. Buka menu **Mahasiswa**.
3. Klik **Tambah Mahasiswa** dan isi nama, email, serta password.
4. Akun langsung aktif dan mahasiswa dapat login.

### Membuat akun dosen baru

Akun dosen dibuat lewat script server-side, bukan dari halaman login publik:

```bash
npm run create:lecturer -- dosen@example.com passwordku "Nama Dosen"
```

Script ini membutuhkan `SUPABASE_SERVICE_ROLE_KEY` di `.env.seed`.

## 5. Environment dan key Supabase

File environment yang disertakan:

| File | Kegunaan |
| --- | --- |
| `.env.local` | Dipakai saat development lokal |
| `.env.production` | Dipakai untuk build/deploy |
| `.env.seed` | Khusus script admin di server |
| `.env.example` | Template variabel frontend |
| `.env.seed.example` | Template variabel script admin |

### Anon key / publishable key

`VITE_SUPABASE_ANON_KEY` adalah key publik untuk frontend. Key ini memang boleh berada di browser karena akses datanya dibatasi oleh Row Level Security (RLS).

Pada zip ini, anon key **tetap diisi** agar akun dan database langsung berfungsi.

### Service role key

`SUPABASE_SERVICE_ROLE_KEY` adalah key rahasia server-side yang **melewati RLS**. Key ini hanya dipakai untuk:

- `npm run seed:auth`
- `npm run create:lecturer`
- operasi admin lain di Edge Function

Pada zip ini, nilai service role key diganti dengan placeholder `your service role key`. Ganti placeholder tersebut hanya jika perlu membuat akun atau seed data baru.

> Jangan pernah menaruh service role key di kode frontend, browser, repository publik, atau file yang dibagikan.

### Key AI

Key AI (Gemini/Anthropic) tidak disimpan di repository. Key tersebut diatur sebagai secret Supabase:

```bash
npx supabase secrets set GEMINI_API_KEY=...
npx supabase secrets set GEMINI_MODEL=gemini-3.5-flash
```

Jika key AI belum diatur, fitur AI akan menampilkan status belum dikonfigurasi.

## 6. Database dan migrasi

Project Supabase yang dipakai pada zip ini sudah berisi schema, RLS, dan data demo. Jika ingin memakai project Supabase sendiri:

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
npm run seed:auth
```

`db push` menerapkan seluruh migrasi di `supabase/migrations/`, termasuk materi terbaru.

> Perintah `db push` dan `db reset` dapat mengubah data production. Jalankan hanya pada project yang memang ingin diubah.

## 7. Alur singkat penggunaan

### Mahasiswa

1. Login.
2. Buka **Modul**.
3. Pilih modul dan baca materi.
4. Selesaikan pelajaran secara berurutan.
5. Buka latihan untuk menulis HTML/CSS/JavaScript.
6. Lihat hasil di live preview, lalu klik **Cek Jawaban**.
7. Lanjut ke kuis, proyek mini, forum, dan pantau XP di dashboard.

### Dosen

1. Login.
2. Buka **Dashboard Dosen** untuk melihat ringkasan kelas.
3. Kelola modul dan pelajaran di menu **Modul**.
4. Buat kuis dan atur soal di menu **Kuis**.
5. Kelola proyek dan nilai di menu **Proyek**.
6. Catat kehadiran di menu **Absensi**.
7. Lihat hasil dan progres mahasiswa di menu **Mahasiswa** dan **Hasil & Nilai**.

## 8. Perintah verifikasi

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npx playwright test e2e/smoke.spec.ts
```

## 9. Struktur folder penting

```text
src/
  auth/          # autentikasi dan guard peran
  components/    # komponen UI, Markdown, dan visual materi
  features/      # API dan hooks per domain
  pages/         # halaman mahasiswa dan dosen
  lib/           # Supabase client, tipe, error, format
supabase/
  functions/     # Edge Functions
  migrations/    # schema, RLS, fungsi domain, dan materi demo
e2e/             # smoke test Playwright
scripts/         # seed akun demo dan pembuatan dosen
```

## 10. Troubleshooting

**Tidak bisa login**

- Pastikan `.env.local` berisi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
- Pastikan akun sudah dibuat di Supabase Auth.
- Periksa apakah profil pengguna memiliki role `student` atau `lecturer`.

**Halaman kosong atau error koneksi**

- Periksa koneksi internet.
- Pastikan project Supabase aktif.
- Buka Console browser dan tab Network untuk melihat request yang gagal.

**Script seed gagal**

- Isi `SUPABASE_SERVICE_ROLE_KEY` di `.env.seed`.
- Pastikan key diambil dari Supabase Dashboard → Project Settings → API.

**Materi tidak muncul**

- Pastikan migrasi sudah diterapkan.
- Periksa apakah modul dan pelajaran berstatus `is_published`.

## 11. Catatan keamanan

- Anon key boleh ada di frontend, tetapi RLS harus tetap aktif.
- Service role key hanya untuk server dan tidak boleh dibagikan.
- Jangan commit file `.env.seed`, `.env.local`, atau file berisi key asli.
- Ganti password akun demo sebelum dipakai di lingkungan nyata.
- Data dan akun demo sebaiknya tidak dipakai untuk data mahasiswa sungguhan tanpa peninjauan keamanan.
