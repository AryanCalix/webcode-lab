import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { modules, type ModuleStatus } from '../../data/demoData';
import { Badge, Card, ProgressBar } from '../../components/ui';

const statusConfig: Record<ModuleStatus, { label: string; tone: 'green' | 'amber' | 'slate' }> = {
  completed: { label: 'Selesai', tone: 'green' },
  'in-progress': { label: 'Sedang dikerjakan', tone: 'amber' },
  'not-started': { label: 'Belum dimulai', tone: 'slate' },
};

export default function ModuleListPage() {
  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Modul Belajar</h1>
        <p className="mt-2 text-sm text-slate-600">
          Pilih modul untuk membuka materi dan lanjutkan praktik coding Anda.
        </p>
      </div>

      <div className="grid gap-4">
        {sortedModules.map((module) => {
          const config = statusConfig[module.status];

          return (
            <Card key={module.id} className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">{module.title}</h2>
                    <Badge tone={config.tone}>{config.label}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{module.description}</p>
                </div>
                <div className="w-full sm:w-56">
                  <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Progres</span>
                    <span>{module.progressPercent}%</span>
                  </div>
                  <ProgressBar value={module.progressPercent} />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm text-slate-500">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  {module.lessons.length} pelajaran
                </p>
                <Link
                  to={`/student/modules/${module.id}`}
                  className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                >
                  {module.status === 'completed' ? 'Lihat kembali' : 'Buka Modul'} →
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
