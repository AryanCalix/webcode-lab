import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Markdown } from './Markdown';

describe('Markdown visual blocks', () => {
  it('renders flow steps', () => {
    const html = renderToStaticMarkup(
      <Markdown>{`## Alur

:::flow Perjalanan
Browser | Mengirim request
Server | Mengirim response
:::`}</Markdown>,
    );

    expect(html).toContain('Perjalanan');
    expect(html).toContain('Mengirim request');
    expect(html).toContain('Mengirim response');
  });

  it('renders callouts and previews', () => {
    const html = renderToStaticMarkup(
      <Markdown>{`:::key Poin kunci
Belajar setiap hari.
:::

:::preview Contoh tombol
<button>Klik</button>
---css---
button { color: red; }
:::`}</Markdown>,
    );

    expect(html).toContain('Poin kunci');
    expect(html).toContain('<iframe');
    expect(html).toContain('button { color: red; }');
  });
});
