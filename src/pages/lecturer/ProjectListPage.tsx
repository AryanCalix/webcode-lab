import { Link } from 'react-router-dom';
import { CalendarDays, FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../components/ui';
import { useAllModules } from '../../features/lecturer/hooks';
import {
  useAllProjectSubmissions,
  useDeleteProject,
  useProjects,
  useSetProjectPublished,
} from '../../features/projects/hooks';
import { getErrorMessage } from '../../lib/errors';
import { formatDate } from '../../lib/format';

export default function LecturerProjectListPage() {
  const projectsQuery = useProjects();
  const modulesQuery = useAllModules();
  const submissionsQuery = useAllProjectSubmissions();
  const deleteProject = useDeleteProject();
  const setPublished = useSetProjectPublished();

  const isLoading =
    projectsQuery.isLoading || modulesQuery.isLoading || submissionsQuery.isLoading;
  const error = projectsQuery.error ?? modulesQuery.error ?? submissionsQuery.error;

  if (isLoading) return <LoadingState label="Memuat proyek…" />;
  if (error) {
    return (
      <ErrorState
        message={getErrorMessage(error)}
        onRetry={() => {
          void projectsQuery.refetch();
          void modulesQuery.refetch();
          void submissionsQuery.refetch();
        }}
      />
    );
  }

  const moduleTitles = new Map(
    (modulesQuery.data ?? []).map((module) => [module.id, module.title] as const),
  );
  const submissionsByProject = new Map<string, { total: number; graded: number }>();
  for (const submission of submissionsQuery.data ?? []) {
    const current = submissionsByProject.get(submission.project_id) ?? { total: 0, graded: 0 };
    current.total += 1;
    if (submission.score !== null) current.graded += 1;
    submissionsByProject.set(submission.project_id, current);
  }

  const projects = [...(projectsQuery.data ?? [])].sort(
    (a, b) => a.module_id.localeCompare(b.module_id) || a.title.localeCompare(b.title),
  );

  const handleDelete = (projectId: string, title: string) => {
    const confirmed = window.confirm(
      `Hapus proyek “${title}”? Semua pengumpulan dan nilai proyek akan ikut terhapus.`,
    );
    if (!confirmed) return;
    deleteProject.mutate(projectId);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Proyek"
        title="Manajemen Proyek"
        description="Buat proyek mini, atur tenggat, publikasikan, dan nilai pengumpulan mahasiswa."
        action={
          <Link to="/lecturer/projects/new">
            <Button>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Buat Proyek
            </Button>
          </Link>
        }
      />

      {deleteProject.error ? (
        <div className="mb-4">
          <Alert tone="error">{getErrorMessage(deleteProject.error)}</Alert>
        </div>
      ) : null}
      {setPublished.error ? (
        <div className="mb-4">
          <Alert tone="error">{getErrorMessage(setPublished.error)}</Alert>
        </div>
      ) : null}

      {projects.length === 0 ? (
        <EmptyState
          illustration="projects"
          title="Belum ada proyek"
          description="Buat proyek pertama untuk modul yang sudah tersedia."
          action={
            <Link to="/lecturer/projects/new">
              <Button>Buat Proyek</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => {
            const stats = submissionsByProject.get(project.id) ?? { total: 0, graded: 0 };
            return (
              <Card key={project.id} className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">{project.title}</h2>
                      <Badge tone={project.is_published ? 'green' : 'slate'}>
                        {project.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {project.description || 'Tanpa deskripsi.'}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <FolderKanban className="h-3.5 w-3.5" aria-hidden="true" />
                        {moduleTitles.get(project.module_id) ?? 'Modul tidak ditemukan'}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                        {project.deadline_at ? formatDate(project.deadline_at) : 'Tanpa tenggat'}
                      </span>
                      <span>
                        {stats.total} pengumpulan · {stats.graded} dinilai
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPublished.mutate({
                          projectId: project.id,
                          isPublished: !project.is_published,
                        })
                      }
                      disabled={setPublished.isPending}
                    >
                      {project.is_published ? 'Jadikan draft' : 'Publikasikan'}
                    </Button>
                    <Link to={`/lecturer/projects/${project.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(project.id, project.title)}
                      disabled={deleteProject.isPending}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Hapus
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900">
        <p className="font-semibold">Penilaian proyek</p>
        <p className="mt-1 leading-relaxed">
          Nilai proyek (0–100) dan umpan balik diisi dari halaman{' '}
          <Link to="/lecturer/results" className="font-semibold underline">
            Hasil &amp; Nilai
          </Link>
          . Nilai proyek menyumbang 50% dari nilai akhir mahasiswa.
        </p>
      </div>
    </div>
  );
}
