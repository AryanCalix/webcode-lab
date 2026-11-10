import { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import { Badge, Card, EmptyState, ErrorState, LoadingState } from '../../components/ui';
import { useLecturerResults } from '../../features/lecturer/hooks';
import { getErrorMessage } from '../../lib/errors';
import { formatDateTime, safeExternalUrl } from '../../lib/format';

export default function LecturerResultsPage() {
  const { data, isLoading, error, refetch } = useLecturerResults();

  const maps = useMemo(() => {
    const students = new Map((data?.students ?? []).map((student) => [student.id, student] as const));
    const quizzes = new Map((data?.quizzes ?? []).map((quiz) => [quiz.id, quiz] as const));
    const projects = new Map((data?.projects ?? []).map((project) => [project.id, project] as const));
    return { students, quizzes, projects };
  }, [data]);

  if (isLoading) return <LoadingState label="Memuat hasil…" />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  const attempts = (data?.quizAttempts ?? []).filter((attempt) => attempt.status === 'submitted');
  const projectSubmissions = data?.projectSubmissions ?? [];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Hasil & Nilai</h1>
        <p className="mt-2 text-sm text-slate-600">
          Pantau hasil pengerjaan kuis dan pengumpulan proyek mahasiswa.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Hasil Kuis</h2>
        {attempts.length === 0 ? (
          <EmptyState title="Belum ada hasil kuis" description="Hasil muncul setelah mahasiswa mengirim jawaban." />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Mahasiswa</th>
                    <th className="px-5 py-3">Kuis</th>
                    <th className="px-5 py-3">Skor</th>
                    <th className="px-5 py-3">Dikirim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {attempts.map((attempt) => {
                    const student = maps.students.get(attempt.student_id);
                    const quiz = maps.quizzes.get(attempt.quiz_id);
                    const score = attempt.score ?? 0;
                    return (
                      <tr key={attempt.id}>
                        <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                          {student?.full_name ?? 'Pengguna'}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {quiz?.title ?? 'Kuis tidak ditemukan'}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <Badge tone={score >= 70 ? 'green' : 'amber'}>{score}</Badge>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {formatDateTime(attempt.submitted_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Pengumpulan Proyek</h2>
        {projectSubmissions.length === 0 ? (
          <EmptyState
            title="Belum ada pengumpulan proyek"
            description="Pengumpulan proyek mahasiswa akan tampil di sini."
          />
        ) : (
          <div className="grid gap-4">
            {projectSubmissions.map((submission) => {
              const student = maps.students.get(submission.student_id);
              const project = maps.projects.get(submission.project_id);
              const safeUrl = safeExternalUrl(submission.submission_url);

              return (
                <Card key={submission.id} className="p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {student?.full_name ?? 'Pengguna'}
                      </p>
                      <p className="text-sm text-slate-600">
                        {project?.title ?? 'Proyek tidak ditemukan'}
                      </p>
                      {submission.submission_text ? (
                        <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-slate-600">
                          {submission.submission_text}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-start gap-1 sm:items-end">
                      {safeUrl ? (
                        <a
                          href={safeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
                        >
                          Lihat tautan
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      ) : null}
                      <p className="text-xs text-slate-500">
                        {formatDateTime(submission.submitted_at)}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
