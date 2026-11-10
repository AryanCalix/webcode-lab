import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import { Avatar } from '../../components/Avatar';
import { PageHeader } from '../../components/PageHeader';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  ProgressBar,
  inputClassName,
} from '../../components/ui';
import { summariseAttendance, useAttendanceData } from '../../features/attendance/hooks';
import { summariseStudentGrade } from '../../features/grading/summary';
import {
  useCreateStudent,
  useLecturerResults,
  useStudentsOverview,
} from '../../features/lecturer/hooks';
import { getErrorMessage } from '../../lib/errors';
import { gradeTone } from '../../lib/grading';

function CreateStudentDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (fullName: string) => void;
}) {
  const createStudent = useCreateStudent();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    createStudent.mutate(
      { fullName: fullName.trim(), email: email.trim(), password },
      {
        onSuccess: (student) => onCreated(student.fullName),
        onError: (mutationError) => setError(getErrorMessage(mutationError)),
      },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-student-title"
    >
      <Card className="w-full max-w-md p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="create-student-title" className="text-lg font-semibold text-slate-900">
              Tambah Mahasiswa
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Akun mahasiswa langsung aktif dan dapat masuk dengan email serta password ini.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Tutup form tambah mahasiswa">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          <Field label="Nama lengkap" htmlFor="student-full-name">
            <input
              id="student-full-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className={inputClassName}
              placeholder="Contoh: Budi Santoso"
              required
              minLength={2}
              maxLength={120}
            />
          </Field>
          <Field label="Email" htmlFor="student-email">
            <input
              id="student-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClassName}
              placeholder="nama@webcode.lab"
              required
            />
          </Field>
          <Field label="Password awal" htmlFor="student-password">
            <input
              id="student-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClassName}
              placeholder="Minimal 8 karakter"
              required
              minLength={8}
              maxLength={72}
            />
          </Field>

          {error ? <Alert tone="error">{error}</Alert> : null}

          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={createStudent.isPending}>
              {createStudent.isPending ? 'Menyimpan…' : 'Tambah Mahasiswa'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function StudentsPage() {
  const studentsQuery = useStudentsOverview();
  const resultsQuery = useLecturerResults();
  const attendance = useAttendanceData();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createdName, setCreatedName] = useState<string | null>(null);

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
        action={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah Mahasiswa
          </Button>
        }
      />

      {createdName ? (
        <div className="mb-4">
          <Alert tone="success">
            Akun mahasiswa {createdName} berhasil dibuat.
          </Alert>
        </div>
      ) : null}

      {showCreate ? (
        <CreateStudentDialog
          onClose={() => setShowCreate(false)}
          onCreated={(fullName) => {
            setCreatedName(fullName);
            setShowCreate(false);
          }}
        />
      ) : null}

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
