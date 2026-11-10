import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, Lock, Trophy } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { PageHeader } from '../../components/PageHeader';
import { Badge, Card, EmptyState, ErrorState, LoadingState, ProgressBar } from '../../components/ui';
import { useModulesWithProgress } from '../../features/modules/hooks';
import { useQuizzesWithAttempts } from '../../features/quizzes/hooks';
import { getErrorMessage } from '../../lib/errors';
import { formatDate } from '../../lib/format';
import { gradeTone } from '../../lib/grading';

export default function QuizListPage() {
  const { user } = useAuth();
  const { quizzes, isLoading, error, refetch } = useQuizzesWithAttempts(user?.id);
  const modulesState = useModulesWithProgress(user?.id);

  if (isLoading || modulesState.isLoading) return <LoadingState label="Memuat kuis…" />;
  if (error || modulesState.error) {
    return (
      <ErrorState
        message={getErrorMessage(error ?? modulesState.error)}
        onRetry={() => {
          refetch();
          modulesState.refetch();
        }}
      />
    );
  }

  const modules = new Map(modulesState.modules.map((module) => [module.id, module] as const));

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Evaluasi modul"
        title="Kuis"
        description="Kuis terbuka setelah semua pelajaran pada modul selesai. Nilai dihitung di server dan percobaan terbaik dipakai untuk nilai akhir."
      />

      {quizzes.length === 0 ? (
        <EmptyState
          title="Belum ada kuis"
          description="Kuis akan muncul setelah dosen mempublikasikannya."
        />
      ) : (
        <div className="grid gap-4">
          {quizzes.map(({ quiz, bestScore, attemptCount }) => {
            const module = modules.get(quiz.module_id);
            const modulePercent = module?.progress?.progress_percent ?? 0;
            const locked = Boolean(module && module.lessonCount > 0 && modulePercent < 100);

            return (
              <Card key={quiz.id} className="overflow-hidden">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">{quiz.title}</h2>
                      {locked ? (
                        <Badge tone="slate">
                          <Lock className="mr-1 h-3 w-3" aria-hidden="true" />
                          Terkunci
                        </Badge>
                      ) : bestScore !== null ? (
                        <Badge tone={gradeTone(bestScore)}>
                          <Trophy className="mr-1 h-3 w-3" aria-hidden="true" />
                          Terbaik {bestScore}
                        </Badge>
                      ) : (
                        <Badge tone="amber">Belum dikerjakan</Badge>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{quiz.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {module?.title ?? 'Modul'} ·{' '}
                      {quiz.duration_minutes ? `${quiz.duration_minutes} menit` : 'tanpa batas waktu'} ·{' '}
                      {quiz.deadline_at ? `tenggat ${formatDate(quiz.deadline_at)}` : 'tanpa tenggat'} ·{' '}
                      {attemptCount} percobaan
                    </p>

                    {locked ? (
                      <div className="mt-3 rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-700">
                          Selesaikan modul untuk membuka kuis
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <ProgressBar value={modulePercent} className="h-1.5 flex-1" />
                          <span className="text-xs text-slate-500">{modulePercent}%</span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 items-center">
                    {locked ? (
                      <Link
                        to={`/student/modules/${quiz.module_id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-brand-400"
                      >
                        Buka modul
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    ) : (
                      <Link
                        to={`/student/quizzes/${quiz.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                      >
                        <ClipboardList className="h-4 w-4" aria-hidden="true" />
                        {bestScore !== null ? 'Kerjakan lagi' : 'Kerjakan kuis'}
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
