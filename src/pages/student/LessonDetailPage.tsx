import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, PencilLine } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Markdown } from '../../components/Markdown';
import { Alert, Badge, Button, Card, ErrorState, LoadingState } from '../../components/ui';
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
  const exercise = detail?.exerciseByLessonId.get(lesson.id) ?? null;
  const lessonIndex = detail?.lessons.findIndex((item) => item.id === lesson.id) ?? -1;
  const nextLesson =
    detail && lessonIndex >= 0 ? detail.lessons[lessonIndex + 1] ?? null : null;
  const nextExercise = nextLesson
    ? detail?.exerciseByLessonId.get(nextLesson.id) ?? null
    : null;
  const nextHref = nextLesson
    ? nextExercise
      ? `/student/playground/${nextExercise.id}`
      : `/student/modules/${module.id}/lessons/${nextLesson.id}`
    : null;
  const videoUrl = safeExternalUrl(lesson.video_url);

  if (lesson.kind === 'exercise') {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-6 text-center">
          <PencilLine className="mx-auto h-8 w-8 text-brand-600" aria-hidden="true" />
          <h1 className="mt-3 text-xl font-bold text-slate-900">{lesson.title}</h1>
          <p className="mt-2 text-sm text-slate-600">
            Pelajaran ini berupa latihan interaktif. Buka editor untuk mengerjakannya.
          </p>
          <div className="mt-5 flex justify-center">
            {exercise ? (
              <Link to={`/student/playground/${exercise.id}`}>
                <Button>Buka Latihan</Button>
              </Link>
            ) : (
              <Link to={`/student/modules/${module.id}`}>
                <Button variant="outline">Kembali ke modul</Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={`/student/modules/${module.id}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke {module.title}
      </Link>

      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="blue">Materi</Badge>
          {isCompleted ? (
            <Badge tone="green">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              Selesai
            </Badge>
          ) : null}
        </div>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">{lesson.title}</h1>

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

        <div className="mt-5 border-t border-slate-200 pt-5">
          {lesson.content.trim() ? (
            <Markdown>{lesson.content}</Markdown>
          ) : (
            <p className="text-sm text-slate-500">Materi belum memiliki konten.</p>
          )}
        </div>

        {completeLesson.error ? (
          <div className="mt-5">
            <Alert tone="error">{getErrorMessage(completeLesson.error)}</Alert>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
          {isCompleted ? (
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Anda sudah menyelesaikan materi ini.
            </p>
          ) : (
            <Button
              onClick={() => completeLesson.mutate()}
              disabled={completeLesson.isPending}
            >
              {completeLesson.isPending ? 'Menyimpan…' : 'Tandai Selesai'}
            </Button>
          )}

          {nextHref ? (
            <Link
              to={nextHref}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {nextLesson?.kind === 'exercise' ? 'Lanjut ke latihan' : 'Pelajaran berikutnya'}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <Link
              to={`/student/modules/${module.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-400"
            >
              Kembali ke modul
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
