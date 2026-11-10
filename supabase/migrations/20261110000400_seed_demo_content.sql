-- WebCode Lab — demo content seed
-- Clearly labeled demo content. Real courses should be authored by lecturers
-- through the lecturer UI. IDs are fixed so links remain stable across resets.

insert into public.modules (id, title, description, order_index, is_published)
values
  ('a0000000-0000-4000-8000-000000000001', 'Pengantar Web',
   'Konsep dasar pengembangan web: apa itu web, client-server, dan cara browser memuat halaman.', 1, true),
  ('a0000000-0000-4000-8000-000000000002', 'HTML Dasar',
   'Struktur dokumen HTML: elemen dasar, atribut, dan semantic HTML.', 2, true),
  ('a0000000-0000-4000-8000-000000000003', 'CSS Dasar',
   'Memilih elemen, selector, dan properti dasar CSS seperti warna dan ukuran.', 3, true),
  ('a0000000-0000-4000-8000-000000000004', 'Flexbox dan Grid',
   'Tata letak dua dimensi untuk tampilan web yang kompleks.', 4, true)
on conflict (id) do nothing;

insert into public.lessons (id, module_id, title, content, kind, order_index, is_published)
values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001',
   'Apa itu Pemrograman Web?',
   E'## Apa itu Pemrograman Web?\n\nPemrograman web adalah proses membangun aplikasi yang berjalan di browser. Tiga teknologi utamanya adalah **HTML** (struktur), **CSS** (tampilan), dan **JavaScript** (perilaku).\n\n### Yang akan Anda pelajari\n\n- Cara browser meminta dan menampilkan halaman.\n- Perbedaan HTML, CSS, dan JavaScript.\n- Cara menulis kode pertama Anda.\n\n> Materi ini adalah contoh demo, bukan materi resmi dosen.',
   'material', 1, true),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001',
   'Client, Server, dan Browser',
   E'## Client, Server, dan Browser\n\n**Client** adalah perangkat yang meminta halaman (biasanya browser). **Server** menyimpan dan mengirimkan halaman tersebut.\n\n1. Anda mengetik alamat di browser.\n2. Browser mengirim permintaan HTTP ke server.\n3. Server merespons dengan HTML, CSS, dan JavaScript.\n4. Browser merender hasilnya.\n\n### Latihan berikutnya\n\nSetelah membaca materi ini, buka latihan untuk membuat heading pertama Anda.',
   'material', 2, true),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001',
   'Latihan: Sajikan halaman pertama',
   '', 'exercise', 3, true),
  ('b0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000002',
   'Elemen Dasar HTML',
   E'## Elemen Dasar HTML\n\nHTML tersusun dari elemen. Sebuah elemen biasanya memiliki tag pembuka, konten, dan tag penutup.\n\n```html\n<h1>Judul utama</h1>\n<p>Sebuah paragraf.</p>\n<ul>\n  <li>Item daftar</li>\n</ul>\n```\n\nGunakan `h1` untuk judul utama dan `p` untuk paragraf.',
   'material', 1, true),
  ('b0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000002',
   'Atribut dan Semantic HTML',
   E'## Atribut dan Semantic HTML\n\nAtribut memberi informasi tambahan pada elemen, misalnya `class` atau `href`.\n\n**Semantic HTML** memakai elemen yang menjelaskan maknanya: `header`, `nav`, `main`, `section`, `article`, dan `footer`.\n\n```html\n<header>\n  <h1>Portofolio</h1>\n</header>\n<main>\n  <section>Proyek saya</section>\n</main>\n<footer>Kontak</footer>\n```\n\nSemantic HTML membantu aksesibilitas dan SEO.',
   'material', 2, true),
  ('b0000000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000002',
   'Latihan: Struktur halaman portofolio',
   '', 'exercise', 3, true),
  ('b0000000-0000-4000-8000-000000000021', 'a0000000-0000-4000-8000-000000000003',
   'Selektor dan Cascade',
   E'## Selektor dan Cascade\n\nCSS memilih elemen dengan **selector**, lalu menerapkan **deklarasi** `properti: nilai`.\n\n```css\nh1 {\n  color: blue;\n  font-size: 2rem;\n}\n```\n\n- `h1` adalah selector elemen.\n- `color` mengubah warna teks.\n- `background-color` mengubah warna latar.\n\nBila beberapa aturan bertabrakan, aturan yang lebih spesifik atau lebih akhir menang (cascade).',
   'material', 1, true),
  ('b0000000-0000-4000-8000-000000000022', 'a0000000-0000-4000-8000-000000000003',
   'Latihan: Ubah warna judul menjadi biru',
   '', 'exercise', 2, true),
  ('b0000000-0000-4000-8000-000000000031', 'a0000000-0000-4000-8000-000000000004',
   'Flexbox untuk tata letak baris',
   E'## Flexbox untuk tata letak baris\n\nAktifkan flexbox dengan `display: flex`. Gunakan `justify-content` untuk sumbu utama dan `align-items` untuk sumbu silang.\n\n```css\n.container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n```\n\nFlexbox cocok untuk navigasi, kartu sejajar, dan tata letak satu dimensi.',
   'material', 1, true)
on conflict (id) do nothing;

insert into public.exercises (
  id, lesson_id, title, instructions, starter_html, starter_css, starter_js, hint,
  validator_config, order_index, is_published
)
values
  ('c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003',
   'Latihan: Sajikan Halaman Pertama',
   'Buatlah heading utama yang menampilkan teks "Halo Web" menggunakan tag HTML yang tepat.',
   '<h1>Judul saya</h1>', '', '',
   'Gunakan tag heading seperti <h1> untuk tajuk utama.',
   '{"checks":[{"type":"html_text","selector":"h1","equals":"Halo Web"}]}'::jsonb, 1, true),
  ('c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000013',
   'Latihan: Struktur Halaman Portofolio',
   'Lengkapi struktur HTML halaman portofolio: gunakan elemen header, minimal satu section, dan footer, dengan satu heading utama.',
   '<div>\n  <h1>Nama Saya</h1>\n</div>', '', '',
   'Ganti div pembungkus dengan elemen semantik: header, section, dan footer.',
   '{"checks":[{"type":"html_selector","selector":"header"},{"type":"html_selector","selector":"section"},{"type":"html_selector","selector":"footer"},{"type":"html_text","selector":"h1","min_length":1}]}'::jsonb, 1, true),
  ('c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000022',
   'Latihan: Ubah Warna Judul Menjadi Biru',
   'Ubah warna judul menjadi biru. Perhatikan properti `color` pada selektor h1.',
   '<h1>Halo Web</h1>', E'h1 {\n  color: red;\n}', '',
   'Cek properti `color` pada selektor `h1`. Gunakan nilai seperti `blue`, `#0000ff`, atau `rgb(0, 0, 255)`.',
   '{"checks":[{"type":"css_property","selector":"h1","property":"color","equals":["blue","#0000ff","#00f","rgb(0,0,255)","rgb(0, 0, 255)"]}]}'::jsonb, 1, true)
on conflict (lesson_id) do nothing;

insert into public.quizzes (
  id, module_id, title, description, duration_minutes, deadline_at, is_published
)
values
  ('d0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002',
   'Kuis: HTML Dasar', 'Uji pemahaman dasar Anda tentang elemen HTML.', 15, null, true),
  ('d0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000003',
   'Kuis: CSS Dasar', 'Uji pemahaman properti dasar CSS seperti selector dan color.', 10, null, true)
on conflict (id) do nothing;

insert into public.quiz_questions (
  id, quiz_id, question_text, options, correct_index, points, order_index
)
values
  ('e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001',
   'Elemen HTML apa yang digunakan untuk membuat judul utama halaman?',
   '["<h1>", "<div>", "<p>", "<span>"]'::jsonb, 0, 100, 0),
  ('e0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001',
   'Elemen HTML apa yang digunakan untuk paragraf?',
   '["<p>", "<h2>", "<ul>", "<ol>"]'::jsonb, 0, 100, 1),
  ('e0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001',
   'Tag HTML apa yang membuat daftar tidak terurut?',
   '["<ul>", "<ol>", "<div>", "<h3>"]'::jsonb, 0, 100, 2),
  ('e0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000002',
   'Properti CSS apa yang digunakan untuk mengubah warna teks?',
   '["color", "background-color", "text-style", "font-color"]'::jsonb, 0, 100, 0),
  ('e0000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000002',
   'Nilai CSS mana yang membuat teks berwarna biru?',
   '["blue", "bold", "center", "large"]'::jsonb, 0, 100, 1)
on conflict (id) do nothing;

insert into public.projects (id, module_id, title, description, deadline_at, is_published)
values
  ('f0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002',
   'Portofolio Dua Halaman',
   'Buatlah halaman web portofolio dengan minimal dua halaman: beranda (tentang) dan detail proyek.',
   '2027-01-31T23:59:00+07:00', true),
  ('f0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001',
   'Halaman Kegiatan Kelas',
   'Sajikan informasi singkat tentang kegiatan kelas dengan heading dan daftar kegiatan.',
   '2027-02-28T23:59:00+07:00', true)
on conflict (id) do nothing;

insert into public.badges (id, name, description)
values
  ('first-solve', 'Pertama', 'Menyelesaikan latihan pertama.'),
  ('quiz-ace', 'Nilai Sempurna', 'Mendapatkan skor 100 pada sebuah kuis.'),
  ('project-builder', 'Pembangun', 'Mengumpulkan proyek mini pertama.')
on conflict (id) do nothing;
