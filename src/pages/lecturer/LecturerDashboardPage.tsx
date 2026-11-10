import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, TrendingUp, Users } from 'lucide-react';
import { Badge, Card, EmptyState, ErrorState, LoadingState, ProgressBar } from '../../components/ui';
import { useModulesWithLessonCounts } from '../../features/lecturer/hooks';
import { useStudentsOverview } from '../../features/lecturer/hooks';
import { getErrorMessage } from '../../lib/errors';

export default function LecturerDashboardPage() {
  const studentsQuery = useStudentsOverview();
  const modulesState = useModulesWithLessonCounts();

  if (studentsQuery.isLoading || modulesState.isLoading) {
    return <LoadingState label="Memuat dashboard dosen…" />;
  }

  if (studentsQuery.error || modulesState.error) {
    return (
      <ErrorState
        message={getErrorMessage(studentsQuery.error ?? modulesState.error)}
        onRetry={() => {
          void studentsQuery.refetch();
          modulesState.refetch();
        }}
      />
    );
  }

  const students = studentsQuery.data ?? [];
  const modules = modulesState.modules;
  const averageProgress =
    students.length > 0
      ? Math.round(students.reduce((sum, student) => sum + student.averageProgress, 0) / students.length)
      : 0;

  const stats = [
    {
      label: 'Mahasiswa aktif',
      value: String(students.length),
      icon: Users,
      accent: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Rata-rata progres',
      value: `${averageProgress}%`,
      icon: TrendingUp,
      accent: 'bg-brand-100 text-brand-700',
    },
    {
      label: 'Modul dipublikasikan',
      value: String(modules.filter((module) => module.is_published).length),
      icon: BookOpen,
      accent: 'bg-emerald-100 text-emerald-700',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Dashboard Dosen</h1>
        <p className="mt-2 text-sm text-slate-600">
          Pantau perkembangan belajar mahasiswa, kelola modul, dan periksa hasil pengerjaan.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex items-center gap-4 p-5">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.accent}`}>
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-600">{stat.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Perkembangan Mahasiswa</h2>
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
              {students.slice(0, 5).map((student) => (
                <li
                  key={student.id}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold text-slate-900">{student.fullName}</p>
                      <Badge
                        tone={
                          student.level >= 3 ? 'green' : student.level === 2 ? 'amber' : 'blue'
                        }
                      >
                        Level {student.level} — {student.levelName}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {student.totalXp} XP · streak {student.currentStreak} hari
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:w-64">
                    <ProgressBar value={student.averageProgress} className="flex-1" />
                    <span className="w-10 text-right text-sm font-medium text-slate-600">
                      {student.averageProgress}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link to="/lecturer/modules" className="block">
          <Card className="flex h-full items-center gap-4 p-5 transition-colors hover:border-brand-300">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <GraduationCap className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold text-slate-900">Kelola modul & materi</p>
              <p className="text-sm text-slate-600">Tambah modul, pelajaran, dan latihan.</p>
            </div>
          </Card>
        </Link>
        <Link to="/lecturer/results" className="block">
          <Card className="flex h-full items-center gap-4 p-5 transition-colors hover:border-brand-300">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <TrendingUp className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold text-slate-900">Hasil & nilai</p>
              <p className="text-sm text-slate-600">Pantau nilai kuis dan pengumpulan proyek.</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
