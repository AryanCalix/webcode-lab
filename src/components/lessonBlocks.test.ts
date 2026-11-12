import { describe, expect, it } from 'vitest';
import { parseLessonBlocks, parsePreviewBody, parseVisualRows } from './lessonBlocks';

describe('parseLessonBlocks', () => {
  it('keeps markdown and extracts visual blocks', () => {
    const blocks = parseLessonBlocks(`## Judul

Teks pembuka.

:::flow Alur
Browser | Mengirim request
Server | Mengirim response
:::

Penutup.`);

    expect(blocks).toEqual([
      { type: 'markdown', content: '## Judul\n\nTeks pembuka.' },
      {
        type: 'visual',
        name: 'flow',
        title: 'Alur',
        body: 'Browser | Mengirim request\nServer | Mengirim response',
      },
      { type: 'markdown', content: 'Penutup.' },
    ]);
  });

  it('ignores block markers inside fenced code', () => {
    const blocks = parseLessonBlocks(`Contoh sintaks:

\`\`\`md
:::note
Ini hanya contoh.
:::
\`\`\`

Selesai.`);

    expect(blocks).toHaveLength(1);
    const block = blocks[0];
    expect(block?.type).toBe('markdown');
    if (block?.type === 'markdown') expect(block.content).toContain(':::note');
  });

  it('treats an unclosed block as normal markdown', () => {
    const blocks = parseLessonBlocks(':::note Judul\nBelum ditutup');

    expect(blocks).toHaveLength(1);
    const block = blocks[0];
    expect(block?.type).toBe('markdown');
    if (block?.type === 'markdown') expect(block.content).toContain(':::note Judul');
  });
});

describe('parseVisualRows', () => {
  it('splits label, detail, and example', () => {
    expect(parseVisualRows('HTML | Struktur | <h1>\n\nCSS | Tampilan')).toEqual([
      { label: 'HTML', detail: 'Struktur', example: '<h1>' },
      { label: 'CSS', detail: 'Tampilan', example: '' },
    ]);
  });
});

describe('parsePreviewBody', () => {
  it('splits html, css, and js sections', () => {
    expect(
      parsePreviewBody(`<h1>Halo</h1>
---css---
h1 { color: blue; }
---js---
console.log('halo');`),
    ).toEqual({
      html: '<h1>Halo</h1>',
      css: 'h1 { color: blue; }',
      js: "console.log('halo');",
    });
  });
});
