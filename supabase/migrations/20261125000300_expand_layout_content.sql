-- WebCode Lab — richer learning material for "Flexbox dan Grid"
-- Adds flex direction/wrapping, alignment, named grid areas, and responsive
-- layout patterns, each with a live preview.

update public.modules
set description = 'Menyusun tata letak modern dengan Flexbox dan CSS Grid: arah, pembungkusan, alignment, grid areas, dan pola responsif.'
where id = 'a0000000-0000-4000-8000-000000000004';

insert into public.lessons (id, module_id, title, content, kind, order_index, is_published)
values
  ('b0000000-0000-4000-8000-000000000031', 'a0000000-0000-4000-8000-000000000004',
   'Flexbox untuk tata letak baris',
   $content$## Flexbox untuk tata letak baris

Flexbox mengatur item dalam **satu dimensi**: satu baris atau satu kolom. Aktifkan dengan `display: flex` pada container.

```css
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
```

- `justify-content` mengatur distribusi pada **sumbu utama**.
- `align-items` menyelaraskan item pada **sumbu silang**.
- `gap` memberi jarak antar item tanpa margin tambahan.

:::preview Navigasi dengan Flexbox
<nav class="nav">
  <a href="#">Beranda</a>
  <a href="#">Modul</a>
  <a href="#">Forum</a>
</nav>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; }
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
}
a { color: #9a3412; font-weight: 700; text-decoration: none; }
a:hover { color: #ea580c; }
:::

:::compare Kapan memakai Flexbox?
Navigasi | Deretan tautan sejajar | `display: flex`
Toolbar | Tombol dan ikon dalam satu baris | `justify-content: space-between`
Kartu sejajar | Beberapa kartu dengan tinggi sama | `align-items: stretch`
Pusatkan konten | Satu elemen di tengah | `justify-content: center; align-items: center`
:::

:::note Sumbu utama
Pada `flex-direction: row`, sumbu utama horizontal. Jika diubah menjadi `column`, sumbu utama menjadi vertikal dan arti `justify-content` ikut berubah.
:::

:::key Poin kunci
Flexbox sangat cocok untuk komponen satu dimensi: navigasi, toolbar, baris kartu, dan form. Untuk layout dua dimensi yang kompleks, gunakan Grid.
:::
$content$,
   'material', 1, true),

  ('b0000000-0000-4000-8000-000000000032', 'a0000000-0000-4000-8000-000000000004',
   'Grid Layout',
   $content$## Grid Layout

CSS Grid mengatur item dalam **dua dimensi**: baris dan kolom sekaligus. Grid cocok untuk layout halaman dan galeri.

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
```

- `grid-template-columns` mendefinisikan kolom.
- `repeat(3, 1fr)` membuat tiga kolom dengan lebar sama.
- `1fr` berarti satu fraksi dari ruang yang tersedia.
- `gap` menentukan jarak antar sel.

:::preview Galeri tiga kolom
<div class="gallery">
  <div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
  <div>5</div>
  <div>6</div>
</div>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; background: #f8fafc; }
.gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.gallery div {
  display: grid;
  place-items: center;
  height: 64px;
  border-radius: 12px;
  background: #ffedd5;
  color: #9a3412;
  font-weight: 800;
}
:::

### Grid vs Flexbox

:::compare Dua alat tata letak
Flexbox | Satu dimensi | Navigasi dan baris kartu
Grid | Dua dimensi | Galeri dan layout halaman
Flexbox | Berbasis isi | Item menentukan ukuran
Grid | Berbasis container | Container menentukan ukuran
:::

:::note minmax()
`repeat(auto-fit, minmax(180px, 1fr))` membuat kolom selebar minimal 180px dan mengisi ruang yang tersedia. Ini sangat berguna untuk galeri responsif.
:::

:::key Poin kunci
Gunakan Grid ketika kamu perlu mengatur baris dan kolom sekaligus. Gunakan Flexbox ketika cukup mengatur satu arah.
:::
$content$,
   'material', 2, true),

  ('b0000000-0000-4000-8000-000000000033', 'a0000000-0000-4000-8000-000000000004',
   'Flex Direction, Wrapping, dan Gap',
   $content$## Flex Direction, Wrapping, dan Gap

Flexbox lebih dari sekadar membuat item sejajar. Kamu bisa mengubah arah, membungkus item ke baris baru, dan mengatur pertumbuhan item.

```css
.container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
}
```

:::compare Properti flex container
flex-direction | Arah sumbu utama | `row`, `column`, `row-reverse`
flex-wrap | Membungkus item | `nowrap`, `wrap`
justify-content | Distribusi sumbu utama | `flex-start`, `center`, `space-between`
align-items | Penyelarasan sumbu silang | `flex-start`, `center`, `stretch`
gap | Jarak antar item | `8px`, `1rem`
:::

### Item yang fleksibel

```css
.item {
  flex: 1 1 180px;
}
```

Arti singkatnya:

- `flex-grow: 1`: item boleh tumbuh mengisi ruang.
- `flex-shrink: 1`: item boleh menyusut jika sempit.
- `flex-basis: 180px`: ukuran awal item.

:::preview Kartu yang membungkus
<div class="row">
  <div class="item">HTML</div>
  <div class="item">CSS</div>
  <div class="item">JavaScript</div>
  <div class="item">Responsif</div>
</div>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; background: #f8fafc; }
.row { display: flex; flex-wrap: wrap; gap: 10px; }
.item {
  flex: 1 1 120px;
  padding: 18px 14px;
  border-radius: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  text-align: center;
  font-weight: 700;
  color: #9a3412;
}
:::

:::tip Mulai dari mobile
Pada layar kecil, `flex-wrap: wrap` sering cukup tanpa media query. Item akan turun ke baris berikutnya saat ruang habis.
:::

:::warning Jangan lupa gap
Menambahkan margin pada setiap item bisa membuat jarak di tepi terlihat aneh. `gap` lebih rapi dan mudah diatur.
:::
$content$,
   'material', 3, true),

  ('b0000000-0000-4000-8000-000000000034', 'a0000000-0000-4000-8000-000000000004',
   'Alignment dan Distribusi Ruang',
   $content$## Alignment dan Distribusi Ruang

Alignment menentukan posisi item di dalam container. Pahami dulu sumbu utama dan sumbu silang agar tidak tertukar.

:::flow Menentukan alignment
Tentukan arah | `flex-direction: row` atau `column`
Atur sumbu utama | Gunakan `justify-content`
Atur sumbu silang | Gunakan `align-items`
Atur baris tambahan | Gunakan `align-content` jika `flex-wrap: wrap`
:::

### Nilai justify-content

| Nilai | Efek |
| --- | --- |
| `flex-start` | Item menumpuk di awal |
| `center` | Item di tengah |
| `flex-end` | Item menumpuk di akhir |
| `space-between` | Ruang merata di antara item |
| `space-around` | Ruang merata di sekitar item |
| `space-evenly` | Jarak antar item dan tepi sama |

:::preview Pusatkan konten
<div class="hero">
  <div class="box">Konten di tengah</div>
</div>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; }
.hero {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px;
  border-radius: 16px;
  background: linear-gradient(135deg, #fff7ed, #eff6ff);
  border: 1px solid #fed7aa;
}
.box {
  padding: 16px 20px;
  border-radius: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  font-weight: 700;
  color: #9a3412;
}
:::

:::note place-items untuk Grid
Pada Grid, `place-items: center` adalah singkatan dari `align-items` dan `justify-items`. Pada Flexbox, gunakan `align-items` dan `justify-content`.
:::

:::tip margin: auto
Pada flex item, `margin-left: auto` bisa mendorong item ke kanan. Ini berguna untuk memisahkan logo dan menu dalam navigasi.
:::
$content$,
   'material', 4, true),

  ('b0000000-0000-4000-8000-000000000035', 'a0000000-0000-4000-8000-000000000004',
   'Grid Template Areas',
   $content$## Grid Template Areas

`grid-template-areas` memungkinkan kamu menggambar layout dengan nama area. Hasilnya mudah dibaca dan diubah.

```css
.layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  gap: 12px;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

:::preview Layout dengan named areas
<div class="layout">
  <header class="header">Header</header>
  <aside class="sidebar">Sidebar</aside>
  <main class="main">Konten utama</main>
  <footer class="footer">Footer</footer>
</div>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; background: #f8fafc; }
.layout {
  display: grid;
  grid-template-columns: 100px 1fr;
  grid-template-rows: auto 120px auto;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  gap: 8px;
}
.layout > * { padding: 12px; border-radius: 10px; font-weight: 700; }
.header { grid-area: header; background: #ffedd5; color: #9a3412; }
.sidebar { grid-area: sidebar; background: #dbeafe; color: #1e3a8a; }
.main { grid-area: main; background: white; border: 1px solid #e2e8f0; color: #334155; }
.footer { grid-area: footer; background: #dcfce7; color: #166534; }
:::

:::note Setiap baris harus punya jumlah kolom sama
Jika `grid-template-columns` memiliki dua kolom, setiap baris pada `grid-template-areas` juga harus berisi dua nama area.
:::

:::tip Gunakan titik untuk area kosong
Titik (`.`) menandakan sel kosong:

```css
grid-template-areas:
  "header header"
  "sidebar ."
  "footer footer";
```
:::

:::key Poin kunci
Named areas membuat layout halaman mudah dibaca. Untuk komponen kecil, Flexbox atau Grid tanpa named areas biasanya lebih sederhana.
:::
$content$,
   'material', 5, true),

  ('b0000000-0000-4000-8000-000000000038', 'a0000000-0000-4000-8000-000000000004',
   'Pola Layout Responsif',
   $content$## Pola Layout Responsif

Sekarang saatnya menggabungkan Flexbox, Grid, dan media query menjadi pola yang bisa dipakai berulang.

### Galeri otomatis

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
```

Dengan satu aturan ini, jumlah kolom menyesuaikan lebar container tanpa media query tambahan.

:::preview Galeri responsif otomatis
<div class="cards">
  <article><h3>HTML</h3><p>Struktur halaman.</p></article>
  <article><h3>CSS</h3><p>Tampilan dan layout.</p></article>
  <article><h3>JavaScript</h3><p>Interaksi dan logika.</p></article>
  <article><h3>Responsif</h3><p>Nyaman di semua layar.</p></article>
</div>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; background: #f8fafc; }
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}
article { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
h3 { margin: 0 0 4px; color: #9a3412; font-size: 15px; }
p { margin: 0; color: #64748b; font-size: 13px; }
:::

### Pola sidebar

```css
.page {
  display: grid;
  gap: 16px;
}

@media (min-width: 900px) {
  .page {
    grid-template-columns: 240px 1fr;
  }
}
```

:::flow Langkah membuat layout responsif
Mulai satu kolom | Pastikan konten terbaca di layar kecil
Tambahkan Grid | Atur kolom saat ruang cukup
Uji breakpoint | Periksa 320px, 768px, dan 1280px
Rapikan spacing | Gunakan gap dan padding yang konsisten
:::

:::warning Hindari layout yang meluber
Gunakan `minmax(0, 1fr)` jika konten panjang membuat kolom melebar. Periksa juga gambar dengan `max-width: 100%`.
:::

:::key Poin kunci
Pola responsif yang baik tidak bergantung pada banyak breakpoint. Mulailah dari satu kolom, lalu tambahkan kolom saat konten memang membutuhkan ruang.
:::
$content$,
   'material', 6, true)
on conflict (id) do update
set module_id = excluded.module_id,
    title = excluded.title,
    content = excluded.content,
    kind = excluded.kind,
    order_index = excluded.order_index,
    is_published = excluded.is_published;
