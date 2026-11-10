-- WebCode Lab — perpanjangan materi untuk modul Pengantar Web
-- Menambahkan materi HTTP/Respons dan DevTools/Debugging ke modul 1.

insert into public.lessons (id, module_id, title, content, kind, order_index, is_published)
values (
  'b0000000-0000-4000-8000-000000000006',
  'a0000000-0000-4000-8000-000000000001',
  'HTTP dan Respons',
  $content$## HTTP dan Respons

Setiap kali browser meminta halaman, terjadi exchange HTTP antara browser dan server.

### Request

- **Method**: `GET`, `POST`, `PUT`, `DELETE`.
- **URL**: alamat resource yang diminta.
- **Headers**: informasi tambahan (content type, auth, dll).

### Response

- **Status code**: `200` sukses, `404` tidak ditemukan, `500` server error.
- **Body**: respons berupa HTML, JSON, atau file.

### Latihan berikutnya

Buka latihan untuk memahami cara browser menampilkan halaman pertama Anda.
$content$,
  'material', 6, true
)
on conflict (id) do update
set title = excluded.title,
    content = excluded.content,
    kind = excluded.kind,
    order_index = excluded.order_index,
    is_published = excluded.is_published;

insert into public.lessons (id, module_id, title, content, kind, order_index, is_published)
values (
  'b0000000-0000-4000-8000-000000000007',
  'a0000000-0000-4000-8000-000000000001',
  'DevTools dan Debugging',
  $content$## DevTools dan Debugging

Browser modern menyediakan **DevTools** untuk inspeksi dan debugging.

### Yang bisa dilakukan DevTools

- **Console**: melihat log dan error JavaScript.
- **Network**: memeriksa request/response, timing, status code.
- **Elements**: memilih dan mengubah DOM/CSS secara langsung.
- **Sources**: men-debug kode JavaScript.

### Latihan berikutnya

Selesaikan latihan debugging dengan DevTools untuk memperbaiki kode Anda.
$content$,
  'material', 7, true
)
on conflict (id) do update
set title = excluded.title,
    content = excluded.content,
    kind = excluded.kind,
    order_index = excluded.order_index,
    is_published = excluded.is_published;
