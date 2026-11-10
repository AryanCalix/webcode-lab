import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  ErrorState,
  Field,
  LoadingState,
  inputClassName,
} from '../../components/ui';
import {
  useAllModules,
  useLessonEditor,
  useModuleLessons,
  useSaveLesson,
} from '../../features/lecturer/hooks';
import type { ExerciseRow, Json, LessonRow } from '../../lib/database.types';
import { getErrorMessage } from '../../lib/errors';

const DEFAULT_VALIDATOR = JSON.stringify(
  {
    checks: [{ type: 'html_text', selector: 'h1', equals: 'Halo Web' }],
    success_message: 'Kode benar! Anda sudah memenuhi semua kriteria latihan ini.',
  },
  null,
  2,
);

function LessonForm({
  lesson,
  exercise,
  moduleId,
  defaultOrder,
  onSaved,
}: {
  lesson: LessonRow | null;
  exercise: ExerciseRow | null;
  moduleId: string;
  defaultOrder: number;
  onSaved: () => void;
}) {
  const saveLesson = useSaveLesson();
  const [title, setTitle] = useState(lesson?.title ?? '');
  const [content, setContent] = useState(lesson?.content ?? '');
  const [videoUrl, setVideoUrl] = useState(lesson?.video_url ?? '');
  const [kind, setKind] = useState<'material' | 'exercise'>(lesson?.kind ?? 'material');
  const [orderIndex, setOrderIndex] = useState(lesson?.order_index ?? defaultOrder);
  const [isPublished, setIsPublished] = useState(lesson?.is_published ?? true);

  const [exerciseTitle, setExerciseTitle] = useState(exercise?.title ?? '');
  const [instructions, setInstructions] = useState(exercise?.instructions ?? '');
  const [starterHtml, setStarterHtml] = useState(exercise?.starter_html ?? '');
  const [starterCss, setStarterCss] = useState(exercise?.starter_css ?? '');
  const [starterJs, setStarterJs] = useState(exercise?.starter_js ?? '');
  const [hint, setHint] = useState(exercise?.hint ?? '');
  const [validatorText, setValidatorText] = useState(
    exercise ? JSON.stringify(exercise.validator_config, null, 2) : DEFAULT_VALIDATOR,
  );

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (title.trim().length < 3) {
      setFormError('Judul pelajaran minimal 3 karakter.');
      return;
    }

    let validatorConfig: Json = {};
    if (kind === 'exercise') {
      if (exerciseTitle.trim().length < 3) {
        setFormError('Judul latihan minimal 3 karakter.');
        return;
      }
      if (instructions.trim().length < 10) {
        setFormError('Instruksi latihan minimal 10 karakter.');
        return;
      }

      try {
        const parsed = JSON.parse(validatorText) as unknown;
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          setFormError('Validator harus berupa objek JSON.');
          return;
        }
        const checks = (parsed as { checks?: unknown }).checks;
        if (!Array.isArray(checks) || checks.length === 0) {
          setFormError('Validator harus memiliki array "checks" dengan minimal satu aturan.');
          return;
        }
        validatorConfig = parsed as Json;
      } catch {
        setFormError('Validator bukan JSON yang valid.');
        return;
      }
    }

    saveLesson.mutate(
      {
        id: lesson?.id,
        moduleId,
        title,
        content,
        videoUrl: videoUrl.trim() || null,
        kind,
        orderIndex,
        isPublished,
        exercise:
          kind === 'exercise'
            ? {
                title: exerciseTitle,
                instructions,
                starterHtml,
                starterCss,
                starterJs,
                hint,
                validatorConfig,
                isPublished: true,
              }
            : null,
      },
      { onSuccess: onSaved },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">Detail Pelajaran</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Judul" htmlFor="lesson-title">
            <input
              id="lesson-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={inputClassName}
              placeholder="Contoh: Selektor dan Cascade"
            />
          </Field>
          <Field label="Jenis" htmlFor="lesson-kind">
            <select
              id="lesson-kind"
              value={kind}
              onChange={(event) => setKind(event.target.value as 'material' | 'exercise')}
              className={inputClassName}
            >
              <option value="material">Materi teks</option>
              <option value="exercise">Latihan interaktif</option>
            </select>
          </Field>
          <Field label="Urutan" htmlFor="lesson-order">
            <input
              id="lesson-order"
              type="number"
              min={0}
              value={orderIndex}
              onChange={(event) => setOrderIndex(Number(event.target.value) || 0)}
              className={inputClassName}
            />
          </Field>
          <Field label="URL video (opsional)" htmlFor="lesson-video">
            <input
              id="lesson-video"
              type="url"
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              className={inputClassName}
              placeholder="https://..."
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Konten materi (Markdown)" htmlFor="lesson-content">
            <textarea
              id="lesson-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={10}
              className={`${inputClassName} font-mono text-xs`}
              placeholder="## Judul materi&#10;&#10;Tulis penjelasan di sini..."
            />
          </Field>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
            className="h-4 w-4 accent-brand-600"
          />
          Publikasikan pelajaran
        </label>
      </Card>

      {kind === 'exercise' ? (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900">Latihan</h2>
          <div className="mt-4 grid gap-4">
            <Field label="Judul latihan" htmlFor="exercise-title">
              <input
                id="exercise-title"
                value={exerciseTitle}
                onChange={(event) => setExerciseTitle(event.target.value)}
                className={inputClassName}
              />
            </Field>
            <Field label="Instruksi" htmlFor="exercise-instructions">
              <textarea
                id="exercise-instructions"
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                rows={4}
                className={inputClassName}
                placeholder="Jelaskan apa yang harus dibuat mahasiswa."
              />
            </Field>

            <div className="grid gap-4 lg:grid-cols-3">
              <Field label="Starter HTML" htmlFor="exercise-html">
                <textarea
                  id="exercise-html"
                  value={starterHtml}
                  onChange={(event) => setStarterHtml(event.target.value)}
                  rows={8}
                  className={`${inputClassName} font-mono text-xs`}
                />
              </Field>
              <Field label="Starter CSS" htmlFor="exercise-css">
                <textarea
                  id="exercise-css"
                  value={starterCss}
                  onChange={(event) => setStarterCss(event.target.value)}
                  rows={8}
                  className={`${inputClassName} font-mono text-xs`}
                />
              </Field>
              <Field label="Starter JavaScript" htmlFor="exercise-js">
                <textarea
                  id="exercise-js"
                  value={starterJs}
                  onChange={(event) => setStarterJs(event.target.value)}
                  rows={8}
                  className={`${inputClassName} font-mono text-xs`}
                />
              </Field>
            </div>

            <Field label="Hint untuk mahasiswa" htmlFor="exercise-hint">
              <textarea
                id="exercise-hint"
                value={hint}
                onChange={(event) => setHint(event.target.value)}
                rows={3}
                className={inputClassName}
              />
            </Field>

            <Field label="Validator (JSON)" htmlFor="exercise-validator">
              <textarea
                id="exercise-validator"
                value={validatorText}
                onChange={(event) => setValidatorText(event.target.value)}
                rows={12}
                className={`${inputClassName} font-mono text-xs`}
              />
            </Field>
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">Tipe aturan yang tersedia</p>
              <ul className="mt-1 list-inside list-disc space-y-1">
                <li>
                  <code>html_selector</code>: pastikan elemen ada (mis. <code>header</code>).
                </li>
                <li>
                  <code>html_text</code>: cocokkan teks elemen (<code>equals</code> atau{' '}
                  <code>min_length</code>).
                </li>
                <li>
                  <code>css_property</code>: cocokkan properti CSS pada selector (mis.{' '}
                  <code>color</code> untuk <code>h1</code>).
                </li>
              </ul>
              <p className="mt-2">Validasi dijalankan di server pada Edge Function, bukan di browser.</p>
            </div>
          </div>
        </Card>
      ) : null}

      {formError ? <Alert tone="error">{formError}</Alert> : null}
      {saveLesson.error ? <Alert tone="error">{getErrorMessage(saveLesson.error)}</Alert> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={saveLesson.isPending}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {saveLesson.isPending ? 'Menyimpan…' : 'Simpan Pelajaran'}
        </Button>
        <Link to={`/lecturer/modules/${moduleId}`}>
          <Button variant="outline">Batal</Button>
        </Link>
      </div>
    </form>
  );
}

export default function LessonEditorPage() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId?: string }>();
  const navigate = useNavigate();
  const modulesQuery = useAllModules();
  const lessonsQuery = useModuleLessons(moduleId);
  const { lesson, exercise, isLoading, error } = useLessonEditor(lessonId);

  if (modulesQuery.isLoading || lessonsQuery.isLoading || isLoading) {
    return <LoadingState label="Memuat pelajaran…" />;
  }

  if (modulesQuery.error || lessonsQuery.error || error) {
    return (
      <ErrorState
        message={getErrorMessage(modulesQuery.error ?? lessonsQuery.error ?? error)}
        onRetry={() => {
          void modulesQuery.refetch();
          void lessonsQuery.refetch();
        }}
      />
    );
  }

  const module = (modulesQuery.data ?? []).find((item) => item.id === moduleId);
  if (!module) return <Navigate to="/lecturer/modules" replace />;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to={`/lecturer/modules/${module.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke {module.title}
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold text-slate-900">
          {lessonId ? 'Edit Pelajaran' : 'Pelajaran Baru'}
        </h1>
        <Badge tone="blue">{module.title}</Badge>
      </div>

      <LessonForm
        key={lessonId ?? 'new'}
        lesson={lesson}
        exercise={exercise}
        moduleId={module.id}
        defaultOrder={(lessonsQuery.data ?? []).length + 1}
        onSaved={() => navigate(`/lecturer/modules/${module.id}`)}
      />
    </div>
  );
}
