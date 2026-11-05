import { Link } from 'react-router-dom';
import { FolderKanban } from 'lucide-react';
import { getModuleById, getProjects } from '../../data/demoData';
import { Badge, Card } from '../../components/ui';

export default function ProjectListPage() {
  const projects = getProjects().sort((a, b) => a.id.localeCompare(b.id));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Proyek Mini</h1>
        <p className="mt-2 text-sm text-slate-600">
          Kumpulkan hasil proyek mini Anda untuk mengikuti praktik pemrograman yang lebih nyata.
        </p>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">{project.title}</h2>
                  <Badge tone="slate">Open</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{project.description}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {getModuleById(project.moduleId)?.title ?? 'Modul tidak ditemukan'} · Tenggat{' '}
                  {project.deadlineAt ? new Date(project.deadlineAt).toLocaleDateString('id-ID') : 'tidak ditentukan'}
                </p>
              </div>
              <Link
                to={`/student/projects/${project.id}`}
                className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                <FolderKanban className="mr-2 h-4 w-4" aria-hidden="true" />
                Lihat Proyek
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
