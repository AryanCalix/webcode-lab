import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Badge, Card, EmptyState, ErrorState, LoadingState } from '../../components/ui';
import { useModules } from '../../features/modules/hooks';
import { useQuizzesWithAttempts } from '../../features/quizzes/hooks';
import { getErrorMessage } from '../../lib/errors';
import { formatDate } from '../../lib/format';

export default function QuizListPage() {
  const { user } = useAuth();
  const { quizzes, isLoading, error, refetch } = useQuizzesWithAttempts(user?.id);
  const modulesQuery = useModules();

  if (isLoading || modulesQuery.isLoading) return <LoadingState label="Memuat kuis…" />;
  if (error || modulesQuery.error) {
    return (
      <ErrorState
        message={getErrorMessage(error ?? modulesQuery.error)}
        onRetry={refetch}
      />
    );
  }

  const moduleTitles = new Map((modulesQuery.data ?? []).map((module) => [module.id, module.title]));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Kuis</h1>
        <p className="mt-2 text-sm text-slate-600">
          Kerjakan kuis yang telah dipublikasikan oleh dosen. Nilai dihitung di server.
        </p>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState title="Belum ada kuis" description="Kuis akan muncul setelah dosen mempublikasikannya." />
      ) : (
        <div className="grid gap-4">
          {quizzes.map(({ quiz, bestScore, attemptCount }) => (
            <Card key={quiz.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">{quiz.title}</h2>
                    {bestScore !== null ? (
                      <Badge tone={bestScore >= 70 ? 'green' : 'amber'}>
                        Nilai terbaik: {bestScore}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{quiz.description}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {moduleTitles.get(quiz.module_id) ?? 'Modul'} ·{' '}
                    {quiz.duration_minutes ? `${quiz.duration_minutes} menit` : 'tanpa batas waktu'} ·{' '}
                    {quiz.deadline_at ? `tenggat ${formatDate(quiz.deadline_at)}` : 'tanpa tenggat'} ·{' '}
                    {attemptCount} percobaan
                  </p>
                </div>
                <Link
                  to={`/student/quizzes/${quiz.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  <ClipboardList className="h-4 w-4" aria-hidden="true" />
                  {bestScore !== null ? 'Kerjakan Lagi' : 'Kerjakan Kuis'}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
