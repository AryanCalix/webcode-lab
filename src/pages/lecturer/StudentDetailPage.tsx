import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarCheck, ClipboardList, GraduationCap, Trophy } from 'lucide-react';
import { Avatar } from '../../components/Avatar';
import { PageHeader } from '../../components/PageHeader';
import { ProgressRing } from '../../components/ProgressRing';
import { StatCard } from '../../components/StatCard';
import { Badge, Card, EmptyState, ErrorState, LoadingState, ProgressBar } from '../../components/ui';
import { attendanceLabels, attendanceTones } from '../../features/attendance/labels';
import { useStudentAttendance } from '../../features/attendance/hooks';
import { summariseStudentGrade } from '../../features/grading/summary';
import { useLecturerResults, useStudentsOverview } from '../../features/lecturer/hooks';
import { getErrorMessage } from '../../lib/errors';
import { formatDate, formatDateTime } from '../../lib/format';
import { gradeTone } from '../../lib/grading';

export default function LecturerStudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const studentsQuery = useStudentsOverview();
  const resultsQuery = useLecturerResults();
  const attendance = useStudentAttendance(studentId);

  const isLoading =
    studentsQuery.isLoading || resultsQuery.isLoading || attendance.isLoading;
  const error = studentsQuery.error ?? resultsQuery.error ?? attendance.error;

  if (isLoading) return <LoadingState label="Memuat detail mahasiswa…" />;
  if (error) {
    return (
      <ErrorState
        message={getErrorMessage(error)}
        onRetry={() => {
          void studentsQuery.refetch();
          void resultsQuery.refetch();
          attendance.refetch();
        }}
      />
    );
  }

  const student = (studentsQuery.data ?? []).find((item) => item.id === studentId);
  if (!student) return <Navigate to="/lecturer/students" replace />;

  const results = resultsQuery.data;
  const summary = results
    ? summariseStudentGrade({
        studentId: student.id,
        modules: results.modules,
        lessons: results.lessons,
        progress: results.progress,
        quizzes: results.quizzes,
        attempts: results.quizAttempts,
        projects: results.projects,
        submissions: results.projectSubmissions,
      })
    : null;

  const lessonsPerModule = new Map<string, number>();
  for (const lesson of results?.lessons ?? []) {
    if (!lesson.is_published) continue;
    lessonsPerModule.set(lesson.module_id, (lessonsPerModule.get(lesson.module_id) ?? 0) + 1);
  }

  const progressByModule = new Map(
    (results?.progress ?? [])
      .filter((row) => row.student_id === student.id)
      .map((row) => [row.module_id, row] as const),
  );

  // Show every published module with lessons, including the ones this student
  // has not started yet, so untouched modules read as 0% instead of disappearing.
  const moduleProgress = (results?.modules ?? [])
    .filter((module) => module.is_published && (lessonsPerModule.get(module.id) ?? 0) > 0)
    .sort((a, b) => a.order_index - b.order_index)
    .map((module) => {
      const row = progressByModule.get(module.id);
      const totalLessons = lessonsPerModule.get(module.id) ?? 0;
      return {
        moduleId: module.id,
        title: module.title,
        progressPercent: row?.progress_percent ?? 0,
        completedLessons: Math.min(row?.completed_lessons ?? 0, totalLessons),
        totalLessons,
      };
    });

  const projectSubmissions = (results?.projectSubmissions ?? [])
    .filter((submission) => submission.student_id === student.id)
    .slice(0, 5);
  const quizAttempts = (results?.quizAttempts ?? [])
    .filter((attempt) => attempt.student_id === student.id && attempt.status === 'submitted')
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        to="/lecturer/students"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke daftar mahasiswa
      </Link>

      <PageHeader
        eyebrow="Mahasiswa"
        title={student.fullName}
        description={`Level ${student.level} — ${student.levelName} · ${student.totalXp} XP · streak ${student.currentStreak} hari`}
      />

      <Card className="overflow-hidden">
        <div className="hero-mesh flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={student.fullName} size="lg" tone="blue" />
            <div>
              <p className="text-sm font-medium text-slate-600">Nilai akhir</p>
              <p className="mt-1 flex items-center gap-2 text-4xl font-bold tracking-tight text-slate-900">
                {summary?.breakdown.final ?? 0}
                <Badge tone={gradeTone(summary?.breakdown.final ?? 0)}>
                  {summary?.breakdown.letter ?? 'E'}
                </Badge>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                50% proyek · 40% modul · 10% kuis
              </p>
            </div>
          </div>
          <ProgressRing value={summary?.breakdown.module ?? 0} size={108} strokeWidth={10} />
        </div>
      </Card>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Progres modul"
          value={`${summary?.breakdown.module ?? 0}%`}
          hint={`${summary?.completedLessons ?? 0}/${summary?.totalLessons ?? 0} pelajaran`}
          icon={GraduationCap}
          tone="orange"
        />
        <StatCard
          label="Nilai proyek"
          value={summary?.breakdown.project ?? 0}
          hint={`${summary?.gradedProjects ?? 0}/${summary?.totalProjects ?? 0} dinilai`}
          icon={Trophy}
          tone="emerald"
        />
        <StatCard
          label="Nilai kuis"
          value={summary?.breakdown.quiz ?? 0}
          hint={`${summary?.quizzesTaken ?? 0}/${summary?.totalQuizzes ?? 0} kuis`}
          icon={ClipboardList}
          tone="blue"
        />
        <StatCard
          label="Kehadiran"
          value={`${attendance.summary.percentage}%`}
          hint={`${attendance.summary.present}/${attendance.summary.total} sesi`}
          icon={CalendarCheck}
          tone="violet"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Progres per modul</h2>
          {moduleProgress.length === 0 ? (
            <EmptyState
              title="Belum ada progres"
              description="Belum ada modul yang dipublikasikan untuk dinilai."
            />
          ) : (
            <Card className="divide-y divide-slate-100">
              {moduleProgress.map((row) => {
                return (
                  <div key={row.moduleId} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 truncate text-sm font-semibold text-slate-900">
                        {row.title}
                      </p>
                      <span className="text-sm font-medium text-slate-600">
                        {row.progressPercent}%
                      </span>
                    </div>
                    <div className="mt-2">
                      <ProgressBar value={row.progressPercent} />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">
                      {row.completedLessons} dari {row.totalLessons} pelajaran
                    </p>
                  </div>
                );
              })}
            </Card>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Riwayat absensi</h2>
          {attendance.sessions.length === 0 ? (
            <EmptyState
              illustration="attendance"
              title="Belum ada absensi"
              description="Belum ada sesi absensi untuk mahasiswa ini."
            />
          ) : (
            <Card className="divide-y divide-slate-100">
              {attendance.sessions.map((session) => {
                const status = session.record?.status ?? 'present';
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between gap-3 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {session.topic.trim() || 'Sesi kelas'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(session.session_date)}
                      </p>
                    </div>
                    <Badge tone={attendanceTones[status]}>{attendanceLabels[status]}</Badge>
                  </div>
                );
              })}
            </Card>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Proyek terakhir</h2>
          {projectSubmissions.length === 0 ? (
            <EmptyState
              illustration="projects"
              title="Belum ada proyek"
              description="Mahasiswa belum mengumpulkan proyek."
            />
          ) : (
            <Card className="divide-y divide-slate-100">
              {projectSubmissions.map((submission) => {
                const project = (results?.projects ?? []).find(
                  (item) => item.id === submission.project_id,
                );
                return (
                  <div key={submission.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {project?.title ?? 'Proyek tidak ditemukan'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDateTime(submission.submitted_at)}
                      </p>
                    </div>
                    <Badge
                      tone={submission.score !== null ? gradeTone(submission.score) : 'slate'}
                    >
                      {submission.score !== null ? submission.score : 'Belum dinilai'}
                    </Badge>
                  </div>
                );
              })}
            </Card>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Kuis terakhir</h2>
          {quizAttempts.length === 0 ? (
            <EmptyState
              title="Belum ada kuis"
              description="Mahasiswa belum menyelesaikan kuis."
            />
          ) : (
            <Card className="divide-y divide-slate-100">
              {quizAttempts.map((attempt) => {
                const quiz = (results?.quizzes ?? []).find((item) => item.id === attempt.quiz_id);
                return (
                  <div key={attempt.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {quiz?.title ?? 'Kuis tidak ditemukan'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDateTime(attempt.submitted_at)}
                      </p>
                    </div>
                    <Badge tone={(attempt.score ?? 0) >= 70 ? 'green' : 'amber'}>
                      {attempt.score ?? 0}
                    </Badge>
                  </div>
                );
              })}
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
