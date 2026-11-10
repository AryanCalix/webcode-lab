import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import {
  Alert,
  Button,
  Card,
  ErrorState,
  Field,
  LoadingState,
  inputClassName,
} from '../../components/ui';
import { useAllModules } from '../../features/lecturer/hooks';
import { useProject, useSaveProject } from '../../features/projects/hooks';
import type { ModuleRow, ProjectRow } from '../../lib/database.types';
import { getErrorMessage } from '../../lib/errors';

function toLocalInput(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function ProjectForm({
  project,
  modules,
  defaultModuleId,
}: {
  project: ProjectRow | null;
  modules: ModuleRow[];
  defaultModuleId?: string;
}) {
  const navigate = useNavigate();
  const saveProject = useSaveProject();

  const [title, setTitle] = useState(project?.title ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [moduleId, setModuleId] = useState(
    project?.module_id ??
      (modules.some((module) => module.id === defaultModuleId)
        ? (defaultModuleId as string)
        : (modules[0]?.id ?? '')),
  );
  const [deadlineAt, setDeadlineAt] = useState(toLocalInput(project?.deadline_at ?? null));
  const [isPublished, setIsPublished] = useState(project?.is_published ?? false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (title.trim().length < 3) {
      setFormError('Judul proyek minimal 3 karakter.');
      return;
    }
    if (!moduleId) {
      setFormError('Pilih modul untuk proyek ini.');
      return;
    }

    saveProject.mutate(
      {
        id: project?.id,
        moduleId,
        title: title.trim(),
        description: description.trim(),
        deadlineAt: deadlineAt ? new Date(deadlineAt).toISOString() : null,
        isPublished,
      },
      { onSuccess: () => navigate('/lecturer/projects') },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Card className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Judul proyek" htmlFor="project-title">
            <input
              id="project-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={inputClassName}
              placeholder="Contoh: Landing Page Responsif"
            />
          </Field>
          <Field label="Modul" htmlFor="project-module">
            <select
              id="project-module"
              value={moduleId}
              onChange={(event) => setModuleId(event.target.value)}
              className={inputClassName}
            >
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Deskripsi & instruksi" htmlFor="project-description">
            <textarea
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={6}
              className={inputClassName}
              placeholder="Jelaskan hasil yang diharapkan, kriteria penilaian, dan tautan referensi bila ada."
            />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Tenggat" htmlFor="project-deadline">
            <input
              id="project-deadline"
              type="datetime-local"
              value={deadlineAt}
              onChange={(event) => setDeadlineAt(event.target.value)}
              className={inputClassName}
            />
          </Field>
          <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(event) => setIsPublished(event.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
            Publikasikan proyek untuk mahasiswa
          </label>
        </div>

        <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          Proyek hanya dapat dikumpulkan setelah semua pelajaran modul selesai. Nilai proyek
          menyumbang 50% dari nilai akhir.
        </div>

        {formError ? <div className="mt-4"><Alert tone="error">{formError}</Alert></div> : null}
        {saveProject.error ? (
          <div className="mt-4"><Alert tone="error">{getErrorMessage(saveProject.error)}</Alert></div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={saveProject.isPending}>
            <Save className="h-4 w-4" aria-hidden="true" />
            {saveProject.isPending ? 'Menyimpan…' : 'Simpan Proyek'}
          </Button>
          <Link to="/lecturer/projects">
            <Button variant="outline">Batal</Button>
          </Link>
        </div>
      </Card>
    </form>
  );
}

export default function ProjectEditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const defaultModuleId = searchParams.get('moduleId') ?? undefined;
  const modulesQuery = useAllModules();
  const projectQuery = useProject(projectId);

  const isLoading = modulesQuery.isLoading || projectQuery.isLoading;
  const error = modulesQuery.error ?? projectQuery.error;

  if (isLoading) return <LoadingState label="Memuat proyek…" />;
  if (error) {
    return (
      <ErrorState
        message={getErrorMessage(error)}
        onRetry={() => {
          void modulesQuery.refetch();
          void projectQuery.refetch();
        }}
      />
    );
  }

  const modules = modulesQuery.data ?? [];
  if (modules.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-6 text-center">
          <h1 className="text-xl font-bold text-slate-900">Belum ada modul</h1>
          <p className="mt-2 text-sm text-slate-600">
            Buat modul terlebih dahulu sebelum membuat proyek.
          </p>
          <div className="mt-4">
            <Link to="/lecturer/modules">
              <Button>Kelola Modul</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (projectId && !projectQuery.data) return <Navigate to="/lecturer/projects" replace />;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/lecturer/projects"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke daftar proyek
      </Link>

      <PageHeader
        eyebrow="Proyek"
        title={projectQuery.data ? 'Edit Proyek' : 'Proyek Baru'}
        description="Proyek adalah tugas akhir modul yang dinilai langsung oleh dosen."
      />

      <ProjectForm
        key={projectId ?? 'new'}
        project={projectQuery.data ?? null}
        modules={modules}
        defaultModuleId={defaultModuleId}
      />
    </div>
  );
}
