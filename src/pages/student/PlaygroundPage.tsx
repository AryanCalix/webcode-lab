import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { ArrowLeft, FlaskConical, Play, ShieldCheck, Lightbulb } from 'lucide-react';
import { getExerciseById } from '../../data/demoData';
import { Badge, Button, Card } from '../../components/ui';
import { saveExerciseSubmission, validateExercise, type ExerciseSubmission } from '../../data/demoData';
import { awardXp } from '../../services/gamification';
import { requestHint } from '../../services/aiService';

type CodeState = { html: string; css: string; js: string };
type EditorTab = 'html' | 'css' | 'js';

const languageByTab: Record<EditorTab, string> = {
  html: 'html',
  css: 'css',
  js: 'javascript',
};

function buildSrcDoc(code: CodeState): string {
  const css = code.css.trim() ? `<style>${code.css}</style>` : '';
  const js = code.js.trim() ? `<script>${code.js}</script>` : '';
  return `<!doctype html>
<html>
  <head>
    ${css}
  </head>
  <body>
    ${code.html}
    ${js}
  </body>
</html>`;
}

export default function PlaygroundPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const exercise = exerciseId ? getExerciseById(exerciseId) : undefined;

  const [code, setCode] = useState<CodeState>(() =>
    exercise
      ? { html: exercise.starterHtml, css: exercise.starterCss, js: exercise.starterJs }
      : { html: '', css: '', js: '' },
  );
  const [activeTab, setActiveTab] = useState<EditorTab>('css');
  const [srcDoc, setSrcDoc] = useState<string>(() =>
    exercise ? buildSrcDoc({ html: exercise.starterHtml, css: exercise.starterCss, js: exercise.starterJs }) : '<!doctype html><html><body></body></html>',
  );
  const [isHintVisible, setIsHintVisible] = useState(false);
  const [hint, setHint] = useState(() => exercise?.hint ?? '');
  const [aiHintStatus, setAiHintStatus] = useState<'idle' | 'loading' | 'ready' | 'unconfigured'>('idle');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [lastSubmission, setLastSubmission] = useState<ExerciseSubmission | null>(null);

  const activeCode = code[activeTab];

  const handleEditorChange = (value: string | undefined) => {
    setCode((prev) => ({ ...prev, [activeTab]: value ?? '' }));
  };

  const preview = useMemo(() => srcDoc, [srcDoc]);

  if (!exercise) {
    return <Navigate to="/student/modules" replace />;
  }

  const handleRequestHint = async () => {
    setIsHintVisible(true);
    setAiHintStatus('loading');
    const result = await requestHint({
      exerciseId: exercise.id,
      instructions: exercise.instructions,
      code: activeCode,
    });

    if (result.status === 'ok' && result.hint) {
      setHint(result.hint);
      setAiHintStatus('ready');
    } else {
      setHint(exercise.hint);
      setAiHintStatus('unconfigured');
    }
  };

  const handleRun = () => {
    setSrcDoc(buildSrcDoc(code));
  };

  const handleCheckAnswer = () => {
    const result = validateExercise(exercise, code);
    const submission: ExerciseSubmission = {
      exerciseId: exercise.id,
      htmlCode: code.html,
      cssCode: code.css,
      jsCode: code.js,
      isCorrect: result.isCorrect,
      feedback: result.feedback,
      submittedAt: new Date().toISOString(),
    };
    saveExerciseSubmission(submission);
    setLastSubmission(submission);
    setFeedback({ isCorrect: result.isCorrect, message: result.feedback });

    if (result.isCorrect) {
      // Demo: XP dikreditkan melalui layanan lokal (mock backend pada fase 1).
      // Integrasi backend nyata pada fase berikutnya.
      awardXp('usr_student', 'exercise', exercise.id, 20);
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div>
        <Link
          to="/student/modules"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke modul
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{exercise.title}</h1>
          <Badge tone={lastSubmission?.isCorrect ? 'green' : 'slate'}>
            {lastSubmission?.isCorrect ? 'Jawaban benar' : 'Belum diperiksa'}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Panel instruksi */}
        <Card className="w-full p-5 lg:w-72 lg:shrink-0">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Instruksi</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{exercise.instructions}</p>
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            Latihan ini menguji pemahaman dasar React + TypeScript di WebCode Lab (demo).
          </div>
        </Card>

        {/* Editor + aksi */}
        <Card className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Editor Kode
            </h2>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
              {(['html', 'css', 'js'] as EditorTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold capitalize ${
                    activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {tab === 'js' ? 'JavaScript' : tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[420px] w-full overflow-hidden rounded-xl border border-slate-200 lg:h-[520px]">
            <Editor
              height="100%"
              language={languageByTab[activeTab]}
              value={activeCode}
              onChange={handleEditorChange}
              theme="light"
              loading={<div className="flex h-full w-full items-center justify-center text-sm text-slate-500">Memuat editor Monaco…</div>}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleRun}>
              <Play className="h-4 w-4" aria-hidden="true" />
              Run
            </Button>
            <Button variant="outline" onClick={() => void handleRequestHint()}>
              <Lightbulb className="h-4 w-4" aria-hidden="true" />
              Hint
            </Button>
            <Button variant="secondary" onClick={handleCheckAnswer}>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Cek Jawaban
            </Button>
          </div>

          {isHintVisible ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="flex items-center gap-2 font-semibold">
                <FlaskConical className="h-4 w-4" aria-hidden="true" />
                Hint
              </p>
              {aiHintStatus === 'loading' ? (
                <p className="mt-1.5">Memuat hint dari AI…</p>
              ) : (
                <p className="mt-1.5">{hint}</p>
              )}
              {aiHintStatus === 'unconfigured' ? (
                <p className="mt-2 text-xs text-amber-700">
                  Bantuan AI belum dikonfigurasi — menampilkan hint lokal.
                </p>
              ) : null}
            </div>
          ) : null}
        </Card>

        {/* Live preview */}
        <Card className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Live Preview
          </h2>
          <div className="h-[220px] w-full overflow-hidden rounded-xl border border-slate-200 bg-white sm:h-[280px] lg:h-[340px]">
            <iframe
              title="Live preview hasil kode"
              sandbox="allow-scripts"
              srcDoc={preview}
              className="h-full w-full bg-white"
            />
          </div>

          {feedback ? (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                feedback.isCorrect
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-amber-200 bg-amber-50 text-amber-900'
              }`}
            >
              <p className="font-semibold">{feedback.isCorrect ? 'Kode benar!' : 'Belum benar.'}</p>
              <p className="mt-1">{feedback.message}</p>
            </div>
          ) : null}
        </Card>
      </div>

      {lastSubmission ? (
        <p className="text-xs text-slate-500">
          Status penilaian tersimpan lokal (demo): {lastSubmission.isCorrect ? 'benar' : 'belum benar'} ·{' '}
          {new Date(lastSubmission.submittedAt).toLocaleString('id-ID')}
        </p>
      ) : null}
    </div>
  );
}
