import { Link } from 'react-router-dom';
import { CheckCircle2, FolderKanban } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Badge, Card, EmptyState, ErrorState, LoadingState } from '../../components/ui';
import { useModules } from '../../features/modules/hooks';
import { useProjectsWithSubmissions } from '../../features/projects/hooks';
import { getErrorMessage } from '../../lib/errors';
import { formatDate, formatDateTime } from '../../lib/format';

export default function ProjectListPage() {
  const { user } = useAuth();
  const { projects, isLoading, error, refetch } = useProjectsWithSubmissions(user?.id);
  const modulesQuery = useModules();

  if (isLoading || modulesQuery.isLoading) return <LoadingState label="Memuat proyek…" />;
  if (error || modulesQuery.error) {
    return <ErrorState message={getErrorMessage(error ?? modulesQuery.error)} onRetry={refetch} />;
  }

  const moduleTitles = new Map((modulesQuery.data ?? []).map((module) => [module.id, module.title]));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Proyek Mini</h1>
        <p className="mt-2 text-sm text-slate-600">
          Kumpulkan hasil proyek mini Anda untuk mempraktikkan pemrograman secara lebih nyata.
        </p>
      </div>

      {projects.length === 0 ? (
        <EmptyState title="Belum ada proyek" description="Proyek akan muncul setelah dosen mempublikasikannya." />
      ) : (
        <div className="grid gap-4">
          {projects.map(({ project, submission }) => (
            <Card key={project.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">{project.title}</h2>
                    {submission ? (
                      <Badge tone="green">
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                        Sudah dikumpulkan
                      </Badge>
                    ) : (
                      <Badge tone="slate">Belum dikumpulkan</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{project.description}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {moduleTitles.get(project.module_id) ?? 'Modul'} · Tenggat{' '}
                    {project.deadline_at ? formatDate(project.deadline_at) : 'tidak ditentukan'}
                    {submission ? ` · Dikumpulkan ${formatDateTime(submission.submitted_at)}` : ''}
                  </p>
                </div>
                <Link
                  to={`/student/projects/${project.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  <FolderKanban className="h-4 w-4" aria-hidden="true" />
                  {submission ? 'Lihat Pengumpulan' : 'Lihat Proyek'}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
