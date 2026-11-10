import { useMemo, useState } from 'react';
import { ExternalLink, GraduationCap, Save, Trophy } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  inputClassName,
} from '../../components/ui';
import { summariseStudentGrade } from '../../features/grading/summary';
import { useLecturerResults } from '../../features/lecturer/hooks';
import { useGradeProjectSubmission } from '../../features/projects/hooks';
import type { ProjectSubmissionRow } from '../../lib/database.types';
import { getErrorMessage } from '../../lib/errors';
import { formatDateTime, safeExternalUrl } from '../../lib/format';
import { gradeTone } from '../../lib/grading';

function ProjectGradeCard({
  submission,
  studentName,
  projectTitle,
}: {
  submission: ProjectSubmissionRow;
  studentName: string;
  projectTitle: string;
}) {
  const gradeSubmission = useGradeProjectSubmission();
  const [score, setScore] = useState(submission.score !== null ? String(submission.score) : '');
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const [formError, setFormError] = useState<string | null>(null);

  const safeUrl = safeExternalUrl(submission.submission_url);

  const handleSave = () => {
    setFormError(null);
    const parsed = Number(score);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
      setFormError('Nilai harus berupa bilangan bulat 0–100.');
      return;
    }

    gradeSubmission.mutate(
      { submissionId: submission.id, score: parsed, feedback },
      { onSuccess: () => setFormError(null) },
    );
  };

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-900">{studentName}</p>
            <Badge tone={submission.score !== null ? gradeTone(submission.score) : 'slate'}>
              {submission.score !== null ? `Nilai ${submission.score}` : 'Belum dinilai'}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-slate-600">{projectTitle}</p>
          {submission.submission_text ? (
            <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {submission.submission_text}
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Tidak ada deskripsi teks.</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>Dikumpulkan {formatDateTime(submission.submitted_at)}</span>
            {safeUrl ? (
              <a
                href={safeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-800"
              >
                Buka tautan
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>

        <div className="w-full shrink-0 rounded-xl bg-cream-50 p-4 sm:w-64">
          <Field label="Nilai (0–100)" htmlFor={`score-${submission.id}`}>
            <input
              id={`score-${submission.id}`}
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(event) => setScore(event.target.value)}
              className={inputClassName}
              placeholder="Contoh: 85"
            />
          </Field>
          <div className="mt-3">
            <Field label="Umpan balik" htmlFor={`feedback-${submission.id}`}>
              <textarea
                id={`feedback-${submission.id}`}
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                rows={4}
                className={inputClassName}
                placeholder="Tuliskan apresiasi dan saran perbaikan."
              />
            </Field>
          </div>

          {formError ? <div className="mt-3"><Alert tone="error">{formError}</Alert></div> : null}
          {gradeSubmission.error ? (
            <div className="mt-3"><Alert tone="error">{getErrorMessage(gradeSubmission.error)}</Alert></div>
          ) : null}
          {gradeSubmission.isSuccess ? (
            <div className="mt-3"><Alert tone="success">Nilai berhasil disimpan.</Alert></div>
          ) : null}

          <Button
            className="mt-3 w-full"
            size="sm"
            onClick={handleSave}
            disabled={gradeSubmission.isPending}
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {gradeSubmission.isPending ? 'Menyimpan…' : 'Simpan Nilai'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function LecturerResultsPage() {
  const { data, isLoading, error, refetch } = useLecturerResults();

  const maps = useMemo(() => {
    const students = new Map((data?.students ?? []).map((student) => [student.id, student] as const));
    const modules = new Map((data?.modules ?? []).map((module) => [module.id, module] as const));
    const quizzes = new Map((data?.quizzes ?? []).map((quiz) => [quiz.id, quiz] as const));
    const projects = new Map((data?.projects ?? []).map((project) => [project.id, project] as const));
    return { students, modules, quizzes, projects };
  }, [data]);

  const grades = useMemo(() => {
    if (!data) return [];
    return data.students
      .filter((student) => student.role === 'student')
      .map((student) => ({
        student,
        summary: summariseStudentGrade({
          studentId: student.id,
          modules: data.modules,
          lessons: data.lessons,
          progress: data.progress,
          quizzes: data.quizzes,
          attempts: data.quizAttempts,
          projects: data.projects,
          submissions: data.projectSubmissions,
        }),
      }))
      .sort((a, b) => b.summary.breakdown.final - a.summary.breakdown.final);
  }, [data]);

  if (isLoading) return <LoadingState label="Memuat hasil…" />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  const attempts = (data?.quizAttempts ?? []).filter((attempt) => attempt.status === 'submitted');
  const projectSubmissions = data?.projectSubmissions ?? [];
  const gradedCount = projectSubmissions.filter((submission) => submission.score !== null).length;
  const averageFinal =
    grades.length > 0
      ? Math.round(
          grades.reduce((sum, grade) => sum + grade.summary.breakdown.final, 0) / grades.length,
        )
      : 0;

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        eyebrow="Penilaian"
        title="Hasil & Nilai"
        description="Nilai akhir dihitung dari 50% proyek, 40% penyelesaian modul, dan 10% kuis. Absensi hanya bersifat informatif."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Rata-rata nilai akhir"
          value={averageFinal}
          hint={`${grades.length} mahasiswa`}
          icon={Trophy}
          tone="orange"
        />
        <StatCard
          label="Proyek dinilai"
          value={`${gradedCount}/${projectSubmissions.length}`}
          hint="pengumpulan"
          icon={GraduationCap}
          tone="emerald"
        />
        <StatCard
          label="Kuis dikirim"
          value={attempts.length}
          hint="percobaan selesai"
          icon={Save}
          tone="blue"
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Rekap nilai akhir</h2>
        {grades.length === 0 ? (
          <EmptyState
            title="Belum ada mahasiswa"
            description="Nilai akan muncul setelah akun mahasiswa tersedia."
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Mahasiswa</th>
                    <th className="px-5 py-3">Modul (40%)</th>
                    <th className="px-5 py-3">Kuis (10%)</th>
                    <th className="px-5 py-3">Proyek (50%)</th>
                    <th className="px-5 py-3">Nilai akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {grades.map(({ student, summary }) => (
                    <tr key={student.id}>
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                        {student.full_name}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {summary.breakdown.module}%
                        <span className="ml-1 text-xs text-slate-400">
                          ({summary.completedLessons}/{summary.totalLessons})
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {summary.breakdown.quiz}
                        <span className="ml-1 text-xs text-slate-400">
                          ({summary.quizzesTaken}/{summary.totalQuizzes})
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {summary.breakdown.project}
                        <span className="ml-1 text-xs text-slate-400">
                          ({summary.gradedProjects}/{summary.totalProjects})
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Badge tone={gradeTone(summary.breakdown.final)}>
                            {summary.breakdown.final}
                          </Badge>
                          <span className="font-semibold text-slate-900">
                            {summary.breakdown.letter}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Hasil kuis</h2>
        {attempts.length === 0 ? (
          <EmptyState
            title="Belum ada hasil kuis"
            description="Hasil muncul setelah mahasiswa mengirim jawaban."
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Mahasiswa</th>
                    <th className="px-5 py-3">Kuis</th>
                    <th className="px-5 py-3">Modul</th>
                    <th className="px-5 py-3">Skor</th>
                    <th className="px-5 py-3">Dikirim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {attempts.map((attempt) => {
                    const student = maps.students.get(attempt.student_id);
                    const quiz = maps.quizzes.get(attempt.quiz_id);
                    const module = quiz ? maps.modules.get(quiz.module_id) : undefined;
                    const score = attempt.score ?? 0;
                    return (
                      <tr key={attempt.id}>
                        <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                          {student?.full_name ?? 'Pengguna'}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {quiz?.title ?? 'Kuis tidak ditemukan'}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {module?.title ?? 'Modul tidak ditemukan'}
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

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Pengumpulan proyek</h2>
        {projectSubmissions.length === 0 ? (
          <EmptyState
            illustration="projects"
            title="Belum ada pengumpulan proyek"
            description="Pengumpulan proyek mahasiswa akan tampil di sini untuk dinilai."
          />
        ) : (
          <div className="grid gap-4">
            {projectSubmissions.map((submission) => {
              const student = maps.students.get(submission.student_id);
              const project = maps.projects.get(submission.project_id);

              return (
                <ProjectGradeCard
                  key={`${submission.id}-${submission.score ?? 'none'}`}
                  submission={submission}
                  studentName={student?.full_name ?? 'Pengguna'}
                  projectTitle={project?.title ?? 'Proyek tidak ditemukan'}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
