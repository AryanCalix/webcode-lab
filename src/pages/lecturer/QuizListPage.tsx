import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, FileQuestion, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
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
  useSetQuizPublished,
} from '../../features/quizzes/hooks';
import { getErrorMessage } from '../../lib/errors';
import { formatDate } from '../../lib/format';

export default function LecturerQuizListPage() {
  const quizzesQuery = useQuizzes();
  const modulesQuery = useAllModules();
  const questionsQuery = useAllQuizQuestions();
  const deleteQuiz = useDeleteQuiz();
  const setPublished = useSetQuizPublished();

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
  const publishedCount = quizzes.filter((quiz) => quiz.is_published).length;
  const questionTotal = [...questionCounts.values()].reduce((sum, count) => sum + count, 0);

  const handleDelete = (quizId: string, title: string) => {
    const confirmed = window.confirm(`Hapus kuis “${title}”? Semua soal dan percobaan akan ikut terhapus.`);
    if (!confirmed) return;
    deleteQuiz.mutate(quizId);
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        eyebrow="Evaluasi modul"
        title="Manajemen Kuis"
        description="Buat, publikasikan, dan kelola soal kuis. Kuis terbuka bagi mahasiswa setelah semua pelajaran modul selesai."
        action={
          <Link to="/lecturer/quizzes/new">
            <Button>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Buat Kuis
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total kuis" value={quizzes.length} icon={FileQuestion} tone="orange" />
        <StatCard label="Dipublikasikan" value={publishedCount} icon={CheckCircle2} tone="emerald" />
        <StatCard label="Total soal" value={questionTotal} icon={FileQuestion} tone="blue" />
      </div>

      {deleteQuiz.error ? (
        <div className="mt-4"><Alert tone="error">{getErrorMessage(deleteQuiz.error)}</Alert></div>
      ) : null}
      {setPublished.error ? (
        <div className="mt-4"><Alert tone="error">{getErrorMessage(setPublished.error)}</Alert></div>
      ) : null}

      <section className="mt-6">
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
              <Card key={quiz.id} className="hover-lift p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">{quiz.title}</h2>
                      <Badge tone={quiz.is_published ? 'green' : 'slate'}>
                        {quiz.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      <Badge tone="blue">{questionCounts.get(quiz.id) ?? 0} soal</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{quiz.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {moduleTitles.get(quiz.module_id) ?? 'Modul tidak ditemukan'}
                      {quiz.duration_minutes ? ` · ${quiz.duration_minutes} menit` : ' · tanpa batas waktu'}
                      {quiz.deadline_at ? ` · Tenggat ${formatDate(quiz.deadline_at)}` : ' · tanpa tenggat'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPublished.mutate({
                          quizId: quiz.id,
                          isPublished: !quiz.is_published,
                        })
                      }
                      disabled={setPublished.isPending}
                    >
                      {quiz.is_published ? 'Jadikan draft' : 'Publikasikan'}
                    </Button>
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
      </section>

      <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900">
        <p className="font-semibold">Kunci jawaban tetap di server</p>
        <p className="mt-1 leading-relaxed">
          Mahasiswa tidak pernah menerima kunci jawaban sebelum mengirim percobaan. Nilai kuis
          menyumbang 10% dari nilai akhir dan percobaan terbaik dipakai.
        </p>
      </div>
    </div>
  );
}
