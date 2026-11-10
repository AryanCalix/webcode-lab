-- WebCode Lab — tambahan modul JavaScript Dasar
-- Menambahkan modul dan materi JavaScript agar kategori materi lengkap di tab modul belajar.

insert into public.modules (id, title, description, order_index, is_published)
values (
  'a0000000-0000-4000-8000-000000000005',
  'JavaScript Dasar',
  'Bahasa JavaScript untuk membuat halaman web lebih interaktif: variabel, fungsi, event, dan manipulasi DOM.',
  5,
  true
)
on conflict (id) do update
set title = excluded.title,
    description = excluded.description,
    order_index = excluded.order_index,
    is_published = excluded.is_published;

insert into public.lessons (id, module_id, title, content, kind, order_index, is_published)
values (
  'b0000000-0000-4000-8000-000000000036',
  'a0000000-0000-4000-8000-000000000005',
  'Dasar JavaScript',
  $content$## Dasar JavaScript

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

### Latihan berikutnya

Selesaikan latihan JavaScript untuk mengubah halaman Anda melalui kode.
$content$,
  'material', 1, true
)
on conflict (id) do update
set title = excluded.title,
    content = excluded.content,
    kind = excluded.kind,
    order_index = excluded.order_index,
    is_published = excluded.is_published;

insert into public.lessons (id, module_id, title, content, kind, order_index, is_published)
values (
  'b0000000-0000-4000-8000-000000000037',
  'a0000000-0000-4000-8000-000000000005',
  'Interaksi dengan DOM',
  $content$## Interaksi dengan DOM

JavaScript merendu DOM (Document Object Model) yang dibuat HTML. Dengan `querySelector` atau `getElementById`, Anda bisa mengubah teks, warna, atau menampilkan elemen baru.

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
  'material', 2, true
)
on conflict (id) do update
set title = excluded.title,
    content = excluded.content,
    kind = excluded.kind,
    order_index = excluded.order_index,
    is_published = excluded.is_published;
