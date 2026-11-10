import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, FolderKanban, Lock, Trophy } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { PageHeader } from '../../components/PageHeader';
import { Badge, Card, EmptyState, ErrorState, LoadingState, ProgressBar } from '../../components/ui';
import { useModulesWithProgress } from '../../features/modules/hooks';
import { useProjectsWithSubmissions } from '../../features/projects/hooks';
import { getErrorMessage } from '../../lib/errors';
import { formatDate, formatDateTime } from '../../lib/format';
import { gradeTone } from '../../lib/grading';

export default function ProjectListPage() {
  const { user } = useAuth();
  const { projects, isLoading, error, refetch } = useProjectsWithSubmissions(user?.id);
  const modulesState = useModulesWithProgress(user?.id);

  if (isLoading || modulesState.isLoading) return <LoadingState label="Memuat proyek…" />;
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
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        eyebrow="Tugas akhir modul"
        title="Proyek Mini"
        description="Proyek terbuka setelah semua pelajaran modul selesai. Kumpulkan hasil kerjamu dan lihat nilai serta umpan balik dosen."
      />

      {projects.length === 0 ? (
        <EmptyState
          illustration="projects"
          title="Belum ada proyek"
          description="Proyek akan muncul setelah dosen mempublikasikannya."
        />
      ) : (
        <div className="grid gap-4">
          {projects.map(({ project, submission }) => {
            const module = modules.get(project.module_id);
            const modulePercent = module?.progress?.progress_percent ?? 0;
            const locked = Boolean(module && module.lessonCount > 0 && modulePercent < 100);

            return (
              <Card key={project.id} className="hover-lift overflow-hidden">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">{project.title}</h2>
                      {locked ? (
                        <Badge tone="slate">
                          <Lock className="mr-1 h-3 w-3" aria-hidden="true" />
                          Terkunci
                        </Badge>
                      ) : submission ? (
                        <Badge tone="green">
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                          Sudah dikumpulkan
                        </Badge>
                      ) : (
                        <Badge tone="amber">Belum dikumpulkan</Badge>
                      )}
                      {submission?.score != null ? (
                        <Badge tone={gradeTone(submission.score)}>
                          <Trophy className="mr-1 h-3 w-3" aria-hidden="true" />
                          Nilai {submission.score}
                        </Badge>
                      ) : null}
                    </div>

                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{project.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {module?.title ?? 'Modul'} · Tenggat{' '}
                      {project.deadline_at ? formatDate(project.deadline_at) : 'tidak ditentukan'}
                      {submission ? ` · Dikumpulkan ${formatDateTime(submission.submitted_at)}` : ''}
                    </p>

                    {locked ? (
                      <div className="mt-3 rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-700">
                          Selesaikan modul untuk membuka proyek
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
                        to={`/student/modules/${project.module_id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-brand-400"
                      >
                        Buka modul
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    ) : (
                      <Link
                        to={`/student/projects/${project.id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                      >
                        <FolderKanban className="h-4 w-4" aria-hidden="true" />
                        {submission ? 'Lihat pengumpulan' : 'Buka proyek'}
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
