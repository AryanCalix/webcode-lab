import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Avatar } from '../../components/Avatar';
import { PageHeader } from '../../components/PageHeader';
import { Badge, Card, EmptyState, ErrorState, LoadingState, ProgressBar } from '../../components/ui';
import { summariseAttendance, useAttendanceData } from '../../features/attendance/hooks';
import { summariseStudentGrade } from '../../features/grading/summary';
import { useLecturerResults, useStudentsOverview } from '../../features/lecturer/hooks';
import { getErrorMessage } from '../../lib/errors';
import { gradeTone } from '../../lib/grading';

export default function StudentsPage() {
  const studentsQuery = useStudentsOverview();
  const resultsQuery = useLecturerResults();
  const attendance = useAttendanceData();
  const [search, setSearch] = useState('');

  const isLoading = studentsQuery.isLoading || resultsQuery.isLoading || attendance.isLoading;
  const error = studentsQuery.error ?? resultsQuery.error ?? attendance.error;

  const gradeByStudent = useMemo(() => {
    const results = resultsQuery.data;
    const map = new Map<string, ReturnType<typeof summariseStudentGrade>>();
    if (!results) return map;

    for (const profile of results.students) {
      if (profile.role !== 'student') continue;
      map.set(
        profile.id,
        summariseStudentGrade({
          studentId: profile.id,
          modules: results.modules,
          lessons: results.lessons,
          progress: results.progress,
          quizzes: results.quizzes,
          attempts: results.quizAttempts,
          projects: results.projects,
          submissions: results.projectSubmissions,
        }),
      );
    }
    return map;
  }, [resultsQuery.data]);

  const students = useMemo(() => studentsQuery.data ?? [], [studentsQuery.data]);

  const attendanceByStudent = useMemo(() => {
    const map = new Map<string, ReturnType<typeof summariseAttendance>>();
    const recordsByStudent = new Map<string, typeof attendance.records>();

    for (const record of attendance.records) {
      const list = recordsByStudent.get(record.student_id) ?? [];
      list.push(record);
      recordsByStudent.set(record.student_id, list);
    }

    for (const student of students) {
      map.set(
        student.id,
        summariseAttendance(
          recordsByStudent.get(student.id) ?? [],
          attendance.sessions.length,
        ),
      );
    }
    return map;
  }, [attendance.records, attendance.sessions.length, students]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) => student.fullName.toLowerCase().includes(query));
  }, [students, search]);

  if (isLoading) return <LoadingState label="Memuat data mahasiswa…" />;
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

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        eyebrow="Kelas Pemrograman Web"
        title="Mahasiswa"
        description="Ringkasan progres, kehadiran, dan nilai akhir seluruh mahasiswa. Klik detail untuk melihat riwayat lengkap."
      />

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-sm">
        <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari nama mahasiswa…"
          className="w-full border-0 bg-transparent text-sm focus:outline-none"
        />
      </div>

      {students.length === 0 ? (
        <EmptyState
          title="Belum ada mahasiswa"
          description="Akun demo dibuat dengan npm run seed:auth setelah migrasi database."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          illustration="search"
          title="Tidak ada hasil"
          description="Coba kata kunci lain."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Mahasiswa</th>
                  <th className="px-5 py-3">Progres</th>
                  <th className="px-5 py-3">Kehadiran</th>
                  <th className="px-5 py-3">Nilai akhir</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((student) => {
                  const summary = gradeByStudent.get(student.id);
                  const attendanceSummary = attendanceByStudent.get(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-cream-50/60">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={student.fullName} size="sm" tone="blue" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {student.fullName}
                            </p>
                            <p className="text-xs text-slate-500">
                              Level {student.level} · {student.totalXp} XP
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <ProgressBar value={student.averageProgress} className="w-28" />
                          <span className="w-10 text-right text-slate-600">
                            {student.averageProgress}%
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          {student.completedLessons}/{student.totalLessons} pelajaran
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <Badge
                          tone={
                            (attendanceSummary?.percentage ?? 0) >= 80
                              ? 'green'
                              : (attendanceSummary?.percentage ?? 0) >= 60
                                ? 'amber'
                                : 'red'
                          }
                        >
                          {attendanceSummary?.percentage ?? 0}%
                        </Badge>
                        <p className="mt-1 text-xs text-slate-400">
                          {attendanceSummary?.present ?? 0}/{attendanceSummary?.total ?? 0} sesi
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Badge tone={gradeTone(summary?.breakdown.final ?? 0)}>
                            {summary?.breakdown.final ?? 0}
                          </Badge>
                          <span className="text-xs font-semibold text-slate-500">
                            {summary?.breakdown.letter ?? 'E'}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <Link
                          to={`/lecturer/students/${student.id}`}
                          className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                        >
                          Detail →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
