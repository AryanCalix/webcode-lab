import { GraduationCap, TrendingUp } from 'lucide-react';
import { lecturerStudents } from '../../data/demoData';
import { Badge, Card } from '../../components/ui';

export default function LecturerDashboardPage() {
  const publishedModules = 4;
  const averageProgress =
    lecturerStudents.reduce((sum, student) => sum + student.averageProgressPercent, 0) /
    lecturerStudents.length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Dashboard Dosen</h1>
        <p className="mt-2 text-sm text-slate-600">
          Pantau perkembangan belajar mahasiswa dan hasil pengerjaan mereka.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex items-center gap-4 p-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <GraduationCap className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-slate-900">{lecturerStudents.length}</p>
            <p className="text-sm text-slate-600">Mahasiswa aktif</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <TrendingUp className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-slate-900">{Math.round(averageProgress)}%</p>
            <p className="text-sm text-slate-600">Rata-rata progres belajar</p>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Perkembangan Mahasiswa</h2>
        <Card className="overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {lecturerStudents.map((student) => (
              <li key={student.studentId} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-slate-900">{student.fullName}</p>
                    <Badge tone={student.level >= 3 ? 'green' : student.level === 2 ? 'amber' : 'blue'}>
                      Level {student.level} — {student.levelName}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {student.totalXp} XP · streak {student.currentStreak} hari · rata-rata progres{' '}
                    {student.averageProgressPercent}%
                  </p>
                </div>
                <div className="h-2.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-200 sm:w-56">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${student.averageProgressPercent}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <p className="mt-6 text-xs text-slate-500">
        {publishedModules} modul dipublikasikan untuk kelas ini. Fitur manajemen modul, kuis, dan hasil
        belajar akan tersedia pada fase berikutnya.
      </p>
    </div>
  );
}
