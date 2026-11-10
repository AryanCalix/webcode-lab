export interface HtmlTextCheck {
  type: 'html_text';
  selector: string;
  equals?: string;
  min_length?: number;
  message?: string;
}

export interface HtmlSelectorCheck {
  type: 'html_selector';
  selector: string;
  min_count?: number;
  message?: string;
}

export interface CssPropertyCheck {
  type: 'css_property';
  selector: string;
  property: string;
  equals?: string[];
  message?: string;
}

export type ExerciseCheck = HtmlTextCheck | HtmlSelectorCheck | CssPropertyCheck;

export interface ValidatorConfig {
  checks?: ExerciseCheck[];
  success_message?: string;
}

export interface CodeInput {
  html: string;
  css: string;
  js: string;
}

export interface ValidationResult {
  isCorrect: boolean;
  feedback: string;
}

export interface HtmlNodeLike {
  textContent: string | null;
}

export interface HtmlDocumentLike {
  querySelectorAll(selector: string): ArrayLike<HtmlNodeLike>;
}

export type HtmlParser = (html: string) => HtmlDocumentLike;

function normalizeComparable(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

const NAMED_COLORS: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  red: '#ff0000',
  green: '#008000',
  blue: '#0000ff',
  yellow: '#ffff00',
  gray: '#808080',
  grey: '#808080',
  orange: '#ffa500',
  purple: '#800080',
};

const SHORT_HEX: Record<string, string> = {
  '0': '00',
  '1': '11',
  '2': '22',
  '3': '33',
  '4': '44',
  '5': '55',
  '6': '66',
  '7': '77',
  '8': '88',
  '9': '99',
  a: 'aa',
  b: 'bb',
  c: 'cc',
  d: 'dd',
  e: 'ee',
  f: 'ff',
};

export function normalizeCssValue(property: string, rawValue: string): string {
  const value = rawValue.replace(/!important/gi, '').replace(/\s+/g, '').toLowerCase();

  if (property !== 'color' && property !== 'background-color') {
    return value;
  }

  if (NAMED_COLORS[value]) return NAMED_COLORS[value];

  if (/^#[0-9a-f]{3}$/.test(value)) {
    const [, r, g, b] = value;
    if (!r || !g || !b) return value;
    return `#${SHORT_HEX[r] ?? r}${SHORT_HEX[g] ?? g}${SHORT_HEX[b] ?? b}`;
  }

  const rgb = value.match(/^rgba?\((\d+),(\d+),(\d+)(?:,[\d.]+)?\)$/);
  if (rgb) {
    const toHex = (part: string | undefined) =>
      Math.max(0, Math.min(255, Number(part ?? 0)))
        .toString(16)
        .padStart(2, '0');
    return `#${toHex(rgb[1])}${toHex(rgb[2])}${toHex(rgb[3])}`;
  }

  return value;
}

interface CssBlock {
  selectors: string[];
  declarations: Map<string, string>;
}

export function parseCssBlocks(css: string): CssBlock[] {
  const blocks: CssBlock[] = [];
  const blockPattern = /([^{}]+)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(css)) !== null) {
    const selectorText = match[1] ?? '';
    const body = match[2] ?? '';
    const selectors = selectorText
      .split(',')
      .map((selector) => normalizeComparable(selector))
      .filter(Boolean);

    const declarations = new Map<string, string>();

    for (const declaration of body.split(';')) {
      const separator = declaration.indexOf(':');
      if (separator === -1) continue;

      const property = normalizeComparable(declaration.slice(0, separator));
      const value = declaration.slice(separator + 1).trim();
      if (property && value) declarations.set(property, value);
    }

    blocks.push({ selectors, declarations });
  }

  return blocks;
}

export function validateExercise(
  code: CodeInput,
  config: ValidatorConfig,
  parseHtml: HtmlParser,
): ValidationResult {
  const checks = config.checks ?? [];

  if (checks.length === 0) {
    return {
      isCorrect: false,
      feedback: 'Latihan ini belum memiliki aturan validasi. Hubungi dosen Anda.',
    };
  }

  const fail = (message: string): ValidationResult => ({ isCorrect: false, feedback: message });

  let document: HtmlDocumentLike | null = null;

  for (const check of checks) {
    if (check.type === 'html_text' || check.type === 'html_selector') {
      if (!document) {
        try {
          document = parseHtml(code.html);
        } catch {
          return fail('Kode HTML tidak dapat dibaca. Periksa kembali markup Anda.');
        }
      }
    }

    if (check.type === 'html_selector') {
      const nodes = document?.querySelectorAll(check.selector) ?? [];
      const minimum = check.min_count ?? 1;
      if (nodes.length < minimum) {
        return fail(
          check.message ??
            `Elemen \`${check.selector}\` belum ditemukan. Tambahkan minimal ${minimum} elemen tersebut.`,
        );
      }
    }

    if (check.type === 'html_text') {
      const nodes = Array.from(document?.querySelectorAll(check.selector) ?? []);
      if (nodes.length === 0) {
        return fail(
          check.message ??
            `Elemen \`${check.selector}\` belum ditemukan. Pastikan Anda menggunakan elemen yang diminta.`,
        );
      }

      const text = normalizeComparable(nodes.map((node) => node.textContent ?? '').join(' '));

      if (check.equals !== undefined && text !== normalizeComparable(check.equals)) {
        return fail(
          check.message ??
            `Teks pada \`${check.selector}\` belum sesuai. Diharapkan "${check.equals}".`,
        );
      }

      if (check.min_length !== undefined && text.length < check.min_length) {
        return fail(
          check.message ??
            `Teks pada \`${check.selector}\` terlalu pendek. Isi dengan minimal ${check.min_length} karakter.`,
        );
      }
    }

    if (check.type === 'css_property') {
      const blocks = parseCssBlocks(code.css);
      const selector = normalizeComparable(check.selector);
      const property = normalizeComparable(check.property);
      const matching = blocks.filter((block) => block.selectors.includes(selector));

      if (matching.length === 0) {
        return fail(
          check.message ??
            `Selektor \`${check.selector}\` belum ditemukan di CSS. Tambahkan blok \`${check.selector} { ... }\`.`,
        );
      }

      const declared = matching
        .map((block) => block.declarations.get(property))
        .filter((value): value is string => Boolean(value));

      if (declared.length === 0) {
        return fail(
          check.message ??
            `Properti \`${check.property}\` belum ada pada selektor \`${check.selector}\`.`,
        );
      }

      if (check.equals && check.equals.length > 0) {
        const allowed = new Set(
          check.equals.map((value) => normalizeCssValue(property, value)),
        );
        const matched = declared.some((value) =>
          allowed.has(normalizeCssValue(property, value)),
        );

        if (!matched) {
          return fail(
            check.message ??
              `Nilai \`${check.property}\` pada \`${check.selector}\` belum sesuai. Gunakan salah satu: ${check.equals.join(', ')}.`,
          );
        }
      }
    }
  }

  return {
    isCorrect: true,
    feedback:
      config.success_message ??
      'Kode benar! Anda sudah memenuhi semua kriteria latihan ini.',
  };
}
