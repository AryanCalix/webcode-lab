import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, PencilLine } from 'lucide-react';
import { getModuleById, getQuizzesByModule } from '../../data/demoData';
import { Badge, Card, ProgressBar } from '../../components/ui';

export default function ModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const module = moduleId ? getModuleById(moduleId) : undefined;

  if (!module) {
    return <Navigate to="/student/modules" replace />;
  }

  const statusLabel =
    module.status === 'completed'
      ? 'Selesai'
      : module.status === 'in-progress'
        ? 'Sedang dikerjakan'
        : 'Belum dimulai';

  const statusTone =
    module.status === 'completed'
      ? ('green' as const)
      : module.status === 'in-progress'
        ? ('amber' as const)
        : ('slate' as const);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/student/modules"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke daftar modul
      </Link>

      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{module.title}</h1>
              <Badge tone={statusTone}>{statusLabel}</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-600">{module.description}</p>
          </div>
          <div className="w-full sm:w-56">
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Progres</span>
              <span>{module.progressPercent}%</span>
            </div>
            <ProgressBar value={module.progressPercent} />
          </div>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Daftar materi
          </h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {module.lessons.map((lesson) => (
              <li key={lesson.id} className="flex items-center gap-3 py-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    lesson.kind === 'exercise'
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {lesson.kind === 'exercise' ? (
                    <PencilLine className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <FileText className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  {lesson.exerciseId ? (
                    <Link
                      to={`/student/playground/${lesson.exerciseId}`}
                      className="block"
                    >
                      <p className="truncate text-sm font-medium text-slate-900">{lesson.title}</p>
                      <p className="text-xs font-medium text-brand-700">Buka latihan →</p>
                    </Link>
                  ) : (
                    <>
                      <p className="truncate text-sm font-medium text-slate-900">{lesson.title}</p>
                      <p className="text-xs text-slate-500">Materi teks</p>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 border-t border-slate-200 pt-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Kuis</h2>
          <div className="mt-3">
            {getQuizzesByModule(module.id).length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada kuis untuk modul ini.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {getQuizzesByModule(module.id).map((quiz) => (
                  <li key={quiz.id} className="py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{quiz.title}</p>
                        <p className="text-xs text-slate-500">
                          {quiz.questions.length} soal{quiz.durationMinutes ? ` · ${quiz.durationMinutes} menit` : ''}
                        </p>
                      </div>
                      <Link
                        to={`/student/quizzes/${quiz.id}`}
                        className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                      >
                        Kerjakan Kuis →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
