import { getProjectSubmissions, getProjects, getQuizAttempts, getQuizzes } from '../../data/demoData';
import { Badge, Card } from '../../components/ui';

export default function LecturerResultsPage() {
  const quizAttempts = [...getQuizAttempts()].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
  const projectSubmissions = [...getProjectSubmissions()].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
  const quizzes = getQuizzes();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Hasil & Nilai</h1>
        <p className="mt-2 text-sm text-slate-600">
          Pantau hasil pengerjaan kuis dan pengumpulan proyek mahasiswa.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Hasil Kuis</h2>
        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {quizAttempts.map((attempt) => {
              const quiz = quizzes.find((item) => item.id === attempt.quizId);
              return (
                <li key={attempt.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{attempt.studentName}</p>
                    <p className="text-sm text-slate-600">
                      {quiz?.title ?? 'Kuis tidak ditemukan'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={attempt.score >= 70 ? 'green' : 'amber'}>
                      Skor: {attempt.score}
                    </Badge>
                    <span className="text-xs text-slate-500">{new Date(attempt.submittedAt).toLocaleString('id-ID')}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Pengumpulan Proyek</h2>
        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {projectSubmissions.map((submission) => {
              const project = getProjects().find((item) => item.id === submission.projectId);
              return (
                <li key={submission.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{submission.studentName}</p>
                    <p className="text-sm text-slate-600">{project?.title ?? 'Proyek tidak ditemukan'}</p>
                  </div>
                  <div className="text-right">
                    {submission.submissionUrl ? (
                      <a
                        className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                        href={submission.submissionUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Lihat tautan
                      </a>
                    ) : null}
                    <p className="text-xs text-slate-500">{new Date(submission.submittedAt).toLocaleString('id-ID')}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
