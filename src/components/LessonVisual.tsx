import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowDown,
  Code2,
  Info,
  KeyRound,
  Lightbulb,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import type { VisualRow } from './lessonBlocks';

export type CalloutTone = 'note' | 'tip' | 'warning' | 'key';

const calloutMeta: Record<
  CalloutTone,
  {
    label: string;
    icon: LucideIcon;
    container: string;
    iconWrap: string;
    title: string;
  }
> = {
  note: {
    label: 'Catatan',
    icon: Info,
    container: 'border-blue-200 bg-blue-50/70',
    iconWrap: 'bg-blue-100 text-blue-700',
    title: 'text-blue-900',
  },
  tip: {
    label: 'Tips',
    icon: Lightbulb,
    container: 'border-emerald-200 bg-emerald-50/70',
    iconWrap: 'bg-emerald-100 text-emerald-700',
    title: 'text-emerald-900',
  },
  warning: {
    label: 'Perhatian',
    icon: TriangleAlert,
    container: 'border-amber-200 bg-amber-50/80',
    iconWrap: 'bg-amber-100 text-amber-800',
    title: 'text-amber-900',
  },
  key: {
    label: 'Poin kunci',
    icon: KeyRound,
    container: 'border-brand-200 bg-brand-50/80',
    iconWrap: 'bg-brand-100 text-brand-700',
    title: 'text-brand-900',
  },
};

export function Callout({
  tone,
  title,
  body,
}: {
  tone: CalloutTone;
  title: string;
  body: string;
}) {
  const meta = calloutMeta[tone];
  const Icon = meta.icon;

  return (
    <aside className={`my-5 rounded-2xl border p-4 ${meta.container}`}>
      <div className="flex gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.iconWrap}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-bold ${meta.title}`}>{title || meta.label}</p>
          <div className="mt-1 space-y-2 text-sm leading-relaxed text-slate-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
          </div>
        </div>
      </div>
    </aside>
  );
}

function VisualText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={index} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[12px]">
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

function stripInlineCode(value: string) {
  return value.replace(/`/g, '');
}

export function FlowVisual({ title, rows }: { title: string; rows: VisualRow[] }) {
  if (rows.length === 0) return null;

  return (
    <figure className="my-5 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 sm:p-5">
      {title ? (
        <figcaption className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-700">
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
          {title}
        </figcaption>
      ) : null}
      <ol>
        {rows.map((row, index) => (
          <li key={`${row.label}-${index}`} className="relative flex gap-3 pb-5 last:pb-0">
            {index < rows.length - 1 ? (
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-[15px] top-8 w-px bg-brand-200"
              />
            ) : null}
            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white shadow-sm">
              {index + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-slate-900">
                <VisualText text={row.label} />
              </p>
              {row.detail ? (
                <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                  <VisualText text={row.detail} />
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}

const compareAccents = [
  'bg-brand-100 text-brand-800',
  'bg-blue-100 text-blue-800',
  'bg-emerald-100 text-emerald-800',
  'bg-violet-100 text-violet-800',
];

export function CompareVisual({ title, rows }: { title: string; rows: VisualRow[] }) {
  if (rows.length === 0) return null;
  const columns =
    rows.length === 2 ? 'sm:grid-cols-2' : rows.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2';

  return (
    <figure className="my-5">
      {title ? (
        <figcaption className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
          {title}
        </figcaption>
      ) : null}
      <div className={`grid gap-3 ${columns}`}>
        {rows.map((row, index) => (
          <div
            key={`${row.label}-${index}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                compareAccents[index % compareAccents.length]
              }`}
            >
              {index + 1}
            </span>
            <p className="mt-2.5 text-sm font-bold text-slate-900">
              <VisualText text={row.label} />
            </p>
            {row.detail ? (
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                <VisualText text={row.detail} />
              </p>
            ) : null}
            {row.example ? (
              <code className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-700">
                {stripInlineCode(row.example)}
              </code>
            ) : null}
          </div>
        ))}
      </div>
    </figure>
  );
}

export function PreviewVisual({
  title,
  html,
  css,
  js,
}: {
  title: string;
  html: string;
  css: string;
  js: string;
}) {
  const [showCode, setShowCode] = useState(false);
  const document = useMemo(() => buildPreviewDocument(html, css, js), [html, css, js]);
  const hasCode = Boolean(html || css || js);
  const label = title || 'Hasil di browser';

  return (
    <figure className="my-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <span className="flex shrink-0 gap-1" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-md bg-white px-2 py-1 font-mono text-[11px] text-slate-500 ring-1 ring-slate-200">
          {label}
        </span>
        {hasCode ? (
          <button
            type="button"
            onClick={() => setShowCode((value) => !value)}
            aria-expanded={showCode}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-white hover:text-slate-900"
          >
            <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
            {showCode ? 'Sembunyikan' : 'Lihat kode'}
          </button>
        ) : null}
      </div>

      <iframe
        title={label}
        sandbox="allow-scripts"
        srcDoc={document}
        loading="lazy"
        className="block h-56 w-full bg-white sm:h-64"
      />

      {showCode ? (
        <div className="space-y-3 border-t border-slate-200 bg-slate-950 p-4">
          <CodeBlock label="HTML" code={html} />
          <CodeBlock label="CSS" code={css} />
          <CodeBlock label="JavaScript" code={js} />
        </div>
      ) : null}
    </figure>
  );
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  if (!code.trim()) return null;

  return (
    <div>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <pre className="overflow-x-auto rounded-lg bg-black/30 p-3 text-xs leading-5 text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function buildPreviewDocument(html: string, css: string, js: string) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
:root { color-scheme: light; }
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; }
body {
  min-height: 100vh;
  padding: 18px;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  color: #0f172a;
  background: #ffffff;
  line-height: 1.6;
}
img { max-width: 100%; }
${css}
</style>
</head>
<body>
${html}
${js ? `<script>${js.replace(/<\/script/gi, '<\\/script')}</script>` : ''}
</body>
</html>`;
}
