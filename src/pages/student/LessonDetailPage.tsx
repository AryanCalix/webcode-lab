import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Lock,
  PencilLine,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Markdown } from '../../components/Markdown';
import { ProgressRing } from '../../components/ProgressRing';
import { Alert, Badge, Button, Card, ErrorState, LoadingState, ProgressBar } from '../../components/ui';
import { useCompleteLesson, useLessonDetail, useModuleDetail } from '../../features/modules/hooks';
import { getErrorMessage } from '../../lib/errors';
import { safeExternalUrl } from '../../lib/format';

export default function LessonDetailPage() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
  const { user } = useAuth();
  const { lesson, module, isCompleted, isLoading, error } = useLessonDetail(lessonId, user?.id);
  const moduleState = useModuleDetail(moduleId, user?.id);
  const completeLesson = useCompleteLesson(user?.id, moduleId, lessonId);

  if (isLoading || moduleState.isLoading) return <LoadingState label="Memuat materi…" />;
  if (error || moduleState.error) {
    return (
      <ErrorState
        message={getErrorMessage(error ?? moduleState.error)}
        onRetry={moduleState.refetch}
      />
    );
  }
  if (!lesson || !module) return <Navigate to="/student/modules" replace />;

  const detail = moduleState.detail;
  const lessons = detail?.lessons ?? [];
  const completedIds = detail?.completedLessonIds ?? new Set<string>();
  const lessonIndex = lessons.findIndex((item) => item.id === lesson.id);
  const previousLesson = lessonIndex > 0 ? lessons[lessonIndex - 1] : undefined;
  const nextLesson = lessonIndex >= 0 ? lessons[lessonIndex + 1] : undefined;
  const nextExercise = nextLesson
    ? detail?.exerciseByLessonId.get(nextLesson.id) ?? null
    : null;
  const nextHref = nextLesson
    ? nextExercise
      ? `/student/playground/${nextExercise.id}`
      : `/student/modules/${module.id}/lessons/${nextLesson.id}`
    : null;
  const exercise = detail?.exerciseByLessonId.get(lesson.id) ?? null;
  const videoUrl = safeExternalUrl(lesson.video_url);
  const isLocked =
    lessonIndex > 0 && lessons.slice(0, lessonIndex).some((item) => !completedIds.has(item.id));
  const percent = detail?.progress?.progress_percent ?? 0;

  if (isLocked) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link
          to={`/student/modules/${module.id}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke {module.title}
        </Link>
        <Card className="p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Lock className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Pelajaran masih terkunci</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
            Selesaikan pelajaran sebelumnya terlebih dahulu. Urutan belajar dibuat agar kamu
            menguasai dasar sebelum melanjutkan.
          </p>
          <div className="mt-5 flex justify-center">
            <Link to={`/student/modules/${module.id}`}>
              <Button>Lihat jalur belajar</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (lesson.kind === 'exercise') {
    return (
      <div className="mx-auto max-w-2xl">
        <Link
          to={`/student/modules/${module.id}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke {module.title}
        </Link>
        <Card className="p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <PencilLine className="h-7 w-7" aria-hidden="true" />
          </span>
          <Badge tone="blue" className="mt-4">
            Latihan interaktif
          </Badge>
          <h1 className="mt-3 text-xl font-bold text-slate-900">{lesson.title}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
            Pelajaran ini berupa latihan coding. Buka editor untuk menulis HTML, CSS, atau
            JavaScript dan periksa jawabanmu secara otomatis.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {exercise ? (
              <Link to={`/student/playground/${exercise.id}`}>
                <Button>Buka Latihan</Button>
              </Link>
            ) : (
              <Link to={`/student/modules/${module.id}`}>
                <Button variant="outline">Kembali ke modul</Button>
              </Link>
            )}
            {nextHref && isCompleted ? (
              <Link to={nextHref}>
                <Button variant="outline">
                  Pelajaran berikutnya
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
            ) : null}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Link
        to={`/student/modules/${module.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke {module.title}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
        <div>
          <Card className="overflow-hidden">
            <div className="hero-mesh p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="blue">Materi</Badge>
                {isCompleted ? (
                  <Badge tone="green">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                    Selesai
                  </Badge>
                ) : (
                  <Badge tone="amber">Sedang dipelajari</Badge>
                )}
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {lesson.title}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Pelajaran {lessonIndex + 1} dari {lessons.length} di modul {module.title}.
              </p>
              {videoUrl ? (
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
                >
                  Tonton video pendukung
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : null}
            </div>

            <div className="p-6">
              {lesson.content.trim() ? (
                <Markdown>{lesson.content}</Markdown>
              ) : (
                <p className="text-sm text-slate-500">Materi belum memiliki konten.</p>
              )}

              {exercise ? (
                <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50/70 p-4">
                  <p className="text-sm font-semibold text-brand-900">Latihan untuk materi ini</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Uji pemahamanmu dengan menulis HTML, CSS, atau JavaScript di playground.
                  </p>
                  <Link
                    to={`/student/playground/${exercise.id}`}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    Buka latihan
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              ) : null}

              {completeLesson.error ? (
                <div className="mt-5">
                  <Alert tone="error">{getErrorMessage(completeLesson.error)}</Alert>
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
                {isCompleted ? (
                  <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Kamu sudah menyelesaikan materi ini.
                  </p>
                ) : (
                  <Button
                    onClick={() => completeLesson.mutate()}
                    disabled={completeLesson.isPending}
                  >
                    {completeLesson.isPending ? 'Menyimpan…' : 'Tandai Selesai'}
                  </Button>
                )}

                {nextHref && isCompleted ? (
                  <Link
                    to={nextHref}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    {nextLesson?.kind === 'exercise' ? 'Lanjut ke latihan' : 'Pelajaran berikutnya'}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : nextHref ? (
                  <span className="text-xs text-slate-500">
                    Tandai materi ini selesai untuk membuka pelajaran berikutnya.
                  </span>
                ) : (
                  <Link
                    to={`/student/modules/${module.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-brand-400"
                  >
                    Kembali ke modul
                  </Link>
                )}
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Progres modul
              </h2>
              <ProgressRing value={percent} size={52} strokeWidth={6} />
            </div>
            <div className="mt-2">
              <ProgressBar value={percent} />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              {detail?.progress?.completed_lessons ?? 0} dari {lessons.length} pelajaran selesai
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Jalur belajar
            </h2>
            <ol className="mt-3 space-y-1">
              {lessons.map((item, index) => {
                const completed = completedIds.has(item.id);
                const unlocked = lessons
                  .slice(0, index)
                  .every((previous) => completedIds.has(previous.id));
                const itemExercise = detail?.exerciseByLessonId.get(item.id);
                const href =
                  item.kind === 'exercise' && itemExercise
                    ? `/student/playground/${itemExercise.id}`
                    : `/student/modules/${module.id}/lessons/${item.id}`;
                const isCurrent = item.id === lesson.id;

                return (
                  <li key={item.id}>
                    {unlocked ? (
                      <Link
                        to={href}
                        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                          isCurrent
                            ? 'bg-brand-50 font-semibold text-brand-800'
                            : 'text-slate-600 hover:bg-cream-50'
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            completed
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {completed ? '✓' : index + 1}
                        </span>
                        <span className="truncate">{item.title}</span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-400">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100">
                          <Lock className="h-3 w-3" aria-hidden="true" />
                        </span>
                        <span className="truncate">{item.title}</span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </Card>

          {previousLesson ? (
            <Link
              to={
                detail?.exerciseByLessonId.get(previousLesson.id)
                  ? `/student/playground/${detail.exerciseByLessonId.get(previousLesson.id)?.id}`
                  : `/student/modules/${module.id}/lessons/${previousLesson.id}`
              }
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 hover:border-brand-300"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="truncate">{previousLesson.title}</span>
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
