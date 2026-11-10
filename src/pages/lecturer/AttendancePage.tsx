import { useMemo, useState } from 'react';
import { CalendarCheck, CheckCircle2, Plus, Save, ShieldAlert, Trash2, Users } from 'lucide-react';
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
import {
  summariseAttendance,
  useAttendanceData,
  useDeleteAttendanceSession,
  useSaveAttendance,
} from '../../features/attendance/hooks';
import { attendanceLabels, ATTENDANCE_STATUSES } from '../../features/attendance/labels';
import { useStudentsOverview } from '../../features/lecturer/hooks';
import type { AttendanceStatus } from '../../lib/database.types';
import { getErrorMessage } from '../../lib/errors';
import { formatDate } from '../../lib/format';

function todayInputValue(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export default function LecturerAttendancePage() {
  const studentsQuery = useStudentsOverview();
  const { sessions, isLoading: attendanceLoading, error: attendanceError, refetch } =
    useAttendanceData();
  const saveAttendance = useSaveAttendance();
  const deleteSession = useDeleteAttendanceSession();

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [sessionDate, setSessionDate] = useState(todayInputValue);
  const [topic, setTopic] = useState('');
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const students = studentsQuery.data ?? [];
  const sortedSessions = useMemo(
    () =>
      [...sessions].sort((a, b) => {
        if (a.session_date === b.session_date) return a.topic.localeCompare(b.topic);
        return b.session_date.localeCompare(a.session_date);
      }),
    [sessions],
  );

  const sessionStats = useMemo(() => {
    const records = sortedSessions.flatMap((session) => session.records);
    return summariseAttendance(records, sortedSessions.length * students.length);
  }, [sortedSessions, students.length]);

  const startNewSession = () => {
    setEditingSessionId(null);
    setSessionDate(todayInputValue());
    setTopic('');
    setStatuses({});
    setNotes({});
    setFormError(null);
    saveAttendance.reset();
  };

  const startEditing = (session: (typeof sortedSessions)[number]) => {
    setEditingSessionId(session.id);
    setSessionDate(session.session_date);
    setTopic(session.topic);

    const nextStatuses: Record<string, AttendanceStatus> = {};
    const nextNotes: Record<string, string> = {};
    for (const record of session.records) {
      nextStatuses[record.student_id] = record.status;
      if (record.note) nextNotes[record.student_id] = record.note;
    }
    setStatuses(nextStatuses);
    setNotes(nextNotes);
    setFormError(null);
    saveAttendance.reset();
  };

  const setAllPresent = () => {
    setStatuses({});
    setNotes({});
  };

  const handleSave = () => {
    setFormError(null);

    if (!sessionDate) {
      setFormError('Tanggal sesi wajib diisi.');
      return;
    }

    const exceptions = students
      .map((student) => ({
        studentId: student.id,
        status: statuses[student.id] ?? 'present',
        note: (notes[student.id] ?? '').trim(),
      }))
      .filter((record) => record.status !== 'present' || record.note !== '')
      .map((record) => ({
        studentId: record.studentId,
        status: record.status,
        note: record.note,
      }));

    saveAttendance.mutate(
      { sessionDate, topic: topic.trim(), records: exceptions },
      { onSuccess: startNewSession },
    );
  };

  const handleDelete = (sessionId: string, label: string) => {
    const confirmed = window.confirm(`Hapus sesi absensi “${label}”?`);
    if (!confirmed) return;
    deleteSession.mutate(sessionId, {
      onSuccess: () => {
        if (editingSessionId === sessionId) startNewSession();
      },
    });
  };

  if (studentsQuery.isLoading || attendanceLoading) {
    return <LoadingState label="Memuat absensi kelas…" />;
  }

  const error = studentsQuery.error ?? attendanceError;
  if (error) {
    return (
      <ErrorState
        message={getErrorMessage(error)}
        onRetry={() => {
          void studentsQuery.refetch();
          refetch();
        }}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        eyebrow="Kehadiran"
        title="Absensi Kelas"
        description="Buat sesi absensi dan tandai mahasiswa yang tidak hadir. Semua mahasiswa otomatis dianggap hadir sehingga Anda hanya perlu mengisi pengecualian."
        action={
          <Button variant="outline" onClick={startNewSession}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Sesi Baru
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total sesi" value={sortedSessions.length} icon={CalendarCheck} tone="orange" />
        <StatCard label="Mahasiswa" value={students.length} icon={Users} tone="blue" />
        <StatCard
          label="Rata-rata hadir"
          value={`${sessionStats.percentage}%`}
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="Tidak hadir"
          value={sessionStats.absent}
          hint="catatan sesi"
          icon={ShieldAlert}
          tone="violet"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {editingSessionId ? 'Ubah sesi absensi' : 'Sesi absensi baru'}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {editingSessionId
                  ? 'Tanggal dan topik sesi tidak dapat diubah. Hapus sesi jika perlu membuat ulang.'
                  : 'Tanggal dan topik membantu mahasiswa menemukan sesi yang tepat.'}
              </p>
            </div>
            {editingSessionId ? <Badge tone="amber">Mode edit</Badge> : null}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Tanggal" htmlFor="attendance-date">
              <input
                id="attendance-date"
                type="date"
                value={sessionDate}
                disabled={Boolean(editingSessionId)}
                onChange={(event) => setSessionDate(event.target.value)}
                className={inputClassName}
              />
            </Field>
            <Field label="Topik sesi" htmlFor="attendance-topic">
              <input
                id="attendance-topic"
                value={topic}
                disabled={Boolean(editingSessionId)}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Contoh: CSS Layout & Flexbox"
                className={inputClassName}
              />
            </Field>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Daftar mahasiswa</h3>
            <Button variant="ghost" size="sm" onClick={setAllPresent}>
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Tandai semua hadir
            </Button>
          </div>

          {students.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                illustration="attendance"
                title="Belum ada mahasiswa"
                description="Akun mahasiswa perlu dibuat terlebih dahulu sebelum absensi dapat dicatat."
              />
            </div>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Mahasiswa</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {students.map((student) => {
                    const status = statuses[student.id] ?? 'present';
                    return (
                      <tr key={student.id}>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                          {student.fullName}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={status}
                            onChange={(event) =>
                              setStatuses((previous) => ({
                                ...previous,
                                [student.id]: event.target.value as AttendanceStatus,
                              }))
                            }
                            className={inputClassName}
                            aria-label={`Status absensi ${student.fullName}`}
                          >
                            {ATTENDANCE_STATUSES.map((option) => (
                              <option key={option} value={option}>
                                {attendanceLabels[option]}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            value={notes[student.id] ?? ''}
                            onChange={(event) =>
                              setNotes((previous) => ({
                                ...previous,
                                [student.id]: event.target.value,
                              }))
                            }
                            placeholder="Opsional"
                            className={inputClassName}
                            aria-label={`Catatan absensi ${student.fullName}`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {formError ? <div className="mt-4"><Alert tone="error">{formError}</Alert></div> : null}
          {saveAttendance.error ? (
            <div className="mt-4"><Alert tone="error">{getErrorMessage(saveAttendance.error)}</Alert></div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saveAttendance.isPending || students.length === 0}
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {saveAttendance.isPending ? 'Menyimpan…' : 'Simpan Absensi'}
            </Button>
            {editingSessionId ? (
              <Button variant="outline" onClick={startNewSession}>
                Batal edit
              </Button>
            ) : null}
          </div>
        </Card>

        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Riwayat sesi</h2>

          {deleteSession.error ? (
            <div className="mb-4">
              <Alert tone="error">{getErrorMessage(deleteSession.error)}</Alert>
            </div>
          ) : null}

          {sortedSessions.length === 0 ? (
            <EmptyState
              illustration="attendance"
              title="Belum ada sesi"
              description="Sesi absensi pertama akan muncul di sini setelah disimpan."
            />
          ) : (
            <div className="grid gap-3">
              {sortedSessions.map((session) => {
                const stats = summariseAttendance(session.records, students.length);
                const label = session.topic.trim() || 'Sesi kelas';
                return (
                  <Card key={session.id} className="hover-lift p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{label}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatDate(session.session_date)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => startEditing(session)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(session.id, label)}
                          disabled={deleteSession.isPending}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge tone="green">{stats.present} hadir</Badge>
                      {stats.excused > 0 ? <Badge tone="amber">{stats.excused} izin</Badge> : null}
                      {stats.sick > 0 ? <Badge tone="blue">{stats.sick} sakit</Badge> : null}
                      {stats.absent > 0 ? <Badge tone="red">{stats.absent} tidak hadir</Badge> : null}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
