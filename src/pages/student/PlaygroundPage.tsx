import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { ArrowLeft, CheckCircle2, Lightbulb, Play, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import '../../lib/monaco';
import { useAuth } from '../../auth/AuthContext';
import { Alert, Badge, Button, Card, ErrorState, LoadingState } from '../../components/ui';
import { useRequestAiExplanation, useRequestAiHint, useSubmitExercise } from '../../features/exercises/hooks';
import { useExerciseDetail, useLessonDetail } from '../../features/modules/hooks';
import type { ExerciseRow, ExerciseSubmissionRow } from '../../lib/database.types';
import { getErrorMessage } from '../../lib/errors';

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
    <meta charset="utf-8" />
    ${css}
  </head>
  <body>
    ${code.html}
    ${js}
  </body>
</html>`;
}

function starterCode(exercise: ExerciseRow): CodeState {
  return {
    html: exercise.starter_html,
    css: exercise.starter_css,
    js: exercise.starter_js,
  };
}

function Playground({
  exercise,
  submission,
  moduleId,
}: {
  exercise: ExerciseRow;
  submission: ExerciseSubmissionRow | null;
  moduleId: string | undefined;
}) {
  const { user } = useAuth();
  const initial = starterCode(exercise);
  const [code, setCode] = useState<CodeState>(initial);
  const [activeTab, setActiveTab] = useState<EditorTab>(exercise.starter_css.trim() ? 'css' : 'html');
  const [srcDoc, setSrcDoc] = useState(() => buildSrcDoc(initial));
  const [hint, setHint] = useState<string | null>(null);
  const [hintSource, setHintSource] = useState<'ai' | 'fallback' | null>(null);
  const [hintError, setHintError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(
    submission
      ? { isCorrect: submission.is_correct, message: submission.feedback }
      : null,
  );
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explanationError, setExplanationError] = useState<string | null>(null);

  const submitExercise = useSubmitExercise(
    user?.id,
    exercise.id,
    moduleId,
    exercise.lesson_id,
  );
  const requestHint = useRequestAiHint(exercise.id);
  const requestExplanation = useRequestAiExplanation(exercise.id);

  const preview = useMemo(() => srcDoc, [srcDoc]);
  const activeCode = code[activeTab];

  const handleEditorChange = (value: string | undefined) => {
    setCode((previous) => ({ ...previous, [activeTab]: value ?? '' }));
  };

  const handleRun = () => setSrcDoc(buildSrcDoc(code));

  const handleReset = () => {
    const next = starterCode(exercise);
    setCode(next);
    setSrcDoc(buildSrcDoc(next));
    setFeedback(null);
    setExplanation(null);
  };

  const handleCheck = () => {
    setExplanation(null);
    setExplanationError(null);
    submitExercise.mutate(code, {
      onSuccess: (result) => {
        setFeedback({ isCorrect: result.is_correct, message: result.feedback });
      },
    });
  };

  const handleHint = () => {
    setHintError(null);
    requestHint.mutate(
      { ...code, errorMessage: feedback?.isCorrect === false ? feedback.message : undefined },
      {
        onSuccess: (result) => {
          setHint(result.hint);
          setHintSource(result.source);
        },
        onError: (error) => {
          setHint(exercise.hint || null);
          setHintSource('fallback');
          setHintError(getErrorMessage(error));
        },
      },
    );
  };

  const handleExplain = () => {
    if (!feedback || feedback.isCorrect) return;
    setExplanationError(null);
    requestExplanation.mutate(
      { ...code, errorMessage: feedback.message },
      {
        onSuccess: (result) => setExplanation(result.explanation),
        onError: (error) => setExplanationError(getErrorMessage(error)),
      },
    );
  };

  const isCorrect = feedback?.isCorrect === true;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <div>
        <Link
          to={moduleId ? `/student/modules/${moduleId}` : '/student/modules'}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke modul
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{exercise.title}</h1>
          <Badge tone={isCorrect ? 'green' : feedback ? 'amber' : 'slate'}>
            {isCorrect ? 'Jawaban benar' : feedback ? 'Belum benar' : 'Belum diperiksa'}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <Card className="w-full p-5 lg:w-72 lg:shrink-0">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Instruksi</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {exercise.instructions}
          </p>
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            Server akan memeriksa kode Anda berdasarkan kriteria latihan. Anda bisa mencoba
            berkali-kali.
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={handleHint} disabled={requestHint.isPending}>
              <Lightbulb className="h-4 w-4" aria-hidden="true" />
              {requestHint.isPending ? 'Memuat hint…' : 'Minta Hint'}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset kode awal
            </Button>
          </div>

          {hint ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Hint {hintSource === 'ai' ? 'AI' : 'latihan'}
              </p>
              <p className="mt-1.5 whitespace-pre-line">{hint}</p>
              {hintError ? (
                <p className="mt-2 text-xs text-amber-700">
                  AI tidak tersedia, menampilkan hint latihan. {hintError}
                </p>
              ) : null}
            </div>
          ) : null}
        </Card>

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
                  className={`rounded-md px-3 py-1 text-xs font-semibold ${
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
              loading={
                <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
                  Memuat editor Monaco…
                </div>
              }
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleRun}>
              <Play className="h-4 w-4" aria-hidden="true" />
              Jalankan
            </Button>
            <Button
              variant="secondary"
              onClick={handleCheck}
              disabled={submitExercise.isPending}
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              {submitExercise.isPending ? 'Memeriksa…' : 'Cek Jawaban'}
            </Button>
            {feedback && !feedback.isCorrect ? (
              <Button
                variant="outline"
                onClick={handleExplain}
                disabled={requestExplanation.isPending}
              >
                <Lightbulb className="h-4 w-4" aria-hidden="true" />
                {requestExplanation.isPending ? 'Menjelaskan…' : 'Jelaskan Kesalahan'}
              </Button>
            ) : null}
          </div>

          {submitExercise.error ? (
            <Alert tone="error">{getErrorMessage(submitExercise.error)}</Alert>
          ) : null}

          {feedback ? (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                feedback.isCorrect
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-amber-200 bg-amber-50 text-amber-900'
              }`}
            >
              <p className="flex items-center gap-2 font-semibold">
                {feedback.isCorrect ? (
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                ) : null}
                {feedback.isCorrect ? 'Kode benar!' : 'Belum benar.'}
              </p>
              <p className="mt-1 whitespace-pre-line">{feedback.message}</p>
              {feedback.isCorrect ? (
                <p className="mt-2 text-xs text-emerald-700">
                  XP dan progres modul sudah diperbarui.
                </p>
              ) : null}
            </div>
          ) : null}

          {explanation ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              <p className="font-semibold">Penjelasan</p>
              <p className="mt-1 whitespace-pre-line">{explanation}</p>
            </div>
          ) : null}
          {explanationError ? <Alert tone="error">{explanationError}</Alert> : null}
        </Card>

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
          <p className="text-xs text-slate-500">
            Preview dijalankan di iframe terisolasi. Tekan “Jalankan” untuk memperbarui hasil.
          </p>
          {submission ? (
            <p className="text-xs text-slate-500">
              Penilaian terakhir:{' '}
              {submission.is_correct ? 'benar' : 'belum benar'} ·{' '}
              {new Date(submission.submitted_at).toLocaleString('id-ID')}
            </p>
          ) : null}
        </Card>
      </div>
    </div>
  );
}

export default function PlaygroundPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const { user } = useAuth();
  const { detail, isLoading, error } = useExerciseDetail(exerciseId, user?.id);
  const lessonState = useLessonDetail(detail?.exercise.lesson_id, user?.id);

  if (isLoading || lessonState.isLoading) {
    return <LoadingState label="Memuat latihan…" />;
  }

  if (error) {
    return <ErrorState message={getErrorMessage(error)} />;
  }

  if (!detail) {
    return <Navigate to="/student/modules" replace />;
  }

  return (
    <Playground
      key={detail.exercise.id}
      exercise={detail.exercise}
      submission={detail.submission}
      moduleId={lessonState.module?.id}
    />
  );
}
