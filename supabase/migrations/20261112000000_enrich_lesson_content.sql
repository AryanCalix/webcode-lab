-- WebCode Lab — enriched demo lesson material
-- Adds deeper lesson content so the learning modules have real teaching material,
-- plus a new Grid Layout lesson for the Flexbox & Grid module.

update public.lessons
set content = $content$## Apa itu Pemrograman Web?

Pemrograman web adalah proses membangun aplikasi yang berjalan di browser. Tiga teknologi utamanya adalah **HTML** (struktur), **CSS** (tampilan), dan **JavaScript** (perilaku).

### HTML, CSS, dan JavaScript

- **HTML**: kerangka dokumen — elemen, heading, paragraf, list, tabel.
- **CSS**: presentasi — warna, font, tata letak, responsif.
- **JavaScript**: logika — interaktivitas, validasi, komputasi di browser.

### Yang akan Anda pelajari

- Cara browser meminta dan menampilkan halaman.
- Perbedaan HTML, CSS, dan JavaScript.
- Cara menulis kode pertama Anda.

> Materi ini adalah contoh demo, bukan materi resmi dosen.
$content$
where id = 'b0000000-0000-4000-8000-000000000001';

update public.lessons
set content = $content$## Client, Server, dan Browser

**Client** adalah perangkat yang meminta halaman (biasanya browser). **Server** menyimpan dan mengirimkan halaman tersebut.

1. Anda mengetik alamat di browser.
2. Browser mengirim permintaan HTTP ke server.
3. Server merespons dengan HTML, CSS, dan JavaScript.
4. Browser merender hasilnya.

### Konsep penting

- **Request**: browser → server (mis. `GET /`, `GET /style.css`).
- **Response**: server → browser (biasanya HTML, CSS, JavaScript, JSON).
- **Render**: browser membaca HTML, menggabungkan CSS, lalu menjalankan JavaScript.

### Latihan berikutnya

Setelah membaca materi ini, buka latihan untuk membuat heading pertama Anda.
$content$
where id = 'b0000000-0000-4000-8000-000000000002';

update public.lessons
set content = $content$## Elemen Dasar HTML

HTML tersusun dari elemen. Sebuah elemen biasanya memiliki tag pembuka, konten, dan tag penutup.

```html
<h1>Judul utama</h1>
<p>Sebuah paragraf.</p>
<ul>
  <li>Item daftar</li>
</ul>
```

### Memahami hierarki heading

- `h1`: judul utama (satu per halaman).
- `h2` – `h6`: sub-judul, urut dari besar ke kecil.
- Elemen non-heading (`p`, `ul`, `table`) tidak memengaruhi hierarki.

### Latihan berikutnya

Buka latihan untuk membangun halaman pertama Anda.
$content$
where id = 'b0000000-0000-4000-8000-000000000011';

update public.lessons
set content = $content$## Atribut dan Semantic HTML

Atribut memberi informasi tambahan pada elemen, misalnya `class` atau `href`.

**Semantic HTML** memakai elemen yang menjelaskan maknanya: `header`, `nav`, `main`, `section`, `article`, dan `footer`.

```html
<header>
  <h1>Portofolio</h1>
</header>
<main>
  <section>Proyek saya</section>
</main>
<footer>Kontak</footer>
```

Keunggulan semantic HTML: aksesibilitas lebih baik dan SEO lebih baik karena mesin pencari memahami struktur halaman.

### Latihan berikutnya

Buka latihan untuk menyusun struktur portofolio Anda.
$content$
where id = 'b0000000-0000-4000-8000-000000000012';

update public.lessons
set content = $content$## Selektor dan Cascade

CSS memilih elemen dengan **selector**, lalu menerapkan **deklarasi** `properti: nilai`.

```css
h1 {
  color: blue;
  font-size: 2rem;
}
```

- `h1` adalah selector elemen.
- `color` mengubah warna teks.
- `background-color` mengubah warna latar.

### Cascade

Bila beberapa aturan bertabrakan, aturan yang lebih spesifik atau lebih akhir menang (cascade).

### Latihan berikutnya

Lanjutkan ke latihan untuk mengubah warna judul.
$content$
where id = 'b0000000-0000-4000-8000-000000000021';

update public.lessons
set content = $content$## Flexbox untuk tata letak baris

Aktifkan flexbox dengan `display: flex`. Gunakan `justify-content` untuk sumbu utama dan `align-items` untuk sumbu silang.

```css
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

Flexbox cocok untuk navigasi, kartu sejajar, dan tata letak satu dimensi.

### Konsep penting

- `justify-content`: distribusi item pada sumbu utama (`flex-start`, `center`, `space-between`, dll).
- `align-items`: penyelarasan item pada sumbu silang (`flex-start`, `center`, `stretch`, dll).

### Latihan berikutnya

Selesaikan latihan flexbox untuk tata letak dua kartu.
$content$
where id = 'b0000000-0000-4000-8000-000000000031';

insert into public.lessons (id, module_id, title, content, kind, order_index, is_published)
values (
  'b0000000-0000-4000-8000-000000000032',
  'a0000000-0000-4000-8000-000000000004',
  'Grid Layout',
  $content$## Grid Layout

Selain Flexbox, CSS menyediakan **Grid** untuk tata letak dua dimensi.

```css
.container {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 1rem;
}
```

- `grid-template-columns` mendefinisikan kolom.
- `gap` menentukan jarak antar kolom/baris.

Grid cocok untuk layout halaman dengan area header, sidebar, dan konten utama.
$content$,
  'material', 2, true
)
on conflict (id) do update
set title = excluded.title,
    content = excluded.content,
    kind = excluded.kind,
    order_index = excluded.order_index,
    is_published = excluded.is_published;
