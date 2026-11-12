-- WebCode Lab — richer learning material for "HTML Dasar"
-- Expands the module into a complete HTML foundation: document structure,
-- elements, text, links, images, lists, tables, forms, and accessibility.

update public.modules
set description = 'Membangun struktur halaman dengan HTML: dokumen dasar, elemen teks, tautan, gambar, list, tabel, form, dan aksesibilitas.'
where id = 'a0000000-0000-4000-8000-000000000002';

insert into public.lessons (id, module_id, title, content, kind, order_index, is_published)
values
  ('b0000000-0000-4000-8000-000000000014', 'a0000000-0000-4000-8000-000000000002',
   'Struktur Dokumen HTML',
   $content$## Struktur Dokumen HTML

Setiap halaman HTML yang baik dimulai dari kerangka yang sama. Kerangka ini memberi tahu browser bahwa dokumen berisi HTML dan bagaimana halaman harus dibaca.

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Belajar Web</title>
  </head>
  <body>
    <h1>Halo Web</h1>
    <p>Ini halaman pertamaku.</p>
  </body>
</html>
```

:::flow Urutan kerangka dokumen
DOCTYPE | Memberi tahu browser bahwa ini dokumen HTML5
html | Elemen akar yang membungkus seluruh halaman
head | Informasi halaman: charset, viewport, title, CSS
body | Konten yang terlihat oleh pengguna
:::

### Bagian yang wajib ada

| Bagian | Fungsi |
| --- | --- |
| `<!DOCTYPE html>` | Menghindari mode kompatibilitas lama pada browser |
| `<html lang="id">` | Menentukan bahasa utama halaman |
| `<meta charset="UTF-8" />` | Mendukung huruf, simbol, dan emoji |
| `<meta name="viewport" ... />` | Membuat halaman nyaman di ponsel |
| `<title>` | Judul tab browser dan hasil pencarian |

:::preview Halaman pertama
<h1>Halo Web</h1>
<p>Ini halaman pertamaku yang ditulis dengan HTML.</p>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; }
h1 { color: #ea580c; margin: 0 0 8px; }
p { color: #334155; }
:::

:::note head tidak terlihat
Elemen di dalam `<head>` tidak tampil di halaman, tetapi memengaruhi cara browser membaca dan menampilkan halaman.
:::

:::key Poin kunci
Gunakan kerangka dokumen yang lengkap sejak awal. Browser modern memaafkan banyak kesalahan, tetapi struktur yang benar membuat halaman lebih mudah dirawat dan diakses.
:::
$content$,
   'material', 1, true),

  ('b0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000002',
   'Elemen Dasar HTML',
   $content$## Elemen Dasar HTML

HTML tersusun dari **elemen**. Sebuah elemen biasanya memiliki tag pembuka, konten, dan tag penutup.

```html
<h1>Judul utama</h1>
<p>Sebuah paragraf.</p>
<ul>
  <li>Item daftar</li>
</ul>
```

:::compare Elemen yang sering dipakai
h1–h6 | Heading | Menentukan hierarki judul
p | Paragraf | Menulis blok teks
ul / ol | Daftar | Menampilkan poin atau nomor
li | Item daftar | Satu baris di dalam daftar
:::

### Memahami hierarki heading

- `h1`: judul utama (biasanya satu per halaman).
- `h2`–`h6`: sub-judul, urut dari besar ke kecil.
- Heading tidak boleh dipilih hanya karena ukurannya. Gunakan CSS untuk mengatur ukuran.

:::preview Heading dan paragraf
<h1>Belajar HTML</h1>
<h2>Elemen dasar</h2>
<p>HTML memberi <strong>struktur</strong> pada <em>konten</em>.</p>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; }
h1 { color: #ea580c; margin: 0 0 8px; }
h2 { margin: 0 0 8px; }
p { color: #334155; margin: 0; }
:::

:::warning Jangan menyarangkan tag sembarangan
Pastikan setiap tag pembuka ditutup dengan urutan yang benar. `<p><strong>Teks</p></strong>` salah; tulis `<p><strong>Teks</strong></p>`.
:::

:::tip Elemen kosong
Beberapa elemen tidak memiliki tag penutup, misalnya `<img />`, `<br />`, dan `<input />`. Elemen ini disebut elemen kosong (void elements).
:::
$content$,
   'material', 2, true),

  ('b0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000002',
   'Atribut dan Semantic HTML',
   $content$## Atribut dan Semantic HTML

Atribut memberi informasi tambahan pada elemen. Atribut ditulis di tag pembuka dengan format `nama="nilai"`.

```html
<a href="https://example.com" target="_blank" rel="noreferrer">
  Kunjungi contoh
</a>
```

### Atribut yang sering dipakai

| Atribut | Dipakai pada | Fungsi |
| --- | --- | --- |
| `class` | Semua elemen | Menghubungkan elemen dengan CSS/JS |
| `id` | Semua elemen | Penanda unik satu elemen |
| `href` | `<a>` | Alamat tujuan tautan |
| `src` | `<img>`, `<script>` | Sumber file |
| `alt` | `<img>` | Teks alternatif gambar |

### Semantic HTML

**Semantic HTML** memakai elemen yang menjelaskan maknanya, bukan sekadar `div`.

:::compare Elemen semantik
header | Bagian pembuka | Logo, judul situs, navigasi utama
nav | Navigasi | Kumpulan tautan
main | Konten utama | Isi utama halaman
section | Bagian bertema | Satu topik atau bab
article | Konten mandiri | Berita, postingan, kartu
footer | Penutup | Hak cipta dan kontak
:::

:::preview Struktur halaman semantik
<header>
  <h1>Portofolio</h1>
</header>
<main>
  <section>
    <h2>Proyek saya</h2>
    <p>Halaman ini memakai elemen semantik.</p>
  </section>
</main>
<footer>Kontak: halo@example.com</footer>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; color: #0f172a; }
header { border-bottom: 2px solid #fed7aa; padding-bottom: 8px; }
h1 { margin: 0; color: #ea580c; }
h2 { margin: 16px 0 4px; }
footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #e2e8f0; color: #64748b; }
:::

:::note Manfaat semantic HTML
Pembaca layar dapat memahami struktur halaman, mesin pencari lebih mudah mengindeks konten, dan kode lebih mudah dibaca oleh tim.
:::

:::key Poin kunci
Gunakan elemen sesuai maknanya. `div` dan `span` tetap berguna untuk pembungkus gaya, tetapi jangan menggantikan elemen semantik yang sudah tersedia.
:::
$content$,
   'material', 3, true),

  ('b0000000-0000-4000-8000-000000000015', 'a0000000-0000-4000-8000-000000000002',
   'Teks, Link, dan Gambar',
   $content$## Teks, Link, dan Gambar

Halaman web terasa hidup karena ada teks yang terbaca, tautan yang bisa diklik, dan gambar yang mendukung pesan.

### Menekankan teks

```html
<p>
  Belajar <strong>HTML</strong> itu <em>menyenangkan</em>.
</p>
```

- `<strong>` menandai teks penting.
- `<em>` menandai penekanan.
- Jangan gunakan `<b>` dan `<i>` hanya untuk mengubah tampilan; atur lewat CSS.

### Membuat tautan

```html
<a href="https://developer.mozilla.org" target="_blank" rel="noreferrer">
  Dokumentasi MDN
</a>
```

:::compare Jenis tautan
Tautan internal | `href="/modul/html"` | Berpindah halaman di situs yang sama
Tautan eksternal | `href="https://example.com"` | Membuka situs lain
Tautan anchor | `href="#form"` | Melompat ke elemen dengan `id="form"`
Tautan email | `href="mailto:halo@example.com"` | Membuka aplikasi email
:::

### Menampilkan gambar

```html
<img
  src="img/logo.png"
  alt="Logo WebCode Lab"
  width="160"
  height="80"
/>
```

Atribut `alt` wajib diisi. Teks ini muncul jika gambar gagal dimuat dan dibacakan oleh pembaca layar.

:::preview Teks, tautan, dan gambar
<h1>Belajar Web</h1>
<p>Kunjungi <a href="https://developer.mozilla.org" target="_blank" rel="noreferrer">MDN</a> untuk referensi.</p>
<img
  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='100'%3E%3Crect width='180' height='100' rx='14' fill='%23ffedd5'/%3E%3Ccircle cx='90' cy='50' r='26' fill='%23f97316'/%3E%3C/svg%3E"
  alt="Ilustrasi lingkaran oranye"
/>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; }
h1 { margin: 0 0 10px; color: #ea580c; }
a { color: #c2410c; font-weight: 700; }
img { display: block; margin-top: 12px; border-radius: 14px; }
:::

:::warning Tautan eksternal
Tambahkan `rel="noreferrer"` saat memakai `target="_blank"` agar halaman tujuan tidak bisa mengakses halaman asal melalui `window.opener`.
:::
$content$,
   'material', 4, true),

  ('b0000000-0000-4000-8000-000000000016', 'a0000000-0000-4000-8000-000000000002',
   'List dan Tabel',
   $content$## List dan Tabel

Gunakan **list** untuk kumpulan item dan **tabel** untuk data yang memiliki baris dan kolom. Keduanya membantu pembaca layar memahami hubungan antar data.

### Tiga jenis list

```html
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>

<ol>
  <li>Buka editor</li>
  <li>Tulis kode</li>
  <li>Lihat preview</li>
</ol>
```

:::compare Jenis list
ul | Tidak berurutan | Daftar fitur atau menu
ol | Berurutan | Langkah-langkah tutorial
dl | Deskripsi | Istilah dan definisinya
:::

### Tabel data

```html
<table>
  <caption>Nilai kuis</caption>
  <thead>
    <tr>
      <th scope="col">Nama</th>
      <th scope="col">Nilai</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Budi</td>
      <td>90</td>
    </tr>
  </tbody>
</table>
```

:::preview Tabel nilai
<table>
  <caption>Nilai kuis HTML</caption>
  <thead>
    <tr>
      <th scope="col">Nama</th>
      <th scope="col">Nilai</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>Budi</td><td>90</td></tr>
    <tr><td>Sari</td><td>85</td></tr>
  </tbody>
</table>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; }
table { border-collapse: collapse; width: 100%; }
caption { text-align: left; font-weight: 700; margin-bottom: 8px; }
th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
thead { background: #fff7ed; }
:::

:::note Tabel bukan untuk layout
Di masa lalu tabel dipakai untuk menyusun halaman. Sekarang gunakan CSS Grid/Flexbox untuk layout, dan simpan tabel hanya untuk data tabular.
:::

:::tip scope dan caption
`scope="col"` membantu pembaca layar menghubungkan sel dengan judul kolom. `caption` memberi tahu tujuan tabel.
:::
$content$,
   'material', 5, true),

  ('b0000000-0000-4000-8000-000000000017', 'a0000000-0000-4000-8000-000000000002',
   'Form dan Input',
   $content$## Form dan Input

Form memungkinkan pengguna mengirim data: nama, email, komentar, atau jawaban. Setiap input sebaiknya memiliki **label** yang terhubung.

```html
<form>
  <label for="nama">Nama</label>
  <input id="nama" name="nama" type="text" placeholder="Nama lengkap" required />

  <label for="email">Email</label>
  <input id="email" name="email" type="email" required />

  <button type="submit">Kirim</button>
</form>
```

:::compare Tipe input
text | Teks singkat | Nama, judul
email | Alamat email | Validasi format dasar
password | Kata sandi | Karakter disembunyikan
number | Angka | Nilai kuis
checkbox | Pilihan ganda | Setuju atau tidak
date | Tanggal | Tenggat atau tanggal lahir
:::

:::preview Form sederhana
<form onsubmit="event.preventDefault(); document.querySelector('#hasil').textContent = 'Halo, ' + document.querySelector('#nama').value + '!';">
  <label for="nama">Nama</label>
  <input id="nama" type="text" placeholder="Tulis namamu" required />
  <button type="submit">Sapa saya</button>
  <p id="hasil" role="status"></p>
</form>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; }
form { display: grid; gap: 10px; max-width: 280px; }
label { font-weight: 700; font-size: 14px; }
input { border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 10px; }
button { border: 0; border-radius: 8px; background: #ea580c; color: white; padding: 9px 14px; font-weight: 700; cursor: pointer; }
#hasil { color: #047857; font-weight: 700; min-height: 20px; }
:::

:::warning label dan id
Nilai `for` pada label harus sama dengan `id` input. Tanpa itu, klik label tidak memfokuskan input dan pembaca layar tidak tahu label milik siapa.
:::

:::note Form belum mengirim ke server
Contoh di atas hanya menampilkan hasil di halaman. Di aplikasi nyata, data form dikirim ke server melalui `action` atau JavaScript `fetch`, lalu divalidasi lagi di server.
:::
$content$,
   'material', 6, true),

  ('b0000000-0000-4000-8000-000000000018', 'a0000000-0000-4000-8000-000000000002',
   'Aksesibilitas Dasar',
   $content$## Aksesibilitas Dasar

Aksesibilitas membuat halaman bisa digunakan semua orang, termasuk pengguna pembaca layar, keyboard, dan pembesaran teks. HTML yang baik adalah fondasi aksesibilitas.

:::compare Lakukan dan hindari
Gunakan elemen semantik | `<button>` untuk tombol | Hindari `<div onclick>`
Sediakan teks alternatif | `alt="Logo kampus"` | Hindari `alt=""` untuk gambar penting
Hubungkan label | `<label for="email">` | Hindari placeholder sebagai satu-satunya label
Jaga urutan heading | h1 → h2 → h3 | Hindari melompat dari h1 ke h4
Pastikan kontras cukup | teks gelap di latar terang | Hindari abu-abu muda di putih
:::

### Bisa digunakan tanpa mouse

Coba navigasi halaman hanya dengan tombol `Tab`. Fokus harus terlihat jelas dan urutannya masuk akal. Jangan menghapus outline tanpa menggantinya.

```css
a:focus-visible,
button:focus-visible {
  outline: 3px solid #ea580c;
  outline-offset: 2px;
}
```

:::flow Menguji aksesibilitas
Tab | Pastikan semua kontrol bisa dijangkau keyboard
Enter/Space | Pastikan tombol dan tautan bisa diaktifkan
Zoom 200% | Pastikan teks tidak terpotong
Pembaca layar | Pastikan heading dan label terbaca
:::

:::note Warna bukan satu-satunya penanda
Jangan menyampaikan status hanya dengan warna. Tambahkan teks atau ikon, misalnya "Berhasil" atau tanda centang.
:::

:::key Poin kunci
Aksesibilitas bukan fitur tambahan di akhir. Keputusan sejak menulis HTML menentukan apakah halaman bisa digunakan semua orang.
:::
$content$,
   'material', 7, true),

  ('b0000000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000002',
   'Latihan: Struktur halaman portofolio',
   '', 'exercise', 8, true)
on conflict (id) do update
set module_id = excluded.module_id,
    title = excluded.title,
    content = excluded.content,
    kind = excluded.kind,
    order_index = excluded.order_index,
    is_published = excluded.is_published;
