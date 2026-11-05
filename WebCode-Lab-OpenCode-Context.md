# WebCode Lab — Project Context for OpenCode

> Dokumen ini adalah konteks produk dan instruksi implementasi untuk membangun WebCode Lab berdasarkan presentasi kelompok. Gunakan sebagai sumber kebutuhan utama. Jangan mengubah konsep produk tanpa alasan teknis yang kuat.

## 1. Peran dan instruksi untuk OpenCode

Bertindak sebagai senior full-stack engineer. Bangun aplikasi web bernama **WebCode Lab**, sebuah platform pembelajaran interaktif untuk mata kuliah Pemrograman Web.

Sebelum menulis kode:
1. Periksa struktur repository, `package.json`, framework, pola komponen, konfigurasi, dan kode yang sudah ada.
2. Pertahankan teknologi dan konvensi repository jika proyek sudah berjalan. Jangan menginisialisasi ulang atau menghapus pekerjaan yang ada.
3. Jika repository kosong, gunakan stack yang direkomendasikan pada bagian 8.
4. Implementasikan secara bertahap. Pastikan aplikasi dapat dijalankan setelah setiap tahap.
5. Jangan membuat tombol atau fitur yang terlihat aktif tetapi tidak memiliki fungsi. Jika backend belum tersedia, gunakan mock data yang konsisten dan tandai bagian yang masih memerlukan integrasi.
6. Jangan mengarang konten akademik seolah-olah berasal dari dosen. Konten contoh harus diberi label demo/contoh.
7. Utamakan aplikasi yang benar-benar berfungsi, bukan hanya landing page atau mockup statis.

Sumber produk: presentasi **“WebCode Lab — Rancangan Software Pembelajaran Interaktif”**. Dokumen ini menerjemahkan isi presentasi menjadi spesifikasi implementasi. Detail yang tidak ditentukan dalam presentasi ditandai sebagai keputusan implementasi atau asumsi.

---

## 2. Ringkasan produk

**Nama:** WebCode Lab  
**Jenis:** Software pembelajaran interaktif untuk mata kuliah Pemrograman Web.

WebCode Lab menggabungkan:
- Materi pembelajaran berupa teks dan video singkat.
- Editor kode langsung di dalam halaman.
- Live preview untuk melihat hasil kode.
- Kuis dengan umpan balik langsung.
- Proyek mini untuk praktik membuat web.
- Forum diskusi.
- Gamifikasi berupa XP, level, lencana, dan streak belajar.
- Dashboard untuk melihat progres mahasiswa.
- Fitur dosen untuk mengelola materi, kuis, nilai, dan memantau perkembangan mahasiswa.
- Bantuan AI berupa hint dan penjelasan error.

**Masalah yang ingin diselesaikan:**
1. Pembelajaran yang hanya mengandalkan slide dan ceramah membuat mahasiswa kurang praktik.
2. Mahasiswa kesulitan berlatih di luar kelas.
3. Dosen kesulitan memantau progres belajar mahasiswa.

**Solusi produk:**
- Mahasiswa membaca materi lalu langsung mencoba kode.
- Latihan dan kuis memberikan penilaian/umpan balik otomatis.
- Poin dan lencana mendorong konsistensi belajar.
- Dosen memiliki sarana untuk mengelola pembelajaran dan memantau progres.

**Nilai utama produk:** mahasiswa belajar sambil praktik, memperoleh umpan balik, dan dapat melihat perkembangan belajarnya; dosen dapat mengelola pembelajaran serta memantau hasil mahasiswa.

---

## 3. Pengguna dan hak akses

Aplikasi memiliki dua role utama.

### A. Mahasiswa

Mahasiswa dapat:
- Login.
- Melihat dashboard pribadi.
- Melihat daftar modul dan progres setiap modul.
- Membaca materi teks dan menonton video singkat.
- Membuka latihan kode.
- Menulis dan menjalankan HTML, CSS, dan JavaScript.
- Melihat live preview.
- Meminta hint.
- Memeriksa jawaban dan menerima umpan balik.
- Mengerjakan kuis.
- Mengerjakan/mengumpulkan proyek mini.
- Mengakses forum.
- Melihat XP, level, streak, lencana, dan progres belajar.

Mahasiswa hanya boleh melihat dan mengubah data miliknya sendiri, kecuali konten publik kelas/forum sesuai aturan aplikasi.

### B. Dosen

Dosen dapat:
- Login sebagai dosen.
- Melihat dashboard pengelolaan kelas.
- Membuat, mengubah, menghapus, dan memublikasikan materi/modul.
- Mengelola soal kuis, kunci jawaban, durasi, dan tenggat.
- Melihat hasil kuis dan nilai mahasiswa.
- Memantau progres mahasiswa.
- Melihat aktivitas belajar dan penyelesaian modul.

Akses dosen harus dibatasi melalui role/otorisasi, bukan hanya dengan menyembunyikan tombol di frontend.

---

## 4. Alur utama pengguna

### Alur mahasiswa

1. Mahasiswa membuka aplikasi.
2. Mahasiswa login.
3. Sistem memvalidasi akun.
4. Setelah berhasil, mahasiswa masuk ke dashboard.
5. Mahasiswa memilih modul.
6. Mahasiswa membaca materi.
7. Mahasiswa membuka latihan dan menulis kode.
8. Mahasiswa menekan **Run** untuk melihat hasil pada live preview.
9. Mahasiswa menekan **Cek Jawaban**.
10. Jika jawaban benar, sistem mencatat penyelesaian, menambah progres, dan memberikan XP.
11. Jika jawaban belum benar, sistem menampilkan umpan balik agar mahasiswa dapat memperbaiki kode.
12. Mahasiswa dapat melanjutkan ke kuis dan proyek mini.

### Alur dosen

1. Dosen login.
2. Dosen memilih modul.
3. Dosen menambahkan atau mengubah soal kuis.
4. Dosen mengatur kunci jawaban, durasi, dan tenggat.
5. Dosen memublikasikan kuis.
6. Mahasiswa menerima notifikasi bahwa kuis tersedia.
7. Hasil pengerjaan tercatat otomatis.
8. Dosen melihat hasil dan progres mahasiswa.

---

## 5. Fitur dan spesifikasi fungsional

### 5.1 Authentication dan role

- Sediakan halaman login.
- Sediakan mekanisme identifikasi role `student` dan `lecturer`.
- Arahkan pengguna ke dashboard sesuai role.
- Lindungi halaman dan operasi berdasarkan role.
- Sediakan logout.
- Jika menggunakan Supabase Auth, hubungkan profil pengguna dengan tabel profil/role.
- Jangan menaruh secret key atau API key di frontend.

Detail registrasi, reset password, dan kebijakan pembuatan akun belum ditentukan dalam presentasi. Implementasikan sesuai kondisi repository; jangan membuat alur administrasi yang kompleks tanpa kebutuhan.

### 5.2 Dashboard mahasiswa

Dashboard harus menampilkan:
- Sapaan pengguna, misalnya “Halo, [Nama]”.
- Level pengguna.
- Total XP.
- Streak belajar dalam hari.
- Daftar modul dan persentase progres.
- Tombol/aksi **Lanjutkan Belajar** yang membuka modul belum selesai atau modul terakhir yang dikerjakan.

Data contoh yang ditampilkan dalam presentasi:
- Level 2 — Menengah (contoh).
- 340 XP — Poin belajar (contoh).
- 5 hari — Streak belajar (contoh).
- Modul 1: Pengantar Web — 100%.
- Modul 2: HTML Dasar — 100%.
- Modul 3: CSS — 60%.
- Modul 4: Flexbox dan Grid — 0%.

Angka tersebut adalah data ilustrasi pada slide, bukan nilai default permanen untuk semua pengguna. Jika digunakan sebagai seed/demo data, beri label data demo.

### 5.3 Materi dan modul

Sediakan daftar modul dan halaman detail modul. Setiap modul dapat memuat:
- Judul dan deskripsi.
- Materi teks.
- Video singkat (opsional, jika URL video tersedia).
- Urutan/daftar bagian materi.
- Latihan kode.
- Kuis.
- Proyek mini.
- Status penyelesaian dan progres.

Modul contoh yang disebutkan:
1. Pengantar Web.
2. HTML Dasar.
3. CSS.
4. Flexbox dan Grid.

Jangan menganggap daftar tersebut sebagai kurikulum lengkap. Buat struktur data yang memungkinkan dosen menambah modul.

### 5.4 Code playground / layar latihan kode

Ini adalah fitur inti dan harus benar-benar interaktif.

Layout latihan mengikuti konsep pada slide:
- Panel instruksi/tugas.
- Editor kode.
- Live preview.
- Tombol Hint.
- Tombol Cek Jawaban.
- Indikator progres modul.

Contoh tugas dari presentasi:
- Modul 3: CSS Dasar.
- Instruksi: “Ubah warna judul menjadi biru”.
- Kode contoh: `h1 { color: blue; }`.
- Preview menampilkan teks “Halo Web”.

Persyaratan:
- Gunakan Monaco Editor jika stack memungkinkan.
- Sediakan tab atau pilihan bahasa HTML, CSS, dan JavaScript.
- Sediakan tombol **Run**.
- Gabungkan kode HTML, CSS, dan JavaScript untuk ditampilkan dalam live preview.
- Preview harus terisolasi menggunakan `iframe` sandbox.
- Perubahan kode tidak boleh mengeksekusi kode langsung di origin aplikasi utama.
- Sediakan tombol **Hint** untuk menampilkan petunjuk.
- Sediakan tombol **Cek Jawaban** untuk memeriksa hasil latihan.
- Tampilkan status benar/salah dan penjelasan singkat.
- Simpan progres/hasil latihan untuk pengguna yang login.
- Jangan menyamakan tombol Run dengan Cek Jawaban: Run hanya menjalankan preview, sedangkan Cek Jawaban memvalidasi tugas.

**Keamanan playground:**
- Jangan menjalankan kode pengguna dengan `eval` di halaman utama.
- Gunakan iframe dengan atribut sandbox yang sesuai dan komunikasi terbatas jika diperlukan.
- Jangan memberi iframe akses yang tidak dibutuhkan ke origin utama, cookie, storage, atau API aplikasi.
- Validasi hasil di sisi server jika validasi membutuhkan data yang tidak boleh dipercaya dari browser.
- Perlakukan seluruh kode yang ditulis pengguna sebagai input tidak tepercaya.

**Validasi latihan:**
- Buat sistem validator yang dapat dikonfigurasi per latihan.
- Untuk demo awal, validator dapat menggunakan pemeriksaan sederhana terhadap output/struktur yang diharapkan.
- Jangan mengandalkan pencocokan string yang terlalu rapuh jika pemeriksaan DOM dapat digunakan.
- Simpan instruksi, starter code, hint, expected result, dan aturan validasi secara terpisah.

### 5.5 Kuis

Mahasiswa:
- Melihat kuis yang tersedia pada modul.
- Melihat instruksi, durasi, dan tenggat jika ditentukan.
- Mengerjakan dan mengirim jawaban.
- Mendapatkan umpan balik/hasil sesuai konfigurasi kuis.

Dosen:
- Membuat dan mengelola soal.
- Mengatur kunci jawaban.
- Mengatur durasi dan tenggat.
- Memublikasikan kuis.
- Melihat hasil yang tercatat otomatis.

Presentasi tidak menentukan jenis soal atau sistem penilaian secara rinci. Untuk MVP, gunakan tipe soal pilihan ganda dan struktur data yang dapat dikembangkan. Kunci jawaban tidak boleh dikirim ke frontend sebelum diperlukan untuk penilaian.

### 5.6 Proyek mini

- Setiap modul dapat memiliki proyek mini.
- Proyek berisi judul, instruksi, kriteria/tugas, dan tenggat bila ada.
- Mahasiswa dapat mengumpulkan hasil atau tautan proyek.
- Dosen dapat melihat daftar pengumpulan.

Rincian rubrik, penilaian manual, format berkas, dan fitur revisi belum ditentukan dalam presentasi. Buat implementasi minimal yang tidak mengunci pengembangan berikutnya.

### 5.7 Forum

Sediakan forum diskusi untuk mahasiswa:
- Melihat daftar diskusi.
- Membuka detail diskusi.
- Membuat topik.
- Menulis balasan.

Gunakan autentikasi dan simpan identitas pembuat serta waktu pembuatan. Moderasi, lampiran, dan notifikasi forum lanjutan berada di luar kebutuhan minimum karena belum dijelaskan dalam presentasi.

### 5.8 Gamifikasi

Elemen gamifikasi yang disebutkan:
- XP/poin belajar.
- Level.
- Lencana/badge.
- Streak belajar.

Aturan pemberian XP dan kenaikan level belum ditentukan. Buat aturan sederhana, konsisten, dan terpusat di backend agar tidak dapat dimanipulasi dari browser. Hindari pemberian XP berulang hanya karena pengguna menekan tombol yang sama berkali-kali. Simpan riwayat transaksi XP atau event penyelesaian.

### 5.9 Bantuan AI

Presentasi menyebut AI menggunakan API Claude untuk:
- Memberikan hint/petunjuk.
- Menjelaskan error kode.

Implementasi:
- Buat layanan backend untuk memanggil API AI.
- API key hanya berada di server/environment variable.
- Kirim konteks yang diperlukan saja: instruksi latihan, kode pengguna, dan pesan error.
- AI berperan sebagai tutor: memberi petunjuk dan menjelaskan kesalahan, bukan langsung mengambil alih seluruh tugas.
- Berikan batas panjang input/output dan penanganan kegagalan API.
- Jika API key belum tersedia, tampilkan status bahwa bantuan AI belum dikonfigurasi; jangan berpura-pura AI sedang berjalan.
- Buat provider/service terpisah agar penyedia AI dapat diganti.

---

## 6. Halaman yang perlu dibangun

### Halaman umum
- `/login` — autentikasi.
- `/` — arahkan pengguna yang sudah login ke dashboard sesuai role; untuk pengguna belum login dapat menampilkan halaman pengenalan singkat.

### Area mahasiswa
- `/student/dashboard` — ringkasan progres, XP, level, streak, dan modul.
- `/student/modules` — daftar modul.
- `/student/modules/[moduleId]` — materi modul.
- `/student/lessons/[lessonId]` — materi/latihan.
- `/student/playground/[exerciseId]` — editor kode dan live preview.
- `/student/quizzes/[quizId]` — pengerjaan kuis.
- `/student/projects` — daftar proyek mini.
- `/student/projects/[projectId]` — detail dan pengumpulan proyek.
- `/student/forum` — daftar diskusi.
- `/student/forum/[threadId]` — detail diskusi.

### Area dosen
- `/lecturer/dashboard` — ringkasan kelas dan progres.
- `/lecturer/modules` — pengelolaan modul.
- `/lecturer/modules/new` — membuat modul.
- `/lecturer/modules/[moduleId]/edit` — mengubah modul.
- `/lecturer/quizzes` — daftar kuis.
- `/lecturer/quizzes/new` — membuat kuis.
- `/lecturer/quizzes/[quizId]/edit` — mengubah kuis.
- `/lecturer/results` — hasil dan nilai.
- `/lecturer/students` — daftar mahasiswa dan progres.

Rute di atas merupakan usulan struktur implementasi, bukan rute yang diwajibkan presentasi. Sesuaikan dengan routing framework yang digunakan.

---

## 7. Data dan model database

Gunakan PostgreSQL. Jika menggunakan Supabase, aktifkan Row Level Security (RLS) pada tabel yang menyimpan data pengguna atau data kelas.

Berikut model konseptual yang disarankan. Sesuaikan nama kolom dan relasi dengan kebutuhan repository.

### `profiles`
- `id` — UUID, terhubung ke auth user.
- `full_name`.
- `role` — `student` atau `lecturer`.
- `created_at`.

### `modules`
- `id`.
- `title`.
- `description`.
- `order_index`.
- `is_published`.
- `created_by`.
- `created_at`, `updated_at`.

### `lessons`
- `id`.
- `module_id`.
- `title`.
- `content` — materi teks/Markdown.
- `video_url` — nullable.
- `order_index`.
- `is_published`.

### `exercises`
- `id`.
- `lesson_id` atau `module_id`.
- `title`.
- `instructions`.
- `starter_html`.
- `starter_css`.
- `starter_js`.
- `hint`.
- `expected_result` atau konfigurasi validator.
- `order_index`.

### `exercise_submissions`
- `id`.
- `exercise_id`.
- `student_id`.
- `html_code`, `css_code`, `js_code`.
- `is_correct`.
- `feedback`.
- `submitted_at`.

### `quizzes`
- `id`.
- `module_id`.
- `title`, `description`.
- `duration_minutes`.
- `deadline_at` — nullable.
- `is_published`.
- `created_by`.

### `quiz_questions`
- `id`.
- `quiz_id`.
- `question_text`.
- `question_type`.
- `options` — untuk pilihan jawaban.
- `correct_answer` — hanya boleh diakses oleh proses penilaian yang berwenang.
- `points`.
- `order_index`.

### `quiz_attempts`
- `id`.
- `quiz_id`.
- `student_id`.
- `answers`.
- `score`.
- `started_at`, `submitted_at`.

### `projects`
- `id`.
- `module_id`.
- `title`, `description`.
- `deadline_at` — nullable.
- `is_published`.

### `project_submissions`
- `id`.
- `project_id`.
- `student_id`.
- `submission_url` atau `submission_text`.
- `submitted_at`.
- `score` dan `feedback` — nullable.

### `forum_threads`
- `id`.
- `author_id`.
- `title`.
- `body`.
- `created_at`, `updated_at`.

### `forum_replies`
- `id`.
- `thread_id`.
- `author_id`.
- `body`.
- `created_at`.

### `student_progress`
- `id`.
- `student_id`.
- `module_id`.
- `progress_percent`.
- `completed_at` — nullable.
- `updated_at`.

### `gamification_profiles`
- `student_id`.
- `total_xp`.
- `level`.
- `current_streak`.
- `last_activity_date`.

### `xp_transactions`
- `id`.
- `student_id`.
- `source_type`.
- `source_id`.
- `xp_amount`.
- `created_at`.

### `badges` dan `student_badges`
- Definisi lencana dan relasi lencana yang telah diperoleh mahasiswa.

**Catatan database:**
- Tambahkan foreign key, index, constraint, dan timestamp yang sesuai.
- Cegah duplikasi submission/event XP yang tidak semestinya.
- Gunakan RLS/policy agar mahasiswa hanya dapat mengakses data yang diizinkan.
- Dosen hanya dapat mengelola data pembelajaran yang menjadi kewenangannya.
- Jangan mengandalkan filter frontend sebagai pengamanan.
- Jangan menyimpan password sendiri jika menggunakan Supabase Auth.
- Skema ini adalah rancangan awal untuk implementasi; presentasi tidak menetapkan skema database secara eksplisit.

---

## 8. Arsitektur dan teknologi

Presentasi mengusulkan:

**Frontend**
- React + Vite untuk antarmuka web.
- Monaco Editor untuk editor kode.
- iframe sandbox untuk live preview.

**Backend**
- Node.js dan/atau Supabase untuk autentikasi, API, dan penilaian.

**Data**
- PostgreSQL untuk penyimpanan data.

**AI**
- API Claude untuk hint dan penjelasan error.

**Pendukung**
- Figma untuk desain.
- GitHub untuk version control.
- Vercel untuk hosting.

Prinsip arsitektur tiga lapis:
1. **Presentation layer:** halaman React, editor kode, dan live preview.
2. **Application/server layer:** akun/login, materi, kuis, penilaian otomatis, XP, dan lencana.
3. **Data layer:** database, berkas/video, dan cadangan berkala.

Alur komunikasi yang ditekankan presentasi: browser berkomunikasi dengan server; browser tidak mengakses database secara langsung. Jika memakai Supabase client, akses tetap harus melalui autentikasi dan RLS yang benar. Operasi sensitif seperti penilaian, pemberian XP, dan pemanggilan AI harus dijalankan melalui jalur server yang aman.

Jika repository kosong dan tidak ada batasan lain, pilihan implementasi yang konsisten dengan presentasi:
- React + Vite + TypeScript.
- Tailwind CSS untuk styling.
- Supabase Auth + PostgreSQL.
- Monaco Editor.
- iframe sandbox untuk preview.
- Node.js server/API atau Supabase Edge Functions untuk operasi server.
- Claude API melalui server-side service.

Jangan memasukkan semua teknologi sekaligus jika repository sudah memiliki stack yang berjalan. Pilih integrasi yang paling sederhana dan konsisten.

---

## 9. Arahan UI/UX

Presentasi menggunakan identitas visual ilustratif **oranye dan biru**. Jadikan ini arah visual utama aplikasi.

Arah desain:
- Modern, edukatif, bersih, dan mudah dipahami mahasiswa.
- Gunakan oranye sebagai aksen/warna aksi dan biru sebagai warna pendukung/kepercayaan.
- Pastikan kontras teks memadai dan tampilan tidak terlalu ramai.
- Gunakan tipografi yang mudah dibaca.
- Buat layout responsif untuk desktop, tablet, dan ponsel.
- Dashboard harus menonjolkan progres dan aksi belajar berikutnya.
- Area playground harus mengutamakan ruang editor dan preview.
- Navigasi mahasiswa dan dosen harus jelas berbeda sesuai role.
- Gunakan komponen konsisten untuk tombol, kartu modul, badge, progress bar, dialog, form, dan notifikasi.
- Sediakan loading, empty, success, dan error states.
- Jangan menyalin slide menjadi halaman web. Terjemahkan informasi dan diagram menjadi antarmuka aplikasi yang benar-benar usable.

### Saran layout
- Desktop: sidebar navigasi + area konten utama.
- Mobile: navigasi ringkas dan konten satu kolom.
- Playground desktop: panel instruksi dan editor/preview dalam layout dua atau tiga area; pada layar kecil susun secara vertikal atau gunakan tab.
- Dashboard: kartu ringkasan XP/level/streak, kemudian daftar modul dengan progress bar dan tombol lanjut belajar.

Jangan mengisi UI dengan angka statistik palsu. Gunakan data demo yang diberi label atau tampilkan empty state sampai data tersedia.

---

## 10. Prioritas implementasi

Bangun dalam fase berikut agar hasil bisa diuji sejak awal.

### Fase 1 — Fondasi aplikasi
- Setup/rapikan project berdasarkan repository.
- Design system dan layout responsif.
- Authentication dan role.
- Routing dan proteksi halaman.
- Dashboard mahasiswa dan dosen dengan data demo yang jelas.

### Fase 2 — Materi dan playground
- Daftar/detail modul.
- Materi teks/video.
- Monaco Editor untuk HTML/CSS/JS.
- Run dan iframe sandbox preview.
- Hint dan Cek Jawaban.
- Penyimpanan submission dan progres.

### Fase 3 — Kuis dan proyek
- CRUD kuis untuk dosen.
- Publikasi kuis.
- Pengerjaan dan penilaian kuis.
- Daftar proyek mini dan pengumpulan hasil.

### Fase 4 — Forum dan gamifikasi
- Forum thread dan replies.
- XP, level, streak, badge.
- Pencegahan XP ganda dan manipulasi dari client.

### Fase 5 — Integrasi AI dan penyempurnaan
- Integrasi Claude API melalui backend.
- Hint dan penjelasan error.
- Error handling, loading state, validasi, aksesibilitas, dan responsive QA.

Jika waktu terbatas, selesaikan alur inti mahasiswa dari login → dashboard → modul → latihan kode → Run → Cek Jawaban → progres/XP sebelum memperluas fitur lain.

---

## 11. Kriteria penerimaan

Aplikasi belum dapat dianggap selesai hanya karena tampilannya menyerupai desain. Minimal pastikan:

1. Pengguna dapat login dan diarahkan sesuai role.
2. Mahasiswa tidak dapat membuka halaman/aksi dosen tanpa izin.
3. Dashboard menampilkan data pengguna dan progres yang konsisten.
4. Mahasiswa dapat membuka modul dan membaca materi.
5. Playground menyediakan editor HTML, CSS, dan JavaScript.
6. Tombol Run menampilkan hasil kode di iframe sandbox.
7. Tombol Cek Jawaban menjalankan validasi dan memberi umpan balik.
8. Hasil latihan dan progres dapat tersimpan.
9. XP tidak dapat ditambahkan sesuka hati dari browser dan tidak diberikan berulang untuk submission yang sama.
10. Dosen dapat membuat dan memublikasikan kuis.
11. Mahasiswa dapat mengerjakan kuis dan hasilnya tercatat.
12. Dosen dapat melihat hasil/progres mahasiswa.
13. Fitur proyek mini dan forum memiliki alur dasar yang berfungsi.
14. Fitur AI memberikan respons nyata jika API dikonfigurasi, atau menampilkan status belum dikonfigurasi jika belum tersedia.
15. Semua halaman penting memiliki loading, error, dan empty state.
16. Tampilan responsif dan tidak memiliki error console yang mengganggu.
17. Secret/API key tidak terekspos ke browser.
18. Kebijakan database dan akses role diuji, bukan hanya diasumsikan aman.

---

## 12. Hal yang belum ditentukan oleh presentasi

Jangan menganggap hal-hal berikut sudah memiliki keputusan final:
- Nama kampus/kelas dan struktur kelas.
- Apakah mahasiswa mendaftar sendiri atau dibuatkan dosen/admin.
- Apakah satu dosen mengelola satu atau beberapa kelas.
- Detail kurikulum dan isi lengkap setiap modul.
- Format video dan penyimpanan berkas.
- Rubrik penilaian proyek.
- Jenis soal kuis selain pilihan ganda.
- Formula XP, level, streak, dan syarat badge.
- Detail moderasi forum.
- Batas penggunaan dan model AI Claude.
- Detail deployment dan environment production.

Gunakan keputusan MVP yang sederhana, dokumentasikan asumsi, dan jangan membangun sistem kompleks yang belum dibutuhkan.

---

## 13. Output yang diharapkan dari OpenCode

Kerjakan langsung di repository dan hasilkan:
1. Aplikasi WebCode Lab yang dapat dijalankan.
2. Struktur komponen dan folder yang konsisten.
3. Skema database/migration atau SQL setup yang diperlukan.
4. `.env.example` tanpa secret asli.
5. README berisi cara instalasi, konfigurasi environment, menjalankan aplikasi, dan setup database.
6. Seed/demo data yang jelas ditandai sebagai data contoh.
7. Penjelasan fitur yang sudah berfungsi dan fitur yang masih membutuhkan kredensial/integrasi eksternal.

Sebelum menyatakan selesai:
- Jalankan lint/typecheck/test/build yang tersedia.
- Perbaiki error yang ditemukan.
- Uji alur utama mahasiswa dan dosen.
- Laporkan keterbatasan yang benar-benar masih ada.

**Instruksi akhir:** Mulai dengan memeriksa repository. Setelah itu, sampaikan rencana implementasi singkat berdasarkan kondisi repository, lalu kerjakan secara bertahap. Jangan berhenti setelah membuat rencana atau landing page.
