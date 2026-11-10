import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  ClipboardList,
  FileText,
  FolderKanban,
  PencilLine,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Badge, Card, ErrorState, LoadingState, ProgressBar } from '../../components/ui';
import { useModuleDetail } from '../../features/modules/hooks';
import { getErrorMessage } from '../../lib/errors';
import { formatDate } from '../../lib/format';

export default function ModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { user } = useAuth();
  const { detail, isLoading, error, refetch } = useModuleDetail(moduleId, user?.id);

  if (isLoading) return <LoadingState label="Memuat modul…" />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;
  if (!detail) return <Navigate to="/student/modules" replace />;

  const percent = detail.progress?.progress_percent ?? 0;
  const isComplete = percent >= 100;
  const nextLesson = detail.lessons.find((lesson) => !detail.completedLessonIds.has(lesson.id));
  const nextExercise = nextLesson ? detail.exerciseByLessonId.get(nextLesson.id) : undefined;
  const nextHref = nextLesson
    ? nextExercise
      ? `/student/playground/${nextExercise.id}`
      : `/student/modules/${detail.module.id}/lessons/${nextLesson.id}`
    : null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/student/modules"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke daftar modul
      </Link>

      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{detail.module.title}</h1>
              <Badge tone={isComplete ? 'green' : percent > 0 ? 'amber' : 'slate'}>
                {isComplete ? 'Selesai' : percent > 0 ? 'Sedang dikerjakan' : 'Belum dimulai'}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-slate-600">{detail.module.description}</p>
          </div>
          <div className="w-full sm:w-56">
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Progres</span>
              <span>{percent}%</span>
            </div>
            <ProgressBar value={percent} />
            <p className="mt-1.5 text-xs text-slate-500">
              {detail.progress?.completed_lessons ?? 0} dari {detail.lessons.length} pelajaran
            </p>
          </div>
        </div>

        {nextHref && nextLesson ? (
          <div className="mt-5 rounded-xl bg-brand-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              {percent > 0 ? 'Lanjutkan' : 'Mulai dari sini'}
            </p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">{nextLesson.title}</p>
              <Link
                to={nextHref}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Buka
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-6 border-t border-slate-200 pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Daftar materi
          </h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {detail.lessons.map((lesson) => {
              const exercise = detail.exerciseByLessonId.get(lesson.id);
              const completed = detail.completedLessonIds.has(lesson.id);
              const href =
                lesson.kind === 'exercise' && exercise
                  ? `/student/playground/${exercise.id}`
                  : `/student/modules/${detail.module.id}/lessons/${lesson.id}`;

              return (
                <li key={lesson.id} className="flex items-center gap-3 py-3">
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
                  <div className="min-w-0 flex-1">
                    <Link to={href} className="block">
                      <p className="truncate text-sm font-medium text-slate-900">{lesson.title}</p>
                      <p className="text-xs text-slate-500">
                        {lesson.kind === 'exercise' ? 'Latihan interaktif' : 'Materi teks'}
                      </p>
                    </Link>
                  </div>
                  {completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-label="Selesai" />
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Kuis</h2>
          <div className="mt-3">
            {detail.quizzes.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada kuis untuk modul ini.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {detail.quizzes.map((quiz) => (
                  <li key={quiz.id} className="py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                          <ClipboardList className="h-4 w-4 text-slate-400" aria-hidden="true" />
                          {quiz.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {quiz.duration_minutes ? `${quiz.duration_minutes} menit` : 'Tanpa batas waktu'}
                          {quiz.deadline_at ? ` · Tenggat ${formatDate(quiz.deadline_at)}` : ''}
                        </p>
                      </div>
                      <Link
                        to={`/student/quizzes/${quiz.id}`}
                        className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                      >
                        Kerjakan Kuis →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Proyek</h2>
          <div className="mt-3">
            {detail.projects.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada proyek untuk modul ini.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {detail.projects.map((project) => (
                  <li key={project.id} className="py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                          <FolderKanban className="h-4 w-4 text-slate-400" aria-hidden="true" />
                          {project.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          Tenggat {project.deadline_at ? formatDate(project.deadline_at) : 'tidak ditentukan'}
                        </p>
                      </div>
                      <Link
                        to={`/student/projects/${project.id}`}
                        className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                      >
                        Lihat Proyek →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
