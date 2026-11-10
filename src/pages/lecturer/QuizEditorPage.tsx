import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Plus, Save, Trash2 } from 'lucide-react';
import {
  Alert,
  Button,
  Card,
  ErrorState,
  Field,
  LoadingState,
  inputClassName,
} from '../../components/ui';
import { useAllModules } from '../../features/lecturer/hooks';
import {
  useQuiz,
  useQuizQuestions,
  useSaveQuiz,
} from '../../features/quizzes/hooks';
import type { ModuleRow, QuizQuestionRow, QuizRow } from '../../lib/database.types';
import { getErrorMessage } from '../../lib/errors';

interface QuestionDraft {
  key: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  points: number;
}

function toLocalInput(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function createQuestion(index: number): QuestionDraft {
  return {
    key: `new-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    questionText: '',
    options: ['', ''],
    correctIndex: 0,
    points: 100,
  };
}

function QuizForm({
  quiz,
  questions,
  modules,
  defaultModuleId,
}: {
  quiz: QuizRow | null;
  questions: QuizQuestionRow[];
  modules: ModuleRow[];
  defaultModuleId?: string;
}) {
  const navigate = useNavigate();
  const saveQuiz = useSaveQuiz();

  const [title, setTitle] = useState(quiz?.title ?? '');
  const [description, setDescription] = useState(quiz?.description ?? '');
  const [moduleId, setModuleId] = useState(
    quiz?.module_id ??
      (modules.some((module) => module.id === defaultModuleId)
        ? (defaultModuleId as string)
        : (modules[0]?.id ?? '')),
  );
  const [durationMinutes, setDurationMinutes] = useState(
    quiz?.duration_minutes ? String(quiz.duration_minutes) : '',
  );
  const [deadlineAt, setDeadlineAt] = useState(toLocalInput(quiz?.deadline_at ?? null));
  const [isPublished, setIsPublished] = useState(quiz?.is_published ?? false);
  const [drafts, setDrafts] = useState<QuestionDraft[]>(() =>
    questions.map((question) => ({
      key: question.id,
      questionText: question.question_text,
      options: Array.isArray(question.options) ? (question.options as string[]) : ['', ''],
      correctIndex: question.correct_index,
      points: question.points || 100,
    })),
  );
  const [formError, setFormError] = useState<string | null>(null);

  const updateQuestion = (key: string, patch: Partial<QuestionDraft>) => {
    setDrafts((previous) =>
      previous.map((question) => (question.key === key ? { ...question, ...patch } : question)),
    );
  };

  const addQuestion = () => {
    setDrafts((previous) => [...previous, createQuestion(previous.length)]);
  };

  const removeQuestion = (key: string) => {
    setDrafts((previous) => previous.filter((question) => question.key !== key));
  };

  const removeOption = (question: QuestionDraft, optionIndex: number) => {
    if (question.options.length <= 2) return;

    const options = question.options.filter((_, index) => index !== optionIndex);
    let correctIndex = question.correctIndex;

    if (optionIndex === correctIndex) {
      correctIndex = 0;
    } else if (optionIndex < correctIndex) {
      correctIndex -= 1;
    }

    updateQuestion(question.key, { options, correctIndex });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (title.trim().length < 3) {
      setFormError('Judul kuis minimal 3 karakter.');
      return;
    }
    if (!moduleId) {
      setFormError('Pilih modul untuk kuis ini.');
      return;
    }
    if (drafts.length === 0) {
      setFormError('Kuis harus memiliki minimal satu soal.');
      return;
    }

    for (const [index, question] of drafts.entries()) {
      if (question.questionText.trim().length < 3) {
        setFormError(`Soal ${index + 1}: teks soal minimal 3 karakter.`);
        return;
      }
      if (question.options.length < 2) {
        setFormError(`Soal ${index + 1}: minimal dua pilihan jawaban.`);
        return;
      }
      if (question.options.some((option) => option.trim().length === 0)) {
        setFormError(`Soal ${index + 1}: semua pilihan jawaban harus diisi.`);
        return;
      }
      if (question.correctIndex < 0 || question.correctIndex >= question.options.length) {
        setFormError(`Soal ${index + 1}: pilih jawaban yang benar.`);
        return;
      }
      if (!Number.isFinite(question.points) || question.points <= 0) {
        setFormError(`Soal ${index + 1}: poin harus lebih dari 0.`);
        return;
      }
    }

    saveQuiz.mutate(
      {
        id: quiz?.id,
        moduleId,
        title,
        description,
        durationMinutes: durationMinutes ? Number(durationMinutes) : null,
        deadlineAt: deadlineAt ? new Date(deadlineAt).toISOString() : null,
        isPublished,
        questions: drafts.map((question) => ({
          question_text: question.questionText,
          options: question.options,
          correct_index: question.correctIndex,
          points: question.points,
        })),
      },
      { onSuccess: () => navigate('/lecturer/quizzes') },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Judul" htmlFor="quiz-title">
            <input
              id="quiz-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="Modul" htmlFor="quiz-module">
            <select
              id="quiz-module"
              value={moduleId}
              onChange={(event) => setModuleId(event.target.value)}
              className={inputClassName}
            >
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Durasi (menit)" htmlFor="quiz-duration">
            <input
              id="quiz-duration"
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
              className={inputClassName}
              placeholder="Kosongkan untuk tanpa batas"
            />
          </Field>
          <Field label="Tenggat" htmlFor="quiz-deadline">
            <input
              id="quiz-deadline"
              type="datetime-local"
              value={deadlineAt}
              onChange={(event) => setDeadlineAt(event.target.value)}
              className={inputClassName}
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Deskripsi" htmlFor="quiz-description">
            <textarea
              id="quiz-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className={inputClassName}
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
          Terbitkan kuis (mahasiswa dapat mengerjakan)
        </label>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Soal ({drafts.length})</h2>
          <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah Soal
          </Button>
        </div>

        {drafts.length === 0 ? (
          <Card className="p-6 text-sm text-slate-600">
            Belum ada soal. Klik “Tambah Soal” untuk membuat soal pertama.
          </Card>
        ) : (
          <div className="grid gap-4">
            {drafts.map((question, index) => (
              <Card key={question.key} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">Soal {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.key)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    aria-label={`Hapus soal ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <input
                  value={question.questionText}
                  onChange={(event) =>
                    updateQuestion(question.key, { questionText: event.target.value })
                  }
                  placeholder="Teks soal"
                  className={`${inputClassName} mt-3`}
                />

                <div className="mt-3 flex flex-col gap-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${question.key}`}
                        checked={question.correctIndex === optionIndex}
                        onChange={() =>
                          updateQuestion(question.key, { correctIndex: optionIndex })
                        }
                        className="h-4 w-4 accent-brand-600"
                        aria-label={`Jawaban benar ke-${optionIndex + 1}`}
                      />
                      <input
                        value={option}
                        onChange={(event) => {
                          const options = [...question.options];
                          options[optionIndex] = event.target.value;
                          updateQuestion(question.key, { options });
                        }}
                        placeholder={`Pilihan ${optionIndex + 1}`}
                        className={inputClassName}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(question, optionIndex)}
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
                        disabled={question.options.length <= 2}
                        aria-label={`Hapus pilihan ${optionIndex + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {question.options.length < 6 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateQuestion(question.key, {
                          options: [...question.options, ''],
                        })
                      }
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Tambah Pilihan
                    </Button>
                  ) : null}
                </div>

                <div className="mt-3 grid w-full max-w-64 gap-2 sm:grid-cols-2">
                  <Field label="Poin" htmlFor={`points-${question.key}`}>
                    <input
                      id={`points-${question.key}`}
                      type="number"
                      min={1}
                      value={question.points}
                      onChange={(event) =>
                        updateQuestion(question.key, {
                          points: Number(event.target.value) || 0,
                        })
                      }
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Jawaban benar" htmlFor={`correct-${question.key}`}>
                    <select
                      id={`correct-${question.key}`}
                      value={question.correctIndex}
                      onChange={(event) =>
                        updateQuestion(question.key, {
                          correctIndex: Number(event.target.value),
                        })
                      }
                      className={inputClassName}
                    >
                      {question.options.map((option, optionIndex) => (
                        <option key={optionIndex} value={optionIndex}>
                          {option || `Pilihan ${optionIndex + 1}`}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {formError ? <Alert tone="error">{formError}</Alert> : null}
      {saveQuiz.error ? <Alert tone="error">{getErrorMessage(saveQuiz.error)}</Alert> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saveQuiz.isPending}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {saveQuiz.isPending ? 'Menyimpan…' : 'Simpan Kuis'}
        </Button>
        <Link to="/lecturer/quizzes">
          <Button variant="outline">Batal</Button>
        </Link>
      </div>
    </form>
  );
}

export default function QuizEditorPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const [searchParams] = useSearchParams();
  const defaultModuleId = searchParams.get('moduleId') ?? undefined;
  const modulesQuery = useAllModules();
  const quizQuery = useQuiz(quizId);
  const questionsQuery = useQuizQuestions(quizId);

  const isLoading = modulesQuery.isLoading || quizQuery.isLoading || questionsQuery.isLoading;
  const error = modulesQuery.error ?? quizQuery.error ?? questionsQuery.error;

  if (isLoading) return <LoadingState label="Memuat kuis…" />;
  if (error) {
    return (
      <ErrorState
        message={getErrorMessage(error)}
        onRetry={() => {
          void modulesQuery.refetch();
          void quizQuery.refetch();
          void questionsQuery.refetch();
        }}
      />
    );
  }

  const modules = modulesQuery.data ?? [];
  if (modules.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-6 text-center">
          <h1 className="text-xl font-bold text-slate-900">Belum ada modul</h1>
          <p className="mt-2 text-sm text-slate-600">
            Buat modul terlebih dahulu sebelum membuat kuis.
          </p>
          <div className="mt-4">
            <Link to="/lecturer/modules">
              <Button>Kelola Modul</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (quizId && !quizQuery.data) return <Navigate to="/lecturer/quizzes" replace />;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link
          to="/lecturer/quizzes"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Kembali ke daftar kuis
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          {quizQuery.data ? 'Edit Kuis' : 'Buat Kuis'}
        </h1>
      </div>

      <QuizForm
        key={quizId ?? 'new'}
        quiz={quizQuery.data ?? null}
        questions={questionsQuery.data ?? []}
        modules={modules}
        defaultModuleId={defaultModuleId}
      />
    </div>
  );
}
