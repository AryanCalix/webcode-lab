import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Badge, Card, EmptyState, ErrorState, LoadingState, ProgressBar } from '../../components/ui';
import { useStudentsOverview } from '../../features/lecturer/hooks';
import { getErrorMessage } from '../../lib/errors';

export default function StudentsPage() {
  const { data: students, isLoading, error, refetch } = useStudentsOverview();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students ?? [];
    return (students ?? []).filter((student) => student.fullName.toLowerCase().includes(query));
  }, [students, search]);

  if (isLoading) return <LoadingState label="Memuat data mahasiswa…" />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Mahasiswa</h1>
        <p className="mt-2 text-sm text-slate-600">
          Ringkasan progres, XP, dan streak seluruh mahasiswa.
        </p>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
        <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari nama mahasiswa…"
          className="w-full border-0 bg-transparent text-sm focus:outline-none"
        />
      </div>

      {(students ?? []).length === 0 ? (
        <EmptyState
          title="Belum ada mahasiswa"
          description="Akun demo dibuat dengan npm run seed:auth setelah migrasi database."
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="Tidak ada hasil" description="Coba kata kunci lain." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Mahasiswa</th>
                  <th className="px-5 py-3">Level</th>
                  <th className="px-5 py-3">XP</th>
                  <th className="px-5 py-3">Streak</th>
                  <th className="px-5 py-3">Pelajaran</th>
                  <th className="px-5 py-3">Progres</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((student) => (
                  <tr key={student.id}>
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-900">
                      {student.fullName}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <Badge
                        tone={student.level >= 3 ? 'green' : student.level === 2 ? 'amber' : 'blue'}
                      >
                        {student.level} — {student.levelName}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{student.totalXp}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {student.currentStreak} hari
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {student.completedLessons}/{student.totalLessons}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <ProgressBar value={student.averageProgress} className="w-32" />
                        <span className="w-10 text-right text-slate-600">
                          {student.averageProgress}%
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
    </div>
  );
}
