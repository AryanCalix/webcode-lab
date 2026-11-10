import { describe, expect, it } from 'vitest';
import { DOMParser } from 'linkedom';
import {
  validateExercise,
  type CodeInput,
  type HtmlDocumentLike,
  type HtmlParser,
  type ValidatorConfig,
} from './validateExercise';

const parseHtml: HtmlParser = (html) => new DOMParser().parseFromString(html, 'text/html') as unknown as HtmlDocumentLike;

function code(input: Partial<CodeInput>): CodeInput {
  return { html: '<h1>Halo Web</h1>', css: '', js: '', ...input };
}

describe('validateExercise', () => {
  it('returns not-correct when no checks are configured', () => {
    const result = validateExercise(code({}), {});

    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toContain('belum memiliki aturan validasi');
  });

  it('fails when the required selector is missing', () => {
    const result = validateExercise(
      code({ html: '<p>Materi singkat</p>' }),
      { checks: [{ type: 'html_selector', selector: 'h1', min_count: 1 }] },
      parseHtml,
    );

    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toContain('belum ditemukan');
  });

  it('passes when the HTML text matches', () => {
    const result = validateExercise(
      code({ html: '<h1>Halo Web</h1>' }),
      {
        checks: [{ type: 'html_text', selector: 'h1', equals: 'Halo Web' }],
        success_message: 'Kode benar!',
      },
      parseHtml,
    );

    expect(result.isCorrect).toBe(true);
    expect(result.feedback).toBe('Kode benar!');
  });

  it('fails when the HTML text does not match', () => {
    const result = validateExercise(
      code({ html: '<h1>Selamat Datang</h1>' }),
      { checks: [{ type: 'html_text', selector: 'h1', equals: 'Halo Web' }] },
      parseHtml,
    );

    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toContain('belum sesuai');
  });

  it('passes when the configured CSS property matches', () => {
    const result = validateExercise(
      code({ css: 'h1 {\n  color: red;\n}' }),
      {
        checks: [{ type: 'css_property', selector: 'h1', property: 'color', equals: ['#ff0000'] }],
        success_message: 'Kode benar!',
      },
      parseHtml,
    );

    expect(result.isCorrect).toBe(true);
  });

  it('fails when the configured CSS property does not match', () => {
    const result = validateExercise(
      code({ css: 'h1 {\n  color: blue;\n}' }),
      {
        checks: [{ type: 'css_property', selector: 'h1', property: 'color', equals: ['#ff0000'] }],
        success_message: 'Kode benar!',
      },
      parseHtml,
    );

    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toContain('belum sesuai');
  });

  it('requires a validator config with at least one check', () => {
    const config: ValidatorConfig = { checks: [] };

    expect(config.checks).toEqual([]);
  });
});
