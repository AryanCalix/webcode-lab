import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ClipboardList,
  Eye,
  FileText,
  FolderKanban,
  Pencil,
  PencilLine,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { Markdown } from '../../components/Markdown';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../components/ui';
import {
  useAllModules,
  useDeleteLesson,
  useModuleLessons,
  useReorderLessons,
  useSetLessonPublished,
} from '../../features/lecturer/hooks';
import { useSetProjectPublished, useProjects } from '../../features/projects/hooks';
import { useSetQuizPublished, useQuizzes } from '../../features/quizzes/hooks';
import type { LessonRow } from '../../lib/database.types';
import { getErrorMessage } from '../../lib/errors';
import { formatDate, safeExternalUrl } from '../../lib/format';

function LessonPreview({
  lesson,
  onClose,
}: {
  lesson: LessonRow;
  onClose: () => void;
}) {
  const videoUrl = safeExternalUrl(lesson.video_url);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Pratinjau ${lesson.title}`}
    >
      <div className="flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              Pratinjau mahasiswa
            </p>
            <h2 className="truncate text-lg font-bold text-slate-900">{lesson.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Tutup pratinjau"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge tone={lesson.kind === 'exercise' ? 'amber' : 'blue'}>
              {lesson.kind === 'exercise' ? 'Latihan interaktif' : 'Materi teks'}
            </Badge>
            <Badge tone={lesson.is_published ? 'green' : 'slate'}>
              {lesson.is_published ? 'Published' : 'Draft'}
            </Badge>
          </div>
          {videoUrl ? (
            <p className="mb-4 text-sm">
              Video pendukung:{' '}
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-brand-700 underline"
              >
                buka tautan
              </a>
            </p>
          ) : null}
          {lesson.content.trim() ? (
            <Markdown>{lesson.content}</Markdown>
          ) : (
            <p className="text-sm text-slate-500">Materi belum memiliki konten.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ModuleEditorPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const modulesQuery = useAllModules();
  const lessonsQuery = useModuleLessons(moduleId);
  const deleteLesson = useDeleteLesson(moduleId);
  const reorderLessons = useReorderLessons(moduleId);
  const setLessonPublished = useSetLessonPublished(moduleId);
  const quizzesQuery = useQuizzes();
  const projectsQuery = useProjects();
  const setQuizPublished = useSetQuizPublished();
  const setProjectPublished = useSetProjectPublished();
  const [previewLesson, setPreviewLesson] = useState<LessonRow | null>(null);

  const moduleQuizzes = useMemo(
    () => (quizzesQuery.data ?? []).filter((quiz) => quiz.module_id === moduleId),
    [quizzesQuery.data, moduleId],
  );
  const moduleProjects = useMemo(
    () => (projectsQuery.data ?? []).filter((project) => project.module_id === moduleId),
    [projectsQuery.data, moduleId],
  );

  if (modulesQuery.isLoading || lessonsQuery.isLoading) {
    return <LoadingState label="Memuat modul…" />;
  }

  if (modulesQuery.error || lessonsQuery.error) {
    return (
      <ErrorState
        message={getErrorMessage(modulesQuery.error ?? lessonsQuery.error)}
        onRetry={() => {
          void modulesQuery.refetch();
          void lessonsQuery.refetch();
        }}
      />
    );
  }

  const module = (modulesQuery.data ?? []).find((item) => item.id === moduleId);
  if (!module) return <Navigate to="/lecturer/modules" replace />;

  const lessons = lessonsQuery.data ?? [];

  const handleDelete = (lessonId: string, title: string) => {
    const confirmed = window.confirm(`Hapus pelajaran “${title}”?`);
    if (!confirmed) return;
    deleteLesson.mutate(lessonId);
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= lessons.length) return;

    const ids = lessons.map((lesson) => lesson.id);
    const current = ids[index];
    const other = ids[target];
    if (!current || !other) return;
    ids[index] = other;
    ids[target] = current;

    reorderLessons.mutate(ids);
  };

  const mutationError =
    deleteLesson.error ??
    reorderLessons.error ??
    setLessonPublished.error ??
    setQuizPublished.error ??
    setProjectPublished.error;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/lecturer/modules"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke daftar modul
      </Link>

      <Card className="overflow-hidden">
        <div className="hero-mesh p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{module.title}</h1>
                <Badge tone={module.is_published ? 'green' : 'slate'}>
                  {module.is_published ? 'Published' : 'Draft'}
                </Badge>
                <Badge tone="blue">{lessons.length} pelajaran</Badge>
              </div>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                {module.description}
              </p>
            </div>
            <Link to={`/lecturer/modules/${module.id}/lessons/new`}>
              <Button>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Tambah Pelajaran
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {mutationError ? (
        <div className="mt-4">
          <Alert tone="error">{getErrorMessage(mutationError)}</Alert>
        </div>
      ) : null}

      <section className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Pelajaran ({lessons.length})
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Urutan pelajaran menentukan kunci akses mahasiswa. Gunakan tombol panah untuk
              menggeser.
            </p>
          </div>
        </div>

        {lessons.length === 0 ? (
          <EmptyState
            title="Belum ada pelajaran"
            description="Tambahkan materi atau latihan pertama untuk modul ini."
            action={
              <Link to={`/lecturer/modules/${module.id}/lessons/new`}>
                <Button>Tambah Pelajaran</Button>
              </Link>
            }
          />
        ) : (
          <Card className="overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {lessons.map((lesson, index) => (
                <li
                  key={lesson.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleMove(index, -1)}
                        disabled={index === 0 || reorderLessons.isPending}
                        className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30"
                        aria-label={`Naikkan ${lesson.title}`}
                      >
                        <ArrowUp className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, 1)}
                        disabled={index === lessons.length - 1 || reorderLessons.isPending}
                        className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30"
                        aria-label={`Turunkan ${lesson.title}`}
                      >
                        <ArrowDown className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        lesson.kind === 'exercise'
                          ? 'bg-brand-100 text-brand-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {lesson.kind === 'exercise' ? (
                        <PencilLine className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <FileText className="h-4 w-4" aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {index + 1}. {lesson.title}
                        </p>
                        <Badge tone={lesson.is_published ? 'green' : 'slate'}>
                          {lesson.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        {lesson.kind === 'exercise' ? 'Latihan' : 'Materi'} · Urutan{' '}
                        {lesson.order_index + 1}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewLesson(lesson)}
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      Pratinjau
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setLessonPublished.mutate({
                          lessonId: lesson.id,
                          isPublished: !lesson.is_published,
                        })
                      }
                      disabled={setLessonPublished.isPending}
                    >
                      {lesson.is_published ? 'Jadikan draft' : 'Publikasikan'}
                    </Button>
                    <Link to={`/lecturer/modules/${module.id}/lessons/${lesson.id}`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(lesson.id, lesson.title)}
                      disabled={deleteLesson.isPending}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Hapus
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <ClipboardList className="h-5 w-5 text-slate-400" aria-hidden="true" />
                Kuis modul
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Terbuka setelah semua pelajaran selesai.
              </p>
            </div>
            <Link to={`/lecturer/quizzes/new?moduleId=${module.id}`}>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Kuis
              </Button>
            </Link>
          </div>

          {moduleQuizzes.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Belum ada kuis untuk modul ini.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {moduleQuizzes.map((quiz) => (
                <li key={quiz.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{quiz.title}</p>
                    <p className="text-xs text-slate-500">
                      {quiz.deadline_at ? `Tenggat ${formatDate(quiz.deadline_at)}` : 'Tanpa tenggat'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge tone={quiz.is_published ? 'green' : 'slate'}>
                      {quiz.is_published ? 'Published' : 'Draft'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setQuizPublished.mutate({
                          quizId: quiz.id,
                          isPublished: !quiz.is_published,
                        })
                      }
                      disabled={setQuizPublished.isPending}
                    >
                      {quiz.is_published ? 'Draft' : 'Publikasikan'}
                    </Button>
                    <Link
                      to={`/lecturer/quizzes/${quiz.id}/edit`}
                      className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <FolderKanban className="h-5 w-5 text-slate-400" aria-hidden="true" />
                Proyek modul
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Dinilai dosen dan menyumbang 50% nilai akhir.
              </p>
            </div>
            <Link to={`/lecturer/projects/new?moduleId=${module.id}`}>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Proyek
              </Button>
            </Link>
          </div>

          {moduleProjects.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Belum ada proyek untuk modul ini.</p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {moduleProjects.map((project) => (
                <li key={project.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{project.title}</p>
                    <p className="text-xs text-slate-500">
                      {project.deadline_at
                        ? `Tenggat ${formatDate(project.deadline_at)}`
                        : 'Tanpa tenggat'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge tone={project.is_published ? 'green' : 'slate'}>
                      {project.is_published ? 'Published' : 'Draft'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setProjectPublished.mutate({
                          projectId: project.id,
                          isPublished: !project.is_published,
                        })
                      }
                      disabled={setProjectPublished.isPending}
                    >
                      {project.is_published ? 'Draft' : 'Publikasikan'}
                    </Button>
                    <Link
                      to={`/lecturer/projects/${project.id}/edit`}
                      className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                    >
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {previewLesson ? (
        <LessonPreview lesson={previewLesson} onClose={() => setPreviewLesson(null)} />
      ) : null}
    </div>
  );
}
