import { Link } from 'react-router-dom';
import {
  BookOpen,
  CalendarCheck,
  ClipboardCheck,
  FolderKanban,
  GraduationCap,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Avatar } from '../../components/Avatar';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  ProgressBar,
} from '../../components/ui';
import { summariseAttendance, useAttendanceData } from '../../features/attendance/hooks';
import { useStudentsOverview, useModulesWithLessonCounts } from '../../features/lecturer/hooks';
import { useAllProjectSubmissions } from '../../features/projects/hooks';
import { getErrorMessage } from '../../lib/errors';

export default function LecturerDashboardPage() {
  const studentsQuery = useStudentsOverview();
  const modulesState = useModulesWithLessonCounts();
  const attendance = useAttendanceData();
  const submissionsQuery = useAllProjectSubmissions();

  const isLoading =
    studentsQuery.isLoading ||
    modulesState.isLoading ||
    attendance.isLoading ||
    submissionsQuery.isLoading;

  if (isLoading) return <LoadingState label="Memuat dashboard dosen…" />;

  const error =
    studentsQuery.error ?? modulesState.error ?? attendance.error ?? submissionsQuery.error;

  if (error) {
    return (
      <ErrorState
        message={getErrorMessage(error)}
        onRetry={() => {
          void studentsQuery.refetch();
          modulesState.refetch();
          attendance.refetch();
          void submissionsQuery.refetch();
        }}
      />
    );
  }

  const students = studentsQuery.data ?? [];
  const modules = modulesState.modules;
  const submissions = submissionsQuery.data ?? [];
  const ungradedSubmissions = submissions.filter((submission) => submission.score === null);
  const attendanceStats = summariseAttendance(
    attendance.records,
    attendance.sessions.length * students.length,
  );
  const averageProgress =
    students.length > 0
      ? Math.round(
          students.reduce((sum, student) => sum + student.averageProgress, 0) / students.length,
        )
      : 0;

  const topStudents = [...students]
    .sort((a, b) => b.averageProgress - a.averageProgress)
    .slice(0, 5);

  const quickActions = [
    {
      to: '/lecturer/modules',
      title: 'Modul & materi',
      description: 'Susun pelajaran, latihan, dan publikasikan modul.',
      icon: BookOpen,
      accent: 'bg-brand-100 text-brand-700',
    },
    {
      to: '/lecturer/projects',
      title: 'Proyek & penilaian',
      description: 'Kelola proyek dan nilai pengumpulan mahasiswa.',
      icon: FolderKanban,
      accent: 'bg-emerald-100 text-emerald-700',
    },
    {
      to: '/lecturer/attendance',
      title: 'Absensi kelas',
      description: 'Catat kehadiran tiap sesi dengan pengecualian.',
      icon: CalendarCheck,
      accent: 'bg-blue-100 text-blue-700',
    },
    {
      to: '/lecturer/results',
      title: 'Hasil & nilai',
      description: 'Lihat rekap nilai akhir dan hasil kuis.',
      icon: TrendingUp,
      accent: 'bg-amber-100 text-amber-700',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Ruang dosen"
        title="Dashboard Dosen"
        description="Pantau perkembangan kelas Pemrograman Web, kelola materi, dan selesaikan penilaian di satu tempat."
        action={
          <Link to="/lecturer/modules">
            <Button>
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
              Kelola Modul
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Mahasiswa aktif"
          value={students.length}
          hint="terdaftar di kelas"
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="Rata-rata progres"
          value={`${averageProgress}%`}
          hint="penyelesaian modul"
          icon={TrendingUp}
          tone="orange"
        />
        <StatCard
          label="Perlu dinilai"
          value={ungradedSubmissions.length}
          hint={`dari ${submissions.length} pengumpulan`}
          icon={ClipboardCheck}
          tone="emerald"
        />
        <StatCard
          label="Kehadiran kelas"
          value={`${attendanceStats.percentage}%`}
          hint={`${attendanceStats.present}/${attendanceStats.total} kehadiran`}
          icon={CalendarCheck}
          tone="violet"
        />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Tindakan cepat</h2>
          <span className="text-xs font-medium text-slate-500">
            {modules.filter((module) => module.is_published).length} modul dipublikasikan
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.to} to={action.to} className="block">
                <Card className="flex h-full items-center gap-4 p-5 transition-colors hover:border-brand-300">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${action.accent}`}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{action.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                      {action.description}
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Perkembangan mahasiswa</h2>
            <p className="text-xs text-slate-500">Diurutkan berdasarkan progres modul tertinggi.</p>
          </div>
          <Link
            to="/lecturer/students"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Lihat semua →
          </Link>
        </div>

        {students.length === 0 ? (
          <EmptyState
            title="Belum ada mahasiswa"
            description="Mahasiswa akan muncul setelah akun mereka dibuat oleh administrator."
          />
        ) : (
          <Card className="overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {topStudents.map((student) => (
                <li key={student.id}>
                  <Link
                    to={`/lecturer/students/${student.id}`}
                    className="flex flex-col gap-3 p-5 transition-colors hover:bg-cream-50/70 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={student.fullName} size="sm" tone="blue" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-slate-900">
                            {student.fullName}
                          </p>
                          <Badge
                            tone={
                              student.level >= 3
                                ? 'green'
                                : student.level === 2
                                  ? 'amber'
                                  : 'blue'
                            }
                          >
                            Level {student.level}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {student.totalXp} XP · streak {student.currentStreak} hari ·{' '}
                          {student.completedLessons}/{student.totalLessons} pelajaran
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:w-64">
                      <ProgressBar value={student.averageProgress} className="flex-1" />
                      <span className="w-10 text-right text-sm font-medium text-slate-600">
                        {student.averageProgress}%
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}
