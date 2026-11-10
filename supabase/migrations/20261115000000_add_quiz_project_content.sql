-- WebCode Lab — tambahan kuis dan proyek untuk setiap materi modul belajar

insert into public.quizzes (id, module_id, title, description, duration_minutes, deadline_at, is_published)
values
  ('d0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001',
   'Kuis: Pengantar Web', 'Uji pemahaman awal Anda tentang teknologi pengembangan web.', 10, null, true),
  ('d0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004',
   'Kuis: Flexbox dan Grid', 'Uji pemahaman tata letak dua dimensi untuk web.', 10, null, true),
  ('d0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000005',
   'Kuis: JavaScript Dasar', 'Uji pemahaman awal konsep JavaScript.', 10, null, true)
on conflict (id) do nothing;

insert into public.quiz_questions (id, quiz_id, question_text, options, correct_index, points, order_index)
values
  ('e0000000-0000-4000-8000-000000000006', 'd0000000-0000-4000-8000-000000000003',
   'Apa peran utama JavaScript dalam pengembangan web?',
   '["Menyediakan perilaku dan interaksi di browser", "Menyediakan struktur HTML", "Menyediakan styling CSS"]'::jsonb, 0, 100, 0),
  ('e0000000-0000-4000-8000-000000000007', 'd0000000-0000-4000-8000-000000000003',
   'Ketika browser membuka halaman web, urutan kerjanya adalah?',
   '["Mengirim request ke server, lalu merender respons", "Langsung render dari cache lokal", "Hanya menjalankan CSS"]'::jsonb, 0, 100, 1),
  ('e0000000-0000-4000-8000-000000000008', 'd0000000-0000-4000-8000-000000000003',
   'Apa yang dimaksud dengan pemrograman web?',
   '["Membuat aplikasi yang berjalan di browser", "Membuat database", "Membuat perangkat keras"]'::jsonb, 0, 100, 2),
  ('e0000000-0000-4000-8000-000000000009', 'd0000000-0000-4000-8000-000000000004',
   'Flexbox mendekati apa dalam CSS?',
   '["Tata letak satu dimensi", "Tata letak tiga dimensi penuh", "Hanya pengaturan warna"]'::jsonb, 0, 100, 0),
  ('e0000000-0000-4000-8000-000000000010', 'd0000000-0000-4000-8000-000000000004',
   'Apa fungsi `justify-content` pada Flexbox?',
   '["Menata distribusi item pada sumbu utama", "Mengubah ukuran item", "Mengubah warna background"]'::jsonb, 0, 100, 1),
  ('e0000000-0000-4000-8000-000000000011', 'd0000000-0000-4000-8000-000000000005',
   'Apa perbedaan penulisan `let` dan `const`?',
   '["const tidak bisa dideklarasikan ulang", "let lebih cepat", "const hanya untuk angka"]'::jsonb, 0, 100, 0),
  ('e0000000-0000-4000-8000-000000000012', 'd0000000-0000-4000-8000-000000000005',
   'Apa fungsi `addEventListener` dalam JavaScript?',
   '["Menambahkan listener untuk event tertentu", "Menghapus listener", "Mengubah nilai CSS"]'::jsonb, 0, 100, 1)
on conflict (id) do nothing;

insert into public.projects (id, module_id, title, description, deadline_at, is_published)
values
  ('f0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003',
   'Halaman Tampilan Pertama', 'Buatlah halaman statis dengan heading, paragraf, dan daftar, lalu beri styling dasar dengan CSS.', '2027-03-31T23:59:00+07:00', true),
  ('f0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004',
   'Tampilan dengan Flexbox', 'Bangun tampilan halaman dengan tata letak baris/kolom menggunakan Flexbox atau Grid.', '2027-04-30T23:59:00+07:00', true),
  ('f0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000005',
   'Halaman Interaktif dengan JavaScript', 'Tambahkan interaksi JavaScript ke halaman web yang sudah dibuat.', '2027-05-31T23:59:00+07:00', true)
on conflict (id) do nothing;
