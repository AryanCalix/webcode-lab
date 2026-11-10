import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Badge, Card, EmptyState, ErrorState, LoadingState, ProgressBar } from '../../components/ui';
import { useModulesWithProgress } from '../../features/modules/hooks';
import { getErrorMessage } from '../../lib/errors';

export default function ModuleListPage() {
  const { user } = useAuth();
  const { modules, isLoading, error, refetch } = useModulesWithProgress(user?.id);

  if (isLoading) return <LoadingState label="Memuat modul…" />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Modul Belajar</h1>
        <p className="mt-2 text-sm text-slate-600">
          Pilih modul untuk membuka materi dan lanjutkan praktik coding Anda.
        </p>
      </div>

      {modules.length === 0 ? (
        <EmptyState
          title="Belum ada modul"
          description="Modul akan muncul setelah dosen mempublikasikannya."
        />
      ) : (
        <div className="grid gap-4">
          {modules.map((module) => {
            const percent = module.progress?.progress_percent ?? 0;
            const isComplete = percent >= 100;
            const isInProgress = percent > 0 && !isComplete;

            return (
              <Card key={module.id} className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">{module.title}</h2>
                      <Badge tone={isComplete ? 'green' : isInProgress ? 'amber' : 'slate'}>
                        {isComplete ? 'Selesai' : isInProgress ? 'Sedang dikerjakan' : 'Belum dimulai'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{module.description}</p>
                  </div>
                  <div className="w-full sm:w-56">
                    <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
                      <span>Progres</span>
                      <span>{percent}%</span>
                    </div>
                    <ProgressBar value={percent} />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-sm text-slate-500">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    {module.progress?.completed_lessons ?? 0} dari {module.progress?.total_lessons ?? '—'}{' '}
                    pelajaran selesai
                  </p>
                  <Link
                    to={`/student/modules/${module.id}`}
                    className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                  >
                    {isComplete ? 'Lihat kembali' : 'Buka Modul'} →
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
