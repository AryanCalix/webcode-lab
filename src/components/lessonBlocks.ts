export type VisualName = 'note' | 'tip' | 'warning' | 'key' | 'flow' | 'compare' | 'preview';

export interface MarkdownBlock {
  type: 'markdown';
  content: string;
}

export interface VisualBlock {
  type: 'visual';
  name: VisualName;
  title: string;
  body: string;
}

export type LessonBlock = MarkdownBlock | VisualBlock;

export interface VisualRow {
  label: string;
  detail: string;
  example: string;
}

const VISUAL_NAMES = new Set<string>([
  'note',
  'tip',
  'warning',
  'key',
  'flow',
  'compare',
  'preview',
]);

const BLOCK_START = /^:::([a-z-]+)(?:\s+(.*))?$/i;

/**
 * Splits lesson markdown into regular markdown and `:::visual` blocks.
 * Blocks inside fenced code are ignored so code examples can safely mention
 * the syntax without being rendered.
 */
export function parseLessonBlocks(source: string): LessonBlock[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: LessonBlock[] = [];
  let buffer: string[] = [];
  let fence: string | null = null;
  let current: { name: VisualName; title: string; body: string[] } | null = null;

  const flushMarkdown = () => {
    const content = buffer.join('\n').trim();
    if (content) blocks.push({ type: 'markdown', content });
    buffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (fence) {
      if (current) current.body.push(line);
      else buffer.push(line);

      if (trimmed.startsWith(fence)) fence = null;
      continue;
    }

    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})/);
    if (fenceMatch) {
      fence = fenceMatch[1] ?? null;
      if (current) current.body.push(line);
      else buffer.push(line);
      continue;
    }

    if (current) {
      if (trimmed === ':::') {
        blocks.push({
          type: 'visual',
          name: current.name,
          title: current.title,
          body: current.body.join('\n').trim(),
        });
        current = null;
      } else {
        current.body.push(line);
      }
      continue;
    }

    const match = trimmed.match(BLOCK_START);
    const name = match?.[1]?.toLowerCase();
    if (match && name && VISUAL_NAMES.has(name)) {
      flushMarkdown();
      current = {
        name: name as VisualName,
        title: (match[2] ?? '').trim(),
        body: [],
      };
      continue;
    }

    buffer.push(line);
  }

  if (current) {
    // An unclosed block is treated as markdown so no content silently disappears.
    buffer.push(`:::${current.name}${current.title ? ` ${current.title}` : ''}`, ...current.body);
  }

  flushMarkdown();
  return blocks;
}

export function parseVisualRows(body: string): VisualRow[] {
  return body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('//'))
    .map((line) => {
      const [label = '', detail = '', example = ''] = line
        .split('|')
        .map((part) => part.trim());
      return { label, detail, example };
    });
}

export function parsePreviewBody(body: string): { html: string; css: string; js: string } {
  const segments = body.split(/^---(css|js)---$/gim);
  let html = segments[0] ?? '';
  let css = '';
  let js = '';

  for (let index = 1; index < segments.length; index += 2) {
    const language = segments[index]?.toLowerCase();
    const content = segments[index + 1] ?? '';
    if (language === 'css') css = content;
    if (language === 'js') js = content;
  }

  return { html: html.trim(), css: css.trim(), js: js.trim() };
}
