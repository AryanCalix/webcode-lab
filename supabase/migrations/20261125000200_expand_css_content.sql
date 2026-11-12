-- WebCode Lab — richer learning material for "CSS Dasar"
-- Covers the box model, colors/typography, cascade/specificity, display and
-- positioning, responsive media queries, and pseudo-classes with transitions.

update public.modules
set description = 'Menata tampilan halaman dengan CSS: selector, box model, warna, tipografi, specificity, layout, responsif, dan interaksi visual.'
where id = 'a0000000-0000-4000-8000-000000000003';

insert into public.lessons (id, module_id, title, content, kind, order_index, is_published)
values
  ('b0000000-0000-4000-8000-000000000021', 'a0000000-0000-4000-8000-000000000003',
   'Selektor dan Cascade',
   $content$## Selektor dan Cascade

CSS memilih elemen dengan **selector**, lalu menerapkan **deklarasi** `properti: nilai`. Sekumpulan deklarasi untuk satu selector disebut **rule**.

```css
h1 {
  color: blue;
  font-size: 2rem;
}
```

- `h1` adalah selector elemen.
- `color` mengubah warna teks.
- `background-color` mengubah warna latar.

### Jenis selector

:::compare Selector CSS
Elemen | `h1`, `p`, `button` | Semua elemen dengan tag tersebut
Class | `.card`, `.tombol` | Elemen dengan `class="card"`
ID | `#judul` | Satu elemen dengan `id="judul"`
Descendant | `.card p` | Paragraf di dalam `.card`
Group | `h1, h2` | Beberapa selector sekaligus
:::

:::preview Selector class dan elemen
<h1>Judul halaman</h1>
<p class="catatan">Paragraf ini memakai class <code>catatan</code>.</p>
<p>Paragraf ini tidak.</p>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; }
h1 { color: #1d4ed8; }
.catatan {
  color: #9a3412;
  background: #ffedd5;
  padding: 8px 10px;
  border-radius: 8px;
}
:::

### Cascade

Bila beberapa aturan bertabrakan, browser memilih pemenang berdasarkan urutan dan tingkat kepentingan. Aturan yang lebih spesifik atau ditulis lebih akhir biasanya menang.

:::note Class lebih fleksibel daripada ID
Class bisa dipakai berulang kali, sedangkan ID harus unik dalam satu halaman. Untuk styling, biasakan memakai class.
:::

:::warning Jangan menebak specificity
Jika warna tidak berubah, periksa apakah ada aturan lain yang lebih spesifik di file CSS atau di DevTools. Jangan langsung menambahkan `!important`.
:::

:::key Poin kunci
Selector yang baik membuat CSS mudah dirawat. Pilih selector sesederhana mungkin dan hindari selector yang terlalu dalam.
:::
$content$,
   'material', 1, true),

  ('b0000000-0000-4000-8000-000000000023', 'a0000000-0000-4000-8000-000000000003',
   'Box Model dan Spacing',
   $content$## Box Model dan Spacing

Setiap elemen HTML dianggap sebagai kotak. Kotak itu memiliki empat lapisan: **content**, **padding**, **border**, dan **margin**.

:::compare Empat lapisan box model
Content | Isi elemen | Teks atau gambar di dalam kotak
Padding | Ruang dalam | Jarak antara content dan border
Border | Garis tepi | Garis di sekeliling padding
Margin | Ruang luar | Jarak antar kotak
:::

```css
.card {
  width: 280px;
  padding: 20px;
  border: 2px solid #fed7aa;
  margin: 16px;
}
```

### box-sizing

Secara default, `width` hanya menghitung content. Jika kamu menambahkan padding dan border, ukuran total bertambah.

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

Dengan `border-box`, `width` sudah mencakup padding dan border sehingga ukuran elemen lebih mudah diprediksi.

:::preview Percobaan box model
<div class="card">
  <h2>Kartu</h2>
  <p>Padding memberi ruang di dalam. Margin memberi jarak di luar.</p>
</div>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; background: #f8fafc; }
.card {
  box-sizing: border-box;
  width: 100%;
  max-width: 320px;
  padding: 20px;
  border: 2px solid #fdba74;
  border-radius: 16px;
  margin: 8px;
  background: white;
}
h2 { margin: 0 0 8px; color: #9a3412; }
p { margin: 0; color: #475569; line-height: 1.6; }
:::

:::note Margin collapse
Margin vertikal antara dua elemen kadang digabung menjadi satu. Ini disebut *margin collapse*. Gunakan padding atau `display: flex; gap` jika ingin jarak yang konsisten.
:::

:::tip Urutan singkat
`padding` untuk jarak dalam, `margin` untuk jarak luar, `gap` untuk jarak antar item di flex/grid.
:::
$content$,
   'material', 2, true),

  ('b0000000-0000-4000-8000-000000000024', 'a0000000-0000-4000-8000-000000000003',
   'Warna, Tipografi, dan Kontras',
   $content$## Warna, Tipografi, dan Kontras

Warna dan tipografi menentukan apakah halaman nyaman dibaca. Tujuannya bukan sekadar cantik, tetapi **jelas** dan **mudah dipindai**.

### Menulis warna

```css
h1 {
  color: #ea580c;
  background-color: rgb(255, 247, 237);
}

.catatan {
  color: hsl(215 25% 27%);
}
```

:::compare Format warna
Hex | `#ea580c` | Ringkas dan paling umum
RGB | `rgb(234 88 12)` | Mudah dibaca jika tahu nilai channel
HSL | `hsl(24 95% 48%)` | Mudah untuk membuat variasi terang/gelap
Nama | `orange` | Cepat, tetapi pilihannya terbatas
:::

### Tipografi yang nyaman

```css
body {
  font-family: system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #1e293b;
}

h1 {
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  line-height: 1.2;
}
```

- Gunakan ukuran minimal 16px untuk teks utama.
- Beri `line-height` sekitar 1.5–1.7 agar baris tidak berdesakan.
- Batasi panjang baris sekitar 60–75 karakter.

:::preview Warna dan tipografi
<h1>Belajar CSS</h1>
<p class="lead">Tipografi yang baik membuat materi lebih nyaman dibaca.</p>
<p class="note">Gunakan kontras yang cukup antara teks dan latar.</p>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; line-height: 1.6; color: #1e293b; }
h1 { margin: 0 0 8px; color: #ea580c; font-size: 30px; }
.lead { margin: 0 0 10px; font-size: 17px; }
.note { margin: 0; padding: 10px 12px; border-radius: 10px; background: #eff6ff; color: #1e3a8a; }
:::

:::warning Kontras rendah
Teks abu-abu muda di atas putih terlihat elegan, tetapi sulit dibaca. Periksa kontras dengan alat pemeriksa kontras sebelum memilih warna.
:::

:::key Poin kunci
Pilih sedikit warna, gunakan skala tipografi yang konsisten, dan utamakan keterbacaan di atas efek visual.
:::
$content$,
   'material', 3, true),

  ('b0000000-0000-4000-8000-000000000025', 'a0000000-0000-4000-8000-000000000003',
   'Cascade, Specificity, dan Inheritance',
   $content$## Cascade, Specificity, dan Inheritance

Ketika dua aturan CSS mengatur properti yang sama, browser harus memilih pemenang. Urutannya ditentukan oleh **cascade**, **specificity**, dan **inheritance**.

:::flow Cara browser memilih aturan
Sumber | CSS dari browser, file CSS, dan inline style
Specificity | Selector yang lebih spesifik menang
Urutan | Jika sama spesifik, aturan yang terakhir menang
Inheritance | Properti tertentu diwariskan ke elemen anak
:::

### Specificity secara sederhana

| Selector | Contoh | Kekuatan |
| --- | --- | --- |
| Elemen | `p` | Paling rendah |
| Class | `.catatan` | Menengah |
| ID | `#judul` | Tinggi |
| Inline style | `style="color: red"` | Sangat tinggi |
| `!important` | `color: red !important` | Mengalahkan hampir semua |

### Inheritance

Beberapa properti seperti `color`, `font-family`, dan `line-height` diwariskan dari elemen induk. Properti layout seperti `margin` dan `display` tidak diwariskan.

```css
body {
  color: #1e293b;
  font-family: system-ui, sans-serif;
}

.card {
  border: 1px solid #e2e8f0;
}
```

:::preview Cascade dalam aksi
<p class="teks">Teks ini diatur oleh beberapa aturan.</p>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; }
p { color: #64748b; }
.teks { color: #ea580c; font-weight: 700; }
p.teks { background: #fff7ed; padding: 10px; border-radius: 8px; }
:::

:::warning Hindari !important
`!important` memutus alur cascade dan membuat CSS sulit diubah. Gunakan sebagai upaya terakhir, bukan solusi pertama.
:::

:::tip Gunakan DevTools
Panel Styles menunjukkan aturan yang menang dan yang dicoret. Ini cara tercepat memahami mengapa sebuah properti tidak berubah.
:::
$content$,
   'material', 4, true),

  ('b0000000-0000-4000-8000-000000000026', 'a0000000-0000-4000-8000-000000000003',
   'Display, Position, dan Overflow',
   $content$## Display, Position, dan Overflow

Tiga properti ini menentukan bagaimana elemen mengambil ruang dan berperilaku terhadap elemen lain.

### Display

:::compare Nilai display
block | Memenuhi lebar induk | `div`, `p`, `h1`
inline | Mengikuti alur teks | `span`, `a`
inline-block | Seperti inline, tetapi bisa diberi ukuran | Tombol atau badge
flex | Tata letak satu dimensi | Navigasi, baris kartu
grid | Tata letak dua dimensi | Galeri, layout halaman
none | Menghilangkan elemen | Menyembunyikan panel
:::

### Position

```css
.badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

.card {
  position: relative;
}
```

- `relative` menjadi titik acuan untuk anak yang `absolute`.
- `absolute` keluar dari alur normal dan menempel pada ancestor terdekat yang berposisi.
- `fixed` menempel pada viewport.
- `sticky` mengikuti scroll sampai batas tertentu.

### Overflow

```css
.kode {
  overflow-x: auto;
}
```

Gunakan `overflow: auto` untuk membuat area scroll hanya saat dibutuhkan. Hindari menyembunyikan konten penting dengan `overflow: hidden`.

:::preview Badge dengan position
<div class="card">
  <span class="badge">Baru</span>
  <h2>Kartu materi</h2>
  <p>Badge ditempatkan di pojok kartu.</p>
</div>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; background: #f8fafc; }
.card { position: relative; max-width: 280px; padding: 20px; border-radius: 14px; background: white; border: 1px solid #e2e8f0; }
.badge { position: absolute; top: 10px; right: 10px; background: #ea580c; color: white; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 999px; }
h2 { margin: 0 0 6px; font-size: 18px; }
p { margin: 0; color: #64748b; line-height: 1.5; }
:::

:::note Position dan aksesibilitas
Elemen yang diposisikan absolut tetap ada di DOM. Jika hanya ingin menyembunyikan, pertimbangkan `hidden` atau `display: none` agar tidak mengganggu pembaca layar.
:::
$content$,
   'material', 5, true),

  ('b0000000-0000-4000-8000-000000000027', 'a0000000-0000-4000-8000-000000000003',
   'Responsif dengan Media Query',
   $content$## Responsif dengan Media Query

Halaman responsif menyesuaikan tampilan dengan ukuran layar. Pendekatan yang paling mudah adalah **mobile-first**: mulai dari layar kecil, lalu tambahkan aturan untuk layar yang lebih besar.

### Viewport

Pastikan HTML memiliki:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

Tanpa meta ini, ponsel akan menampilkan halaman versi desktop yang diperkecil.

### Media query

```css
.grid {
  display: grid;
  gap: 12px;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

:::flow Alur mobile-first
Mobile | Satu kolom, teks nyaman dibaca
Tablet | Dua kolom saat ruang mencukupi
Desktop | Tiga kolom atau sidebar
Uji | Periksa di beberapa lebar layar
:::

:::compare Unit yang berguna
rem | Relatif terhadap font root | Ukuran teks dan spacing
% | Relatif terhadap induk | Lebar fleksibel
vw/vh | Relatif terhadap viewport | Hero atau overlay
fr | Fraksi ruang grid | Kolom grid
clamp() | Nilai minimum–ideal–maksimum | Judul responsif
:::

:::preview Kartu responsif
<div class="grid">
  <article>HTML</article>
  <article>CSS</article>
  <article>JavaScript</article>
</div>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; background: #f8fafc; }
.grid { display: grid; gap: 10px; }
article { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; font-weight: 700; color: #9a3412; }
@media (min-width: 420px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 620px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
:::

:::tip Uji dengan DevTools
Aktifkan mode perangkat di DevTools, lalu geser lebar layar. Perhatikan apakah teks terpotong, tombol terlalu kecil, atau konten keluar dari layar.
:::

:::warning Jangan mengandalkan lebar perangkat tertentu
Gunakan breakpoint berdasarkan kebutuhan konten, bukan nama perangkat. Konten yang butuh dua kolom di 600px bisa berbeda di proyek lain.
:::
$content$,
   'material', 6, true),

  ('b0000000-0000-4000-8000-000000000028', 'a0000000-0000-4000-8000-000000000003',
   'Pseudo-class dan Transisi',
   $content$## Pseudo-class dan Transisi

Pseudo-class memilih elemen berdasarkan keadaan, bukan hanya tag atau class. Contoh paling umum adalah `:hover` dan `:focus`.

```css
button:hover {
  background-color: #c2410c;
}

button:focus-visible {
  outline: 3px solid #fdba74;
  outline-offset: 2px;
}
```

:::compare Pseudo-class yang sering dipakai
:hover | Saat kursor di atas elemen | Tombol dan kartu
:focus-visible | Saat elemen fokus lewat keyboard | Tautan dan input
:first-child | Anak pertama | Item menu pertama
:nth-child(2n) | Anak genap | Baris tabel selang-seling
:disabled | Elemen nonaktif | Tombol saat proses simpan
:::

### Transisi

```css
.card {
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px -12px rgba(15, 23, 42, 0.35);
}
```

Transisi membuat perubahan terasa halus. Gunakan durasi singkat, sekitar 150–250ms, agar antarmuka tetap terasa responsif.

:::preview Tombol dan kartu interaktif
<button type="button">Arahkan kursor</button>
<div class="card">Kartu yang terangkat saat hover</div>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; background: #f8fafc; }
button { border: 0; border-radius: 10px; background: #ea580c; color: white; font-weight: 700; padding: 10px 16px; cursor: pointer; transition: background 180ms ease, transform 180ms ease; }
button:hover { background: #c2410c; transform: translateY(-1px); }
.card { margin-top: 14px; max-width: 280px; padding: 16px; border-radius: 14px; background: white; border: 1px solid #e2e8f0; transition: transform 180ms ease, box-shadow 180ms ease; }
.card:hover { transform: translateY(-3px); box-shadow: 0 12px 24px -12px rgba(15, 23, 42, 0.35); }
:::

:::warning Hormati preferensi pengguna
Beberapa pengguna memilih mengurangi animasi. Hormati pengaturan itu:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none;
    transition: none;
  }
}
```
:::

:::key Poin kunci
Gunakan pseudo-class untuk memberi umpan balik, dan pastikan fokus keyboard selalu terlihat. Animasi harus membantu, bukan menghalangi.
:::
$content$,
   'material', 7, true),

  ('b0000000-0000-4000-8000-000000000022', 'a0000000-0000-4000-8000-000000000003',
   'Latihan: Ubah warna judul menjadi biru',
   '', 'exercise', 8, true)
on conflict (id) do update
set module_id = excluded.module_id,
    title = excluded.title,
    content = excluded.content,
    kind = excluded.kind,
    order_index = excluded.order_index,
    is_published = excluded.is_published;
