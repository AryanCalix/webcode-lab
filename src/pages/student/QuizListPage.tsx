import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { getModuleById, getQuizzes } from '../../data/demoData';
import { Badge, Card } from '../../components/ui';

export default function QuizListPage() {
  const quizzes = getQuizzes()
    .filter((quiz) => quiz.published)
    .sort((a, b) => a.id.localeCompare(b.id));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Kuis</h1>
        <p className="mt-2 text-sm text-slate-600">
          Kerjakan kuis yang telah dipublikasikan oleh dosen untuk memahami materi lebih dalam.
        </p>
      </div>

      <div className="grid gap-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">{quiz.title}</h2>
                  <Badge tone="green">Tersedia</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{quiz.description}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {getModuleById(quiz.moduleId)?.title ?? 'Modul tidak ditemukan'} ·{' '}
                  {quiz.questions.length} soal ·{' '}
                  {quiz.durationMinutes ? `${quiz.durationMinutes} menit` : 'tanpa batas waktu'}
                </p>
              </div>
              <Link
                to={`/student/quizzes/${quiz.id}`}
                className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                <ClipboardList className="mr-2 h-4 w-4" aria-hidden="true" />
                Kerjakan Kuis
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
