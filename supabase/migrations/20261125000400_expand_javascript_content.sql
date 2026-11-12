-- WebCode Lab — richer learning material for "JavaScript Dasar"
-- Adds variables/types, conditions/loops, functions/scope, arrays/objects,
-- events/forms, and a debugging + mini-project lesson.

update public.modules
set description = 'Menulis logika di browser dengan JavaScript: variabel, kondisi, perulangan, fungsi, array, object, event, form, dan debugging.'
where id = 'a0000000-0000-4000-8000-000000000005';

insert into public.lessons (id, module_id, title, content, kind, order_index, is_published)
values
  ('b0000000-0000-4000-8000-000000000036', 'a0000000-0000-4000-8000-000000000005',
   'Dasar JavaScript',
   $content$## Dasar JavaScript

JavaScript adalah bahasa pemrograman yang berjalan di browser. JavaScript tidak menggantikan HTML dan CSS — ketiganya bekerja sama: HTML menyusun struktur, CSS menyatakan tampilan, dan JavaScript menyatakan perilaku.

:::compare Blok dasar JavaScript
Variabel | Menyimpan nilai | `const nama = 'Budi'`
Fungsi | Menjalankan blok kode | `function sapa() {}`
Kondisi | Memilih jalur | `if (nilai > 75) {}`
Event | Merespons aksi | `addEventListener('click', ...)`
:::

```js
const greeting = 'Halo Web';

function showGreeting(name) {
  console.log(`${greeting}, ${name}!`);
}

document.addEventListener('DOMContentLoaded', () => showGreeting('Budi'));
```

### Membaca kode di atas

1. `const greeting` menyimpan teks.
2. `showGreeting` adalah fungsi dengan parameter `name`.
3. `DOMContentLoaded` memastikan kode berjalan setelah HTML siap.
4. `${name}` adalah template literal untuk menyisipkan nilai.

:::preview JavaScript pertama
<h1 id="judul">Halo Web</h1>
<button id="sapa" type="button">Sapa saya</button>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; }
h1 { color: #0f172a; }
button { border: 0; border-radius: 10px; background: #facc15; color: #422006; padding: 9px 14px; font-weight: 800; cursor: pointer; }
:::

:::note Di mana JavaScript berjalan?
Kode JavaScript dijalankan oleh mesin JavaScript di browser. Kode yang sama juga bisa berjalan di server dengan Node.js, tetapi akses ke DOM hanya ada di browser.
:::

:::key Poin kunci
Mulailah dari variabel dan fungsi sederhana. Setelah nyaman, hubungkan JavaScript dengan elemen HTML melalui DOM.
:::
$content$,
   'material', 1, true),

  ('b0000000-0000-4000-8000-000000000037', 'a0000000-0000-4000-8000-000000000005',
   'Interaksi dengan DOM',
   $content$## Interaksi dengan DOM

DOM (Document Object Model) adalah representasi halaman HTML yang bisa dibaca dan diubah JavaScript. Setiap elemen menjadi objek yang bisa dicari, diubah, atau dihapus.

```js
const tombol = document.querySelector('#cta');
const judul = document.querySelector('h1');

tombol.addEventListener('click', () => {
  judul.textContent = 'Halo dari JavaScript!';
});
```

:::flow Cara JavaScript mengubah halaman
Pilih elemen | `querySelector('#cta')`
Simpan referensi | Simpan hasilnya dalam variabel
Pasang event | `addEventListener('click', callback)`
Ubah DOM | `textContent`, `classList`, atau `append`
:::

### Operasi DOM yang sering dipakai

| Operasi | Contoh | Kegunaan |
| --- | --- | --- |
| Mengubah teks | `el.textContent = 'Halo'` | Konten aman berupa teks |
| Mengubah class | `el.classList.toggle('aktif')` | Mengubah gaya |
| Membaca input | `input.value` | Mengambil data form |
| Membuat elemen | `document.createElement('li')` | Menambah item dinamis |
| Menghapus elemen | `el.remove()` | Membersihkan tampilan |

:::preview Penghitung klik
<p>Kamu sudah mengklik <strong id="jumlah">0</strong> kali.</p>
<button id="klik" type="button">Klik saya</button>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; }
p { font-size: 18px; color: #334155; }
#jumlah { color: #ea580c; font-size: 24px; }
button { border: 0; border-radius: 10px; background: #ea580c; color: white; padding: 10px 16px; font-weight: 700; cursor: pointer; }
button:hover { background: #c2410c; }
---js---
let jumlah = 0;
const tombol = document.querySelector('#klik');
const output = document.querySelector('#jumlah');

tombol.addEventListener('click', () => {
  jumlah = jumlah + 1;
  output.textContent = jumlah;
});
:::

:::warning Hati-hati innerHTML
`innerHTML` menafsirkan teks sebagai HTML. Jika isinya berasal dari pengguna, gunakan `textContent` untuk mencegah penyisipan skrip berbahaya.
:::

:::tip Periksa null
`querySelector` mengembalikan `null` jika elemen tidak ditemukan. Pastikan id/class sudah benar sebelum memanggil properti pada hasilnya.
:::
$content$,
   'material', 2, true),

  ('b0000000-0000-4000-8000-000000000039', 'a0000000-0000-4000-8000-000000000005',
   'Variabel, Tipe Data, dan Operator',
   $content$## Variabel, Tipe Data, dan Operator

Variabel adalah tempat menyimpan nilai. Di JavaScript modern, gunakan `const` untuk nilai yang tidak diganti dan `let` untuk nilai yang berubah.

```js
const nama = 'Budi';
let skor = 0;

skor = skor + 10;
console.log(`${nama} memiliki ${skor} poin.`);
```

:::compare Tipe data dasar
String | Teks | `'Halo'`, `"Web"`, `` `Halo ${nama}` ``
Number | Angka | `42`, `3.14`
Boolean | Benar/salah | `true`, `false`
Null | Sengaja kosong | `null`
Undefined | Belum diberi nilai | `let x;`
Object | Kumpulan data | `{ nama: 'Budi' }`
Array | Daftar nilai | `[1, 2, 3]`
:::

### Operator yang sering dipakai

| Operator | Contoh | Hasil |
| --- | --- | --- |
| `+` | `2 + 3` | `5` |
| `-`, `*`, `/` | `10 / 2` | `5` |
| `%` | `10 % 3` | `1` (sisa bagi) |
| `===` | `5 === '5'` | `false` (tipe berbeda) |
| `&&`, `||`, `!` | `true && false` | `false` |

:::warning === vs ==
Gunakan `===` (strict equality) agar tipe data ikut dibandingkan. `==` melakukan konversi tipe dan sering menghasilkan perilaku tak terduga.
:::

:::preview Menghitung total poin
<p id="hasil">Klik tombol untuk menghitung.</p>
<button id="hitung" type="button">Hitung poin</button>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; }
p { font-size: 17px; color: #334155; }
button { border: 0; border-radius: 10px; background: #ea580c; color: white; padding: 9px 14px; font-weight: 700; cursor: pointer; }
:::

:::note const bukan berarti beku total
`const` mencegah variabel diarahkan ulang, tetapi isi object atau array masih bisa diubah:

```js
const nilai = [80, 90];
nilai.push(100); // boleh
// nilai = [];    // error
```
:::

:::key Poin kunci
Pilih `const` sebagai default, gunakan `let` hanya saat nilai perlu berubah, dan hindari `var` pada kode baru.
:::
$content$,
   'material', 3, true),

  ('b0000000-0000-4000-8000-000000000040', 'a0000000-0000-4000-8000-000000000005',
   'Kondisi dan Perulangan',
   $content$## Kondisi dan Perulangan

Kondisi membuat program mengambil keputusan. Perulangan membuat program mengulang pekerjaan tanpa menulis kode berulang.

### Kondisi

```js
const nilai = 82;

if (nilai >= 85) {
  console.log('Sangat baik');
} else if (nilai >= 70) {
  console.log('Baik');
} else {
  console.log('Perlu belajar lagi');
}
```

Gunakan `switch` jika membandingkan satu nilai dengan banyak kemungkinan yang pasti.

```js
switch (peran) {
  case 'student':
    console.log('Dashboard mahasiswa');
    break;
  case 'lecturer':
    console.log('Dashboard dosen');
    break;
  default:
    console.log('Peran tidak dikenal');
}
```

### Perulangan

```js
for (let i = 1; i <= 3; i++) {
  console.log(`Pelajaran ${i}`);
}

const materi = ['HTML', 'CSS', 'JavaScript'];

for (const item of materi) {
  console.log(item);
}
```

:::compare Kapan memakai apa?
if / else | Dua atau beberapa jalur | Validasi nilai
switch | Banyak nilai pasti | Menu atau status
for | Jumlah iterasi diketahui | Menghitung 1–10
for...of | Mengulang isi array | Menampilkan daftar materi
while | Mengulang selama kondisi benar | Menunggu proses selesai
:::

:::preview Daftar materi dengan loop
<h2>Materi</h2>
<ul id="daftar"></ul>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; }
h2 { color: #9a3412; }
li { margin-bottom: 6px; color: #334155; }
---js---
const materi = ['HTML Dasar', 'CSS Dasar', 'JavaScript'];
const daftar = document.querySelector('#daftar');

for (const item of materi) {
  const li = document.createElement('li');
  li.textContent = item;
  daftar.append(li);
}
:::

:::tip Hindari loop tak berujung
Pastikan kondisi `while` bisa menjadi `false`. Jika tidak, browser bisa macet dan halaman berhenti merespons.
:::

:::warning Jangan mengubah array saat mengulang
Menambah atau menghapus item dari array yang sedang di-loop bisa membuat hasil membingungkan. Salin array terlebih dahulu jika perlu.
:::
$content$,
   'material', 4, true),

  ('b0000000-0000-4000-8000-000000000041', 'a0000000-0000-4000-8000-000000000005',
   'Fungsi dan Scope',
   $content$## Fungsi dan Scope

Fungsi adalah blok kode yang bisa dipanggil berulang. Fungsi membantu memecah masalah besar menjadi bagian kecil yang mudah diuji.

```js
function hitungLuas(panjang, lebar) {
  return panjang * lebar;
}

const luas = hitungLuas(4, 5);
console.log(luas); // 20
```

### Arrow function

```js
const hitungLuas = (panjang, lebar) => panjang * lebar;
```

Arrow function lebih ringkas. Jika hanya satu ekspresi, `return` bisa dihilangkan.

:::flow Dari input ke output
Parameter | Fungsi menerima nilai masukan
Proses | Kode di dalam fungsi dijalankan
Return | Fungsi mengembalikan hasil
Pemanggilan | Hasil disimpan atau ditampilkan
:::

### Scope

- Variabel di dalam fungsi hanya bisa diakses di dalam fungsi itu.
- Variabel di luar fungsi bisa diakses di dalam fungsi.
- Hindari variabel global yang tidak perlu karena mudah bentrok.

```js
const pajak = 0.11;

function totalBayar(harga) {
  return harga + harga * pajak;
}
```

:::preview Kalkulator sederhana
<label for="angka">Angka</label>
<input id="angka" type="number" value="4" />
<button id="kuadrat" type="button">Kuadratkan</button>
<p id="hasil" role="status"></p>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; }
label { font-weight: 700; font-size: 14px; }
input { width: 90px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 7px 9px; }
button { border: 0; border-radius: 8px; background: #ea580c; color: white; padding: 8px 12px; font-weight: 700; cursor: pointer; }
#hasil { font-weight: 700; color: #047857; }
---js---
function kuadrat(angka) {
  return angka * angka;
}

document.querySelector('#kuadrat').addEventListener('click', () => {
  const nilai = Number(document.querySelector('#angka').value);
  document.querySelector('#hasil').textContent = `Hasil: ${kuadrat(nilai)}`;
});
:::

:::note Fungsi murni
Fungsi murni hanya bergantung pada parameter dan tidak mengubah nilai di luar dirinya. Fungsi seperti ini lebih mudah diuji dan diprediksi.
:::

:::tip Beri nama yang jelas
Nama seperti `hitungTotal`, `formatTanggal`, atau `validasiEmail` jauh lebih mudah dipahami daripada `proses` atau `data2`.
:::
$content$,
   'material', 5, true),

  ('b0000000-0000-4000-8000-000000000042', 'a0000000-0000-4000-8000-000000000005',
   'Array dan Object',
   $content$## Array dan Object

Array menyimpan daftar nilai berurutan. Object menyimpan data dengan nama properti. Keduanya sering digabungkan untuk merepresentasikan data nyata.

```js
const materi = ['HTML', 'CSS', 'JavaScript'];

const mahasiswa = {
  nama: 'Budi',
  level: 2,
  xp: 340,
};
```

### Method array yang penting

| Method | Kegunaan | Contoh |
| --- | --- | --- |
| `map` | Mengubah setiap item | `materi.map((m) => m.toUpperCase())` |
| `filter` | Menyaring item | `nilai.filter((n) => n >= 75)` |
| `find` | Mencari satu item | `siswa.find((s) => s.id === 1)` |
| `includes` | Memeriksa keberadaan | `materi.includes('CSS')` |
| `join` | Menggabungkan menjadi teks | `materi.join(', ')` |

### Mengakses object

```js
const { nama, xp } = mahasiswa;
console.log(`${nama} memiliki ${xp} XP`);

mahasiswa.level = 3;
```

:::compare Array vs Object
Array | Urutan nilai | `['HTML', 'CSS']`
Object | Data berlabel | `{ nama: 'Budi', xp: 340 }`
Array of objects | Daftar data terstruktur | `[{ nama: 'Budi' }]`
:::

:::preview Menampilkan daftar mahasiswa
<h2>Peringkat</h2>
<ol id="daftar"></ol>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; }
h2 { color: #9a3412; }
li { margin-bottom: 6px; }
strong { color: #0f172a; }
span { color: #64748b; }
---js---
const siswa = [
  { nama: 'Budi', xp: 340 },
  { nama: 'Sari', xp: 410 },
  { nama: 'Rina', xp: 280 },
];

const daftar = document.querySelector('#daftar');

siswa
  .sort((a, b) => b.xp - a.xp)
  .forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.nama}</strong> <span>${item.xp} XP</span>`;
    daftar.append(li);
  });
:::

:::warning innerHTML pada data pengguna
Contoh di atas memakai data statis. Untuk data dari pengguna, buat elemen dan gunakan `textContent` agar aman.
:::

:::key Poin kunci
Gunakan array untuk urutan dan object untuk label. Kombinasi array of objects adalah bentuk data paling umum di aplikasi web.
:::
$content$,
   'material', 6, true),

  ('b0000000-0000-4000-8000-000000000043', 'a0000000-0000-4000-8000-000000000005',
   'Event, Form, dan Validasi',
   $content$## Event, Form, dan Validasi

Event adalah sinyal bahwa sesuatu terjadi: klik, ketikan, submit, atau perubahan ukuran layar. JavaScript dapat merespons event untuk menjalankan fungsi.

```js
const form = document.querySelector('#form');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  // proses data form
});
```

`event.preventDefault()` mencegah browser memuat ulang halaman saat form dikirim.

:::flow Alur validasi form
Input | Pengguna mengetik data
Event | `input` atau `submit` terpicu
Validasi | Periksa panjang, format, dan field wajib
Umpan balik | Tampilkan pesan error atau sukses
Kirim | Kirim data ke server jika valid
:::

### Validasi sederhana

```js
const email = document.querySelector('#email');
const pesan = document.querySelector('#pesan');

email.addEventListener('input', () => {
  const valid = email.value.includes('@');
  pesan.textContent = valid ? 'Format terlihat benar' : 'Email harus mengandung @';
});
```

:::preview Validasi email
<form id="form" novalidate>
  <label for="email">Email</label>
  <input id="email" type="text" placeholder="nama@email.com" />
  <p id="pesan" role="status"></p>
  <button type="submit">Kirim</button>
</form>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; }
form { display: grid; gap: 8px; max-width: 300px; }
label { font-weight: 700; font-size: 14px; }
input { border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 10px; }
button { border: 0; border-radius: 8px; background: #ea580c; color: white; padding: 9px 14px; font-weight: 700; cursor: pointer; }
#pesan { min-height: 20px; font-size: 13px; font-weight: 700; color: #b45309; }
---js---
const form = document.querySelector('#form');
const email = document.querySelector('#email');
const pesan = document.querySelector('#pesan');

email.addEventListener('input', () => {
  const valid = email.value.includes('@');
  pesan.textContent = valid ? 'Format terlihat benar' : 'Email harus mengandung @';
  pesan.style.color = valid ? '#047857' : '#b45309';
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  pesan.textContent = email.value.includes('@')
    ? 'Siap dikirim!'
    : 'Perbaiki email terlebih dahulu.';
});
:::

:::warning Validasi di server tetap wajib
Validasi di browser hanya membantu pengguna. Data tetap harus diperiksa ulang di server karena JavaScript di browser bisa dimanipulasi.
:::

:::note Event delegation
Jika daftar item bertambah secara dinamis, pasang listener pada container lalu periksa `event.target`. Ini lebih efisien daripada memasang listener pada setiap item.
:::
$content$,
   'material', 7, true),

  ('b0000000-0000-4000-8000-000000000044', 'a0000000-0000-4000-8000-000000000005',
   'Debugging dan Proyek Mini',
   $content$## Debugging dan Proyek Mini

Sekarang saatnya menggabungkan semua yang sudah dipelajari. Sebelum membuat proyek, biasakan membaca error dengan tenang.

### Tiga cara debugging

:::compare Alat debugging JavaScript
console.log | Menampilkan nilai di Console | Cek isi variabel
Breakpoint | Menghentikan kode di baris tertentu | Telusuri alur langkah demi langkah
try / catch | Menangkap error | Tampilkan pesan ramah saat gagal
:::

```js
try {
  const data = JSON.parse('{"nama":"Budi"}');
  console.log(data.nama);
} catch (error) {
  console.error('Data tidak valid:', error.message);
}
```

### Mini proyek: daftar tugas

Proyek kecil ini menggabungkan array, object, DOM, event, dan fungsi.

:::preview Daftar tugas sederhana
<h2>Daftar Tugas</h2>
<form id="form">
  <input id="tugas" placeholder="Tugas baru" required />
  <button type="submit">Tambah</button>
</form>
<ul id="daftar"></ul>
---css---
body { font-family: system-ui, sans-serif; padding: 18px; }
h2 { margin: 0 0 10px; color: #9a3412; }
form { display: flex; gap: 8px; margin-bottom: 12px; }
input { flex: 1; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 10px; }
button { border: 0; border-radius: 8px; background: #ea580c; color: white; padding: 8px 12px; font-weight: 700; cursor: pointer; }
li { margin-bottom: 6px; padding: 8px 10px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; }
---js---
const daftar = [];
const form = document.querySelector('#form');
const input = document.querySelector('#tugas');
const output = document.querySelector('#daftar');

function render() {
  output.innerHTML = '';
  daftar.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    output.append(li);
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const nilai = input.value.trim();
  if (!nilai) return;
  daftar.push(nilai);
  input.value = '';
  render();
});
:::

:::flow Alur proyek mini
Rencanakan | Tentukan fitur dan data yang dibutuhkan
Bangun struktur | HTML dan CSS dasar
Tambahkan logika | Array, fungsi, dan event
Uji dan perbaiki | Klik, isi form, dan cek edge case
:::

:::tip Baca error dengan tenang
Perhatikan nama error, file, dan nomor baris. Coba reproduksi dengan langkah paling kecil, lalu periksa satu variabel pada satu waktu.
:::

:::key Poin kunci
Proyek kecil adalah cara terbaik menguji pemahaman. Selesaikan satu fitur, uji, lalu lanjut ke fitur berikutnya.
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
