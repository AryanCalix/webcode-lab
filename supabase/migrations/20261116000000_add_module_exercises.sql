-- WebCode Lab — tambahan latihan (code editor) untuk modul yang belum memiliki latihan

insert into public.exercises (id, lesson_id, title, instructions, starter_html, starter_css, starter_js, hint, validator_config, order_index, is_published)
values (
  'c0000000-0000-4000-8000-000000000004',
  'b0000000-0000-4000-8000-000000000031',
  'Latihan: Tata Letak Kartu dengan Flexbox',
  'Buatlah dua kartu yang disusun dengan tata letak baris menggunakan Flexbox pada container.',
  '<div class="container">\n  <div class="card">Kartu 1</div>\n  <div class="card">Kartu 2</div>\n</div>',
  '.container {\n  display: block;\n}',
  '',
  'Gunakan `display: flex` pada container untuk menata kartu secara horizontal.',
  '{"checks":[{"type":"css_property","selector":".container","property":"display","equals":["flex"]}],"success_message":"Kartu disusun dengan Flexbox!"}'::jsonb,
  2,
  true
)
on conflict (lesson_id) do nothing;

insert into public.exercises (id, lesson_id, title, instructions, starter_html, starter_css, starter_js, hint, validator_config, order_index, is_published)
values (
  'c0000000-0000-4000-8000-000000000005',
  'b0000000-0000-4000-8000-000000000036',
  'Latihan: Interaksi dengan Tombol',
  'Tambahkan event listener pada tombol untuk mengubah teks heading.',
  '<h1>Halo Web</h1>\n<button id="cta">Klik saya</button>',
  '',
  'const button = document.querySelector("#cta");\nconst title = document.querySelector("h1");\nbutton.addEventListener("click", () => {\n  title.textContent = "Halo dari JavaScript!";\n});',
  'Gunakan `addEventListener` untuk menangani klik pada tombol.',
  '{"checks":[{"type":"html_selector","selector":"button"}]}'::jsonb,
  1,
  true
)
on conflict (lesson_id) do nothing;
