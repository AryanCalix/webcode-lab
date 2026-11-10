import { CalendarCheck, CheckCircle2, HeartPulse, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { PageHeader } from '../../components/PageHeader';
import { ProgressRing } from '../../components/ProgressRing';
import { StatCard } from '../../components/StatCard';
import { Badge, Card, EmptyState, ErrorState, LoadingState } from '../../components/ui';
import { useStudentAttendance } from '../../features/attendance/hooks';
import { attendanceLabels, attendanceTones } from '../../features/attendance/labels';
import { getErrorMessage } from '../../lib/errors';
import { formatDate } from '../../lib/format';

export default function StudentAttendancePage() {
  const { user } = useAuth();
  const { sessions, summary, isLoading, error, refetch } = useStudentAttendance(user?.id);

  if (isLoading) return <LoadingState label="Memuat absensi…" />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        eyebrow="Kehadiran"
        title="Absensi Kelas"
        description="Rekap kehadiran Anda di kelas Pemrograman Web. Absensi bersifat informatif dan tidak mengubah nilai akhir."
      />

      <Card className="overflow-hidden">
        <div className="hero-mesh flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-700">
              Persentase kehadiran
            </p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
              {summary.percentage}%
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
              {summary.total === 0
                ? 'Belum ada sesi absensi yang dicatat oleh dosen.'
                : `Hadir pada ${summary.present} dari ${summary.total} sesi yang tercatat.`}
            </p>
          </div>
          <ProgressRing value={summary.percentage} size={108} strokeWidth={10} />
        </div>
      </Card>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Hadir"
          value={summary.present}
          hint="sesi"
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard label="Izin" value={summary.excused} hint="sesi" icon={CalendarCheck} tone="orange" />
        <StatCard label="Sakit" value={summary.sick} hint="sesi" icon={HeartPulse} tone="blue" />
        <StatCard
          label="Tidak hadir"
          value={summary.absent}
          hint="sesi"
          icon={ShieldAlert}
          tone="violet"
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Riwayat sesi</h2>

        {sessions.length === 0 ? (
          <EmptyState
            illustration="attendance"
            title="Belum ada sesi absensi"
            description="Dosen belum mencatat sesi absensi. Riwayat akan muncul di sini setelah sesi pertama dibuat."
          />
        ) : (
          <Card className="overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {sessions.map((session) => {
                const status = session.record?.status ?? 'present';
                return (
                  <li
                    key={session.id}
                    className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {session.topic.trim() || 'Sesi kelas'}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDate(session.session_date)}
                        {session.record?.note ? ` · ${session.record.note}` : ''}
                      </p>
                    </div>
                    <Badge tone={attendanceTones[status]}>{attendanceLabels[status]}</Badge>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}
