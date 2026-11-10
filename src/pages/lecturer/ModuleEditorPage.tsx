import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Pencil, PencilLine, Plus, Trash2 } from 'lucide-react';
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
} from '../../features/lecturer/hooks';
import { getErrorMessage } from '../../lib/errors';

export default function ModuleEditorPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const modulesQuery = useAllModules();
  const lessonsQuery = useModuleLessons(moduleId);
  const deleteLesson = useDeleteLesson(moduleId);

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

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/lecturer/modules"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke daftar modul
      </Link>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{module.title}</h1>
              <Badge tone={module.is_published ? 'green' : 'slate'}>
                {module.is_published ? 'Published' : 'Draft'}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-slate-600">{module.description}</p>
          </div>
          <Link to={`/lecturer/modules/${module.id}/lessons/new`}>
            <Button>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Tambah Pelajaran
            </Button>
          </Link>
        </div>
      </Card>

      {deleteLesson.error ? (
        <div className="mt-4"><Alert tone="error">{getErrorMessage(deleteLesson.error)}</Alert></div>
      ) : null}

      <div className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Pelajaran ({lessons.length})</h2>

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
              {lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
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
                      <p className="truncate text-sm font-semibold text-slate-900">{lesson.title}</p>
                      <p className="text-xs text-slate-500">
                        Urutan {lesson.order_index} ·{' '}
                        {lesson.kind === 'exercise' ? 'Latihan' : 'Materi'} ·{' '}
                        {lesson.is_published ? 'Published' : 'Draft'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
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
      </div>
    </div>
  );
}
