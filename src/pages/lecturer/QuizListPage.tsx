import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
  useAllQuizQuestions,
  useDeleteQuiz,
  useQuizzes,
} from '../../features/quizzes/hooks';
import { getErrorMessage } from '../../lib/errors';
import { formatDate } from '../../lib/format';

export default function LecturerQuizListPage() {
  const quizzesQuery = useQuizzes();
  const modulesQuery = useAllModules();
  const questionsQuery = useAllQuizQuestions();
  const deleteQuiz = useDeleteQuiz();

  const questionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const question of questionsQuery.data ?? []) {
      counts.set(question.quiz_id, (counts.get(question.quiz_id) ?? 0) + 1);
    }
    return counts;
  }, [questionsQuery.data]);

  const isLoading = quizzesQuery.isLoading || modulesQuery.isLoading || questionsQuery.isLoading;
  const error = quizzesQuery.error ?? modulesQuery.error ?? questionsQuery.error;

  if (isLoading) return <LoadingState label="Memuat kuis…" />;
  if (error) {
    return (
      <ErrorState
        message={getErrorMessage(error)}
        onRetry={() => {
          void quizzesQuery.refetch();
          void modulesQuery.refetch();
          void questionsQuery.refetch();
        }}
      />
    );
  }

  const moduleTitles = new Map((modulesQuery.data ?? []).map((module) => [module.id, module.title]));
  const quizzes = [...(quizzesQuery.data ?? [])].sort(
    (a, b) => a.module_id.localeCompare(b.module_id) || a.title.localeCompare(b.title),
  );

  const handleDelete = (quizId: string, title: string) => {
    const confirmed = window.confirm(`Hapus kuis “${title}”? Semua soal dan percobaan akan ikut terhapus.`);
    if (!confirmed) return;
    deleteQuiz.mutate(quizId);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Manajemen Kuis</h1>
          <p className="mt-2 text-sm text-slate-600">
            Buat, publikasikan, dan kelola soal kuis. Kunci jawaban hanya tersedia untuk dosen.
          </p>
        </div>
        <Link to="/lecturer/quizzes/new">
          <Button>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Buat Kuis
          </Button>
        </Link>
      </div>

      {deleteQuiz.error ? (
        <div className="mb-4"><Alert tone="error">{getErrorMessage(deleteQuiz.error)}</Alert></div>
      ) : null}

      {quizzes.length === 0 ? (
        <EmptyState
          title="Belum ada kuis"
          description="Buat kuis pertama untuk modul yang sudah tersedia."
          action={
            <Link to="/lecturer/quizzes/new">
              <Button>Buat Kuis</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">{quiz.title}</h2>
                    <Badge tone={quiz.is_published ? 'green' : 'slate'}>
                      {quiz.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{quiz.description}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {moduleTitles.get(quiz.module_id) ?? 'Modul tidak ditemukan'} ·{' '}
                    {questionCounts.get(quiz.id) ?? 0} soal
                    {quiz.duration_minutes ? ` · ${quiz.duration_minutes} menit` : ''}
                    {quiz.deadline_at ? ` · Tenggat ${formatDate(quiz.deadline_at)}` : ''}
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
                    onClick={() => handleDelete(quiz.id, quiz.title)}
                    disabled={deleteQuiz.isPending}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Hapus
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
