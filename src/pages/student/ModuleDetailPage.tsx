import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderKanban,
  Lock,
  PencilLine,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { ModuleLanguageIcon } from '../../components/ModuleThumbnail';
import { ProgressRing } from '../../components/ProgressRing';
import { Badge, Card, EmptyState, ErrorState, LoadingState, ProgressBar } from '../../components/ui';
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
  const lessons = detail.lessons;
  const materials = lessons.filter((lesson) => lesson.kind === 'material');
  const firstIncompleteIndex = lessons.findIndex(
    (lesson) => !detail.completedLessonIds.has(lesson.id),
  );
  const allLessonsComplete = firstIncompleteIndex === -1;
  const nextLesson = firstIncompleteIndex >= 0 ? lessons[firstIncompleteIndex] : undefined;
  const nextExercise = nextLesson ? detail.exerciseByLessonId.get(nextLesson.id) : undefined;
  const nextHref = nextLesson
    ? nextExercise
      ? `/student/playground/${nextExercise.id}`
      : `/student/modules/${detail.module.id}/lessons/${nextLesson.id}`
    : null;

  const lessonUnlocked = (index: number) =>
    lessons.slice(0, index).every((lesson) => detail.completedLessonIds.has(lesson.id));

  const assessmentLocked = !allLessonsComplete && lessons.length > 0;

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Link
        to="/student/modules"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke daftar modul
      </Link>

      <Card className="overflow-hidden">
        <div className="hero-mesh p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <ModuleLanguageIcon
                title={detail.module.title}
                className="h-14 w-14 rounded-2xl shadow-md"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={isComplete ? 'green' : percent > 0 ? 'amber' : 'slate'}>
                    {isComplete ? 'Modul selesai' : percent > 0 ? 'Sedang berjalan' : 'Belum dimulai'}
                  </Badge>
                  <Badge tone="blue">{lessons.length} pelajaran</Badge>
                </div>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {detail.module.title}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                  {detail.module.description}
                </p>
              </div>
            </div>
            <ProgressRing value={percent} size={112} strokeWidth={10} />
          </div>

          <div className="mt-5 rounded-xl bg-white/70 p-4 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  {percent > 0 ? 'Lanjutkan perjalananmu' : 'Mulai dari sini'}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {nextLesson
                    ? nextLesson.title
                    : isComplete
                      ? 'Semua pelajaran selesai — saatnya kuis & proyek!'
                      : 'Belum ada pelajaran yang dipublikasikan.'}
                </p>
              </div>
              {nextHref ? (
                <Link
                  to={nextHref}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
                >
                  {nextLesson?.kind === 'exercise' ? 'Buka latihan' : 'Buka pelajaran'}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
            <div className="mt-3">
              <ProgressBar value={percent} />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              {detail.progress?.completed_lessons ?? 0} dari {lessons.length} pelajaran selesai
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Daftar materi</h2>
            <span className="text-xs font-medium text-slate-500">{materials.length} materi</span>
          </div>
          <Card className="p-5">
            {materials.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada materi untuk modul ini.</p>
            ) : (
              <ol className="relative space-y-1">
                {materials.map((lesson) => {
                  const lessonIndex = lessons.findIndex((item) => item.id === lesson.id);
                  const unlocked = lessons
                    .slice(0, lessonIndex)
                    .every((item) => detail.completedLessonIds.has(item.id));
                  const href = `/student/modules/${detail.module.id}/lessons/${lesson.id}`;

                  const content = (
                    <div
                      className={`flex items-start gap-3 rounded-xl p-3 transition-colors ${
                        unlocked ? 'hover:bg-cream-50' : 'opacity-60'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          unlocked ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {lessonIndex + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {lesson.title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                          Materi teks
                        </p>
                      </div>
                      <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    </div>
                  );

                  return (
                    <li key={lesson.id}>
                      {unlocked ? (
                        <Link to={href} className="block focus-visible:outline-none">
                          {content}
                        </Link>
                      ) : (
                        <div aria-disabled="true">{content}</div>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </Card>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Jalur belajar</h2>
            <span className="text-xs font-medium text-slate-500">
              {lessons.length - detail.completedLessonIds.size} tersisa
            </span>
          </div>

          {lessons.length === 0 ? (
            <EmptyState
              title="Belum ada pelajaran"
              description="Dosen belum menambahkan pelajaran untuk modul ini."
            />
          ) : (
            <Card className="p-5">
              <ol className="relative space-y-1">
                {lessons.map((lesson, index) => {
                  const completed = detail.completedLessonIds.has(lesson.id);
                  const unlocked = lessonUnlocked(index);
                  const isCurrent = index === firstIncompleteIndex;
                  const exercise = detail.exerciseByLessonId.get(lesson.id);
                  const href =
                    lesson.kind === 'exercise' && exercise
                      ? `/student/playground/${exercise.id}`
                      : `/student/modules/${detail.module.id}/lessons/${lesson.id}`;

                  const content = (
                    <div
                      className={`flex items-start gap-3 rounded-xl p-3 transition-colors ${
                        unlocked ? 'hover:bg-cream-50' : 'opacity-60'
                      } ${isCurrent ? 'bg-brand-50/80 ring-1 ring-brand-100' : ''}`}
                    >
                      <span
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          completed
                            ? 'bg-emerald-100 text-emerald-700'
                            : unlocked
                              ? 'bg-brand-100 text-brand-700'
                              : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {completed ? (
                          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                        ) : unlocked ? (
                          index + 1
                        ) : (
                          <Lock className="h-4 w-4" aria-hidden="true" />
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {lesson.title}
                          </p>
                          {isCurrent && !completed ? <Badge tone="amber">Sekarang</Badge> : null}
                        </div>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                          {lesson.kind === 'exercise' ? (
                            <PencilLine className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                          {lesson.kind === 'exercise' ? 'Latihan interaktif' : 'Materi teks'}
                          {!unlocked ? ' · Terkunci' : ''}
                        </p>
                      </div>

                      {unlocked ? (
                        <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                      ) : null}
                    </div>
                  );

                  return (
                    <li key={lesson.id}>
                      {unlocked ? (
                        <Link to={href} className="block focus-visible:outline-none">
                          {content}
                        </Link>
                      ) : (
                        <div aria-disabled="true">{content}</div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </Card>
          )}
        </section>

        <aside className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Kuis</h2>
              <ClipboardList className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>

            {assessmentLocked ? (
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                <p className="flex items-center gap-2 font-semibold text-slate-700">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  Terkunci
                </p>
                <p className="mt-1 text-xs leading-relaxed">
                  Selesaikan semua pelajaran untuk membuka kuis modul ini.
                </p>
              </div>
            ) : null}

            <div className="mt-3">
              {detail.quizzes.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada kuis untuk modul ini.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {detail.quizzes.map((quiz) => (
                    <li key={quiz.id} className="py-3 first:pt-0 last:pb-0">
                      <p className="text-sm font-semibold text-slate-900">{quiz.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {quiz.duration_minutes
                          ? `${quiz.duration_minutes} menit`
                          : 'Tanpa batas waktu'}
                        {quiz.deadline_at ? ` · Tenggat ${formatDate(quiz.deadline_at)}` : ''}
                      </p>
                      {!assessmentLocked ? (
                        <Link
                          to={`/student/quizzes/${quiz.id}`}
                          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
                        >
                          Kerjakan kuis
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Proyek</h2>
              <FolderKanban className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </div>

            {assessmentLocked ? (
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                <p className="flex items-center gap-2 font-semibold text-slate-700">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  Terkunci
                </p>
                <p className="mt-1 text-xs leading-relaxed">
                  Proyek modul terbuka setelah semua pelajaran selesai.
                </p>
              </div>
            ) : null}

            <div className="mt-3">
              {detail.projects.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada proyek untuk modul ini.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {detail.projects.map((project) => (
                    <li key={project.id} className="py-3 first:pt-0 last:pb-0">
                      <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Tenggat {project.deadline_at ? formatDate(project.deadline_at) : 'tidak ditentukan'}
                      </p>
                      {!assessmentLocked ? (
                        <Link
                          to={`/student/projects/${project.id}`}
                          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
                        >
                          Lihat proyek
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
