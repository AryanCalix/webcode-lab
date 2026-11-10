import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { ModuleThumbnail } from '../../components/ModuleThumbnail';
import { PageHeader } from '../../components/PageHeader';
import { ProgressRing } from '../../components/ProgressRing';
import { Badge, Card, EmptyState, ErrorState, LoadingState, ProgressBar } from '../../components/ui';
import { useModulesWithProgress } from '../../features/modules/hooks';
import { getErrorMessage } from '../../lib/errors';

export default function ModuleListPage() {
  const { user } = useAuth();
  const { modules, isLoading, error, refetch } = useModulesWithProgress(user?.id);

  if (isLoading) return <LoadingState label="Memuat modul…" />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  const completed = modules.filter((module) => (module.progress?.progress_percent ?? 0) >= 100);
  const inProgress = modules.filter((module) => {
    const percent = module.progress?.progress_percent ?? 0;
    return percent > 0 && percent < 100;
  });
  const totalLessons = modules.reduce((sum, module) => sum + module.lessonCount, 0);
  const completedLessons = modules.reduce(
    (sum, module) => sum + (module.progress?.completed_lessons ?? 0),
    0,
  );

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        eyebrow="Kurikulum"
        title="Modul Belajar"
        description="Pelajaran disusun berurutan. Selesaikan satu per satu, lalu buka kuis dan proyek di akhir modul."
      />

      <div className="stagger-grid mb-5 grid gap-3 sm:grid-cols-3">
        <Card className="hover-lift flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900">{modules.length}</p>
            <p className="text-xs text-slate-500">modul tersedia</p>
          </div>
        </Card>
        <Card className="hover-lift flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900">{completed.length}</p>
            <p className="text-xs text-slate-500">modul selesai</p>
          </div>
        </Card>
        <Card className="hover-lift flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900">
              {completedLessons}/{totalLessons}
            </p>
            <p className="text-xs text-slate-500">pelajaran selesai</p>
          </div>
        </Card>
      </div>

      {modules.length === 0 ? (
        <EmptyState
          title="Belum ada modul"
          description="Modul akan muncul setelah dosen mempublikasikannya."
        />
      ) : (
        <div className="stagger-grid grid gap-4 md:grid-cols-2">
          {modules.map((module, index) => {
            const percent = module.progress?.progress_percent ?? 0;
            const isComplete = percent >= 100;
            const isInProgress = inProgress.some((item) => item.id === module.id);

            return (
              <Card key={module.id} className="group hover-lift overflow-hidden">
                <ModuleThumbnail title={module.title} orderIndex={index + 1} />

                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Badge tone={isComplete ? 'green' : isInProgress ? 'amber' : 'slate'}>
                        {isComplete ? 'Selesai' : isInProgress ? 'Berjalan' : 'Belum mulai'}
                      </Badge>
                      <h2 className="mt-2 text-lg font-bold text-slate-900">{module.title}</h2>
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-700">
                        {module.description}
                      </p>
                    </div>
                    <ProgressRing value={percent} size={64} strokeWidth={7} />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>
                      {module.progress?.completed_lessons ?? 0} dari {module.lessonCount} pelajaran
                    </span>
                    <span>{percent}%</span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={percent} />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      {isComplete
                        ? 'Kuis dan proyek modul sudah terbuka.'
                        : 'Selesaikan semua pelajaran untuk membuka kuis & proyek.'}
                    </p>
                    <Link
                      to={`/student/modules/${module.id}`}
                      className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
                    >
                      Buka
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </Link>
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
