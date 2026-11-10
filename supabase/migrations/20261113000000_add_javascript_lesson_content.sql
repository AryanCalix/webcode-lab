-- WebCode Lab — tambahan materi JavaScript untuk modul belajar
-- Menambahkan materi bahasa JavaScript dan interaksi JavaScript ke modul Pengantar Web.

insert into public.lessons (id, module_id, title, content, kind, order_index, is_published)
values (
  'b0000000-0000-4000-8000-000000000004',
  'a0000000-0000-4000-8000-000000000001',
  'Bahasa JavaScript',
  $content$## Bahasa JavaScript

JavaScript adalah bahasa pemrograman yang menjalankan di browser. JavaScript tidak menggantikan HTML dan CSS — ketiganya bekerja sama: HTML menyusun struktur, CSS menyatakan tampilan, dan JavaScript menyatakan perilaku.

### Konsep dasar JavaScript

- **Variabel**: menyimpan nilai (`let`, `const`).
- **Fungsi**: blok kode yang bisa dipanggil (`function` atau arrow function).
- **Event**: aksi dari user/browser (`click`, `submit`, `DOMContentLoaded`).

```js
const greeting = 'Halo Web';
function showGreeting(name) {
  console.log(`${greeting}, ${name}!`);
}
document.addEventListener('DOMContentLoaded', () => showGreeting('Budi'));
```

### Dari HTML ke JavaScript

JavaScript merendu DOM (Document Object Model) yang dibuat HTML. Dengan `querySelector` atau `getElementById`, Anda bisa mengubah teks, warna, atau menampilkan elemen baru.

### Latihan berikutnya

Selesaikan latihan JavaScript untuk mengubah halaman Anda melalui kode.
$content$,
  'material', 4, true
)
on conflict (id) do update
set title = excluded.title,
    content = excluded.content,
    kind = excluded.kind,
    order_index = excluded.order_index,
    is_published = excluded.is_published;

insert into public.lessons (id, module_id, title, content, kind, order_index, is_published)
values (
  'b0000000-0000-4000-8000-000000000005',
  'a0000000-0000-4000-8000-000000000001',
  'Mengaktifkan Interaksi dengan JavaScript',
  $content$## Mengaktifkan Interaksi dengan JavaScript

JavaScript membuat halaman web menjadi *living*. Contoh interaksi:

- Tombol yang berubah teks saat diklik.
- Form yang validasi tanpa reload halaman.
- Animasi atau toggle tampil/sembunyi.

```js
const button = document.querySelector('#cta');
const title = document.querySelector('h1');

button.addEventListener('click', () => {
  title.textContent = 'Halo dari JavaScript!';
});
```

### Pola kerja untuk belajar JavaScript

1. Pikirkan perilaku yang diinginkan.
2. Tentukan elemen HTML yang akan disentuh (dari HTML/CSS).
3. Tulis logika JavaScript-nya.
4. Uji di live preview.

### Latihan berikutnya

Hubungkan materi JavaScript dengan latihan HTML/CSS yang sudah Anda pelajari.
$content$,
  'material', 5, true
)
on conflict (id) do update
set title = excluded.title,
    content = excluded.content,
    kind = excluded.kind,
    order_index = excluded.order_index,
    is_published = excluded.is_published;
