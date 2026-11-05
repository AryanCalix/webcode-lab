import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { deleteQuiz, getModuleById, getQuizzes } from '../../data/demoData';
import { Badge, Button, Card } from '../../components/ui';

export default function QuizListPage() {
  const quizzes = getQuizzes().sort((a, b) => a.moduleId.localeCompare(b.moduleId) || a.id.localeCompare(b.id));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Manajemen Kuis</h1>
          <p className="mt-2 text-sm text-slate-600">
            Buat, publikasikan, dan kelola soal kuis untuk modul pembelajaran.
          </p>
        </div>
        <Link to="/lecturer/quizzes/new">
          <Button>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Buat Kuis
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">{quiz.title}</h2>
                  <Badge tone={quiz.published ? 'green' : 'slate'}>
                    {quiz.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">{quiz.description}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {getModuleById(quiz.moduleId)?.title ?? 'Modul tidak ditemukan'} · {quiz.questions.length} soal
                  {quiz.durationMinutes ? ` · ${quiz.durationMinutes} menit` : ''}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link to={`/lecturer/quizzes/${quiz.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteQuiz(quiz.id)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Hapus
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
