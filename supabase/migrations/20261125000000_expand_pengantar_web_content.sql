-- WebCode Lab — richer learning material for "Pengantar Web"
-- Adds visual diagrams and complete explanations in the freeCodeCamp-style
-- "concept -> example -> try it" flow. Demo content only.

update public.modules
set description = 'Konsep dasar pengembangan web: cara browser bekerja, peran HTML/CSS/JavaScript, HTTP, DevTools, dan struktur proyek.'
where id = 'a0000000-0000-4000-8000-000000000001';

insert into public.lessons (id, module_id, title, content, kind, order_index, is_published)
values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001',
   'Apa itu Pemrograman Web?',
   $content$## Apa itu Pemrograman Web?

Pemrograman web adalah proses membangun halaman dan aplikasi yang berjalan di browser. Bayangkan sebuah rumah: **HTML** adalah kerangka, **CSS** adalah cat dan dekorasi, sedangkan **JavaScript** adalah listrik yang membuat semuanya bekerja.

:::compare Tiga pilar web
HTML | Struktur | Menentukan heading, paragraf, gambar, dan tautan
CSS | Tampilan | Mengatur warna, jarak, ukuran, dan tata letak
JavaScript | Perilaku | Merespons klik, memvalidasi form, dan mengubah halaman
:::

### Bagaimana ketiganya bekerja?

:::flow Dari kode menjadi halaman
HTML | Browser membaca struktur dan isi halaman
CSS | Browser menerapkan warna, font, dan tata letak
JavaScript | Browser menjalankan logika dan interaksi
Layar | Hasil akhirnya tampil dan bisa kamu gunakan
:::

### Yang akan kamu pelajari

- Cara browser meminta dan menampilkan halaman.
- Perbedaan HTML, CSS, dan JavaScript.
- Cara menulis kode pertama dan melihat hasilnya lewat live preview.

:::tip Cara belajar yang efektif
Baca konsepnya, lalu ketik ulang contohnya di playground. Jangan takut salah — error adalah bagian normal dari proses belajar.
:::

:::key Poin kunci
Setiap halaman web modern hampir selalu menggabungkan tiga bahasa ini. Mulailah dari HTML, rapikan dengan CSS, lalu tambahkan perilaku dengan JavaScript.
:::

> Materi ini adalah contoh demo, bukan materi resmi dosen.
$content$,
   'material', 1, true),

  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001',
   'Client, Server, dan Browser',
   $content$## Client, Server, dan Browser

**Client** adalah perangkat yang meminta halaman (biasanya browser). **Server** menyimpan dan mengirimkan halaman tersebut. Proses ini terjadi dalam hitungan milidetik setiap kali kamu membuka sebuah situs.

:::flow Perjalanan satu halaman web
Browser | Mengetik alamat dan mengirim request HTTP
Server | Mencari file, menjalankan kode, lalu mengirim response
Browser | Menggabungkan HTML, CSS, dan JavaScript
Layar | Menampilkan halaman yang bisa kamu gunakan
:::

### Istilah penting

| Istilah | Arti |
| --- | --- |
| Request | Permintaan dari browser ke server |
| Response | Balasan server berisi HTML, CSS, JavaScript, atau JSON |
| Render | Proses browser mengubah kode menjadi tampilan |
| DNS | Buku alamat yang menerjemahkan nama domain menjadi alamat IP |

:::note Alamat web itu apa?
`https://example.com/halo.html` terdiri dari protokol (`https`), domain (`example.com`), dan path (`/halo.html`). Protokol HTTPS mengenkripsi data yang dikirim antara browser dan server.
:::

### Client bukan hanya komputer

Ponsel, tablet, dan laptop semuanya bisa menjadi client. Karena ukuran layar berbeda, halaman web perlu dibuat **responsif** agar tetap nyaman digunakan di perangkat apa pun.

:::key Poin kunci
Browser meminta, server merespons, lalu browser merender. Memahami alur ini membantumu mencari tahu di mana masalah terjadi ketika halaman tidak tampil seperti yang diharapkan.
:::
$content$,
   'material', 2, true),

  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001',
   'Latihan: Sajikan halaman pertama',
   '', 'exercise', 3, true),

  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001',
   'Bahasa JavaScript',
   $content$## Bahasa JavaScript

JavaScript membuat halaman web bisa merespons tindakan pengguna. Jika HTML adalah struktur dan CSS adalah tampilan, JavaScript adalah **perilaku**.

:::compare Apa yang bisa dilakukan JavaScript?
Mengubah teks | `textContent` | Menampilkan sapaan baru
Menangani klik | `addEventListener` | Tombol yang bereaksi
Memvalidasi form | `input.value` | Menolak email kosong
Menyimpan data | `localStorage` | Mengingat preferensi pengguna
:::

### Contoh pertama

```js
const judul = document.querySelector('h1');
const tombol = document.querySelector('#cta');

tombol.addEventListener('click', () => {
  judul.textContent = 'Halo dari JavaScript!';
});
```

### Membaca kode di atas

1. `document.querySelector` mencari elemen di halaman.
2. `addEventListener` memasang fungsi yang dijalankan saat tombol diklik.
3. `textContent` mengganti teks di dalam elemen `h1`.

:::note Di mana kode ditulis?
Kamu bisa menaruh JavaScript di dalam `<script>` pada HTML, atau di file terpisah seperti `script.js` yang dihubungkan dengan `<script src="script.js"></script>`.
:::

:::warning Urutan eksekusi
JavaScript hanya bisa mengubah elemen yang sudah ada. Letakkan `<script>` di akhir `<body>` atau tunggu event `DOMContentLoaded` sebelum mencari elemen.
:::
$content$,
   'material', 4, true),

  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001',
   'Mengaktifkan Interaksi dengan JavaScript',
   $content$## Mengaktifkan Interaksi dengan JavaScript

JavaScript membuat halaman web menjadi hidup. Perhatikan alur sederhana berikut: pengguna melakukan aksi, event listener menangkapnya, lalu DOM diperbarui.

:::flow Dari klik menjadi perubahan
Pengguna | Menekan tombol atau mengisi input
Event | Browser mengirim event `click` atau `input`
Listener | Fungsi JavaScript menangani event tersebut
DOM | Teks, class, atau elemen di halaman berubah
:::

### Coba sendiri

:::preview Tombol yang mengubah teks
<h1 id="judul">Halo Web</h1>
<button id="cta" type="button">Klik saya</button>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; }
h1 { color: #0f172a; }
button {
  border: 0;
  border-radius: 10px;
  background: #ea580c;
  color: white;
  font-weight: 700;
  padding: 10px 16px;
  cursor: pointer;
}
button:hover { background: #c2410c; }
---js---
const tombol = document.querySelector('#cta');
const judul = document.querySelector('#judul');

tombol.addEventListener('click', () => {
  judul.textContent = 'Halo dari JavaScript!';
});
:::

### Pola kerja belajar JavaScript

1. Tentukan perilaku yang diinginkan.
2. Cari elemen HTML yang akan disentuh.
3. Tulis logika JavaScript-nya.
4. Uji di live preview, lalu perbaiki error yang muncul.

:::tip Biasakan membaca error
Pesan error di console menunjukkan file dan baris masalah. Mulailah dari baris pertama, bukan dari error terakhir.
:::
$content$,
   'material', 5, true),

  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001',
   'HTTP dan Respons',
   $content$## HTTP dan Respons

Setiap kali browser meminta halaman, terjadi pertukaran **HTTP** antara browser dan server. HTTP adalah aturan komunikasi yang menentukan format permintaan dan balasan.

:::flow Siklus request-response
Request | Browser mengirim method, URL, dan headers
Server | Memproses permintaan dan menyiapkan respons
Response | Server mengirim status code, headers, dan body
Browser | Membaca body lalu merender halaman
:::

### Method HTTP yang umum

| Method | Kegunaan | Contoh |
| --- | --- | --- |
| `GET` | Mengambil data | Membuka halaman modul |
| `POST` | Mengirim data baru | Mengirim jawaban kuis |
| `PUT` | Mengganti data | Menyimpan perubahan profil |
| `DELETE` | Menghapus data | Menghapus draft proyek |

### Status code yang perlu dikenal

:::compare Status code
200 | Sukses | Halaman atau data berhasil dikirim
301 | Redirect | Resource dipindahkan ke alamat lain
404 | Tidak ditemukan | URL salah atau halaman dihapus
500 | Server error | Terjadi masalah di sisi server
:::

:::note Headers
Headers membawa informasi tambahan seperti tipe konten (`Content-Type`), Cookie, dan token autentikasi. Jangan pernah menaruh password di URL karena URL bisa tersimpan di log dan riwayat browser.
:::

:::key Poin kunci
Status code memberi tahu apakah permintaan berhasil. Saat aplikasi bermasalah, periksa tab Network di DevTools untuk melihat request yang gagal dan status code-nya.
:::
$content$,
   'material', 6, true),

  ('b0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000001',
   'DevTools dan Debugging',
   $content$## DevTools dan Debugging

Browser modern menyediakan **DevTools** untuk memeriksa halaman dan mencari penyebab masalah. DevTools adalah teman terbaikmu saat belajar coding.

:::compare Panel DevTools yang sering dipakai
Elements | Melihat dan mengubah HTML/CSS secara langsung
Console | Melihat log, pesan error, dan menjalankan JavaScript
Network | Memeriksa request, response, dan status code
Sources | Memasang breakpoint dan menelusuri alur kode
:::

### Alur debugging sederhana

:::flow Cara mencari bug
Reproduksi | Temukan langkah yang membuat masalah muncul
Periksa | Lihat Console dan Network untuk pesan error
Isolasi | Kecilkan masalah ke satu elemen atau satu baris kode
Perbaiki | Ubah kode, lalu uji ulang di preview
:::

### Console adalah alat belajar

```js
console.log('Nilai:', 42);
console.warn('Data belum lengkap');
console.error('Terjadi kesalahan');
```

:::tip Baca error dari atas
Pesan error biasanya menyebut jenis error, file, dan nomor baris. Buka baris tersebut di Sources, lalu periksa nilai variabel di sekitarnya.
:::

:::warning Hati-hati mengubah DOM di Elements
Perubahan di panel Elements hanya sementara. Saat halaman dimuat ulang, perubahan itu hilang. Untuk perubahan permanen, edit file HTML/CSS-nya.
:::
$content$,
   'material', 7, true),

  ('b0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000001',
   'Struktur Proyek Web',
   $content$## Struktur Proyek Web

Proyek web yang rapi lebih mudah dikembangkan dan di-debug. Biasanya satu halaman terdiri dari HTML, CSS, dan JavaScript yang dipisahkan ke file berbeda.

```text
proyek-pertama/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
└── img/
    └── logo.png
```

:::compare Peran setiap file
index.html | Struktur | Menyimpan elemen dan konten halaman
style.css | Tampilan | Mengatur warna, jarak, dan tata letak
script.js | Perilaku | Menangani event dan mengubah DOM
img/ | Aset | Menyimpan gambar dan ikon
:::

### Menghubungkan file

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <title>Proyek Pertama</title>
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body>
    <h1>Halo Web</h1>
    <script src="js/script.js"></script>
  </body>
</html>
```

:::note Nama file
Gunakan huruf kecil dan tanda hubung, misalnya `halaman-profil.html`, agar konsisten di semua sistem operasi. Hindari spasi pada nama file.
:::

:::key Poin kunci
Pisahkan struktur, tampilan, dan perilaku. Saat ada masalah, kamu tahu file mana yang harus diperiksa terlebih dahulu.
:::
$content$,
   'material', 8, true)
on conflict (id) do update
set module_id = excluded.module_id,
    title = excluded.title,
    content = excluded.content,
    kind = excluded.kind,
    order_index = excluded.order_index,
    is_published = excluded.is_published;
