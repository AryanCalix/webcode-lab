import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

// Self-host Monaco so the editor works offline and without a CDN dependency.
// Workers are instantiated through Vite's `new Worker(new URL(...))` pattern.
const WorkerConstructor = Worker as unknown as new (
  url: URL,
  options?: { type?: string },
) => Worker;

const editorWorker = new WorkerConstructor(
  new URL('../../node_modules/monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
  { type: 'module' },
);
const cssWorker = new WorkerConstructor(
  new URL('../../node_modules/monaco-editor/esm/vs/language/css/css.worker.js', import.meta.url),
  { type: 'module' },
);
const htmlWorker = new WorkerConstructor(
  new URL('../../node_modules/monaco-editor/esm/vs/language/html/html.worker.js', import.meta.url),
  { type: 'module' },
);
const jsonWorker = new WorkerConstructor(
  new URL('../../node_modules/monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url),
  { type: 'module' },
);
const tsWorker = new WorkerConstructor(
  new URL('../../node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url),
  { type: 'module' },
);

(self as unknown as { MonacoEnvironment: monaco.Environment }).MonacoEnvironment = {
  getWorker(_workerId: string, label: string) {
    if (label === 'json') return jsonWorker;
    if (label === 'css' || label === 'scss' || label === 'less') return cssWorker;
    if (label === 'html' || label === 'handlebars' || label === 'razor') return htmlWorker;
    if (label === 'typescript' || label === 'javascript') return tsWorker;
    return editorWorker;
  },
};

loader.config({ monaco });
