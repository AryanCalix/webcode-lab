import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  Lock,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { PageHeader } from '../../components/PageHeader';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  ProgressBar,
} from '../../components/ui';
import { useModulesWithProgress } from '../../features/modules/hooks';
import { useQuizzesWithAttempts } from '../../features/quizzes/hooks';
import { getErrorMessage } from '../../lib/errors';
import { formatDate } from '../../lib/format';
import { gradeTone } from '../../lib/grading';

function QuizCover({
  index,
  moduleTitle,
  durationMinutes,
}: {
  index: number;
  moduleTitle: string;
  durationMinutes: number | null;
}) {
  return (
    <div className="relative h-36 overflow-hidden bg-[#120b2b]">
      <div
        aria-hidden="true"
        className="absolute -right-14 -top-16 h-52 w-52 rounded-full bg-violet-600/55 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-fuchsia-500/25 blur-3xl"
      />
      <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-[0.16]" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-1 -top-10 select-none text-[130px] font-black leading-none text-white/[0.07]"
      >
        ?
      </span>

      <div className="relative flex h-full items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">
            Kuis {String(index + 1).padStart(2, '0')}
            <span className="h-px w-4 bg-white/25" aria-hidden="true" />
            <span className="truncate text-violet-300">{moduleTitle}</span>
          </p>
          <p className="mt-2.5 text-4xl font-black leading-none tracking-tight text-white">KUIS</p>
          <p className="mt-2.5 font-mono text-[11px] text-violet-300">
            {durationMinutes ? `${durationMinutes} menit` : 'tanpa batas waktu'}
          </p>
        </div>

        <div className="relative shrink-0">
          <div
            aria-hidden="true"
            className="absolute -inset-4 rounded-full bg-violet-500/40 blur-2xl"
          />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_16px_36px_-14px_rgba(0,0,0,0.9)] ring-1 ring-white/70">
            <ClipboardList className="h-8 w-8 text-violet-600" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuizListPage() {
  const { user } = useAuth();
  const { quizzes, isLoading, error, refetch } = useQuizzesWithAttempts(user?.id);
  const modulesState = useModulesWithProgress(user?.id);

  if (isLoading || modulesState.isLoading) return <LoadingState label="Memuat kuis…" />;
  if (error || modulesState.error) {
    return (
      <ErrorState
        message={getErrorMessage(error ?? modulesState.error)}
        onRetry={() => {
          refetch();
          modulesState.refetch();
        }}
      />
    );
  }

  const modules = new Map(modulesState.modules.map((module) => [module.id, module] as const));
  const completed = quizzes.filter(({ bestScore }) => bestScore !== null);
  const bestOverall =
    completed.length > 0
      ? Math.max(...completed.map(({ bestScore }) => bestScore ?? 0))
      : null;

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        eyebrow="Evaluasi modul"
        title="Kuis"
        description="Kuis terbuka setelah semua pelajaran pada modul selesai. Nilai dihitung di server dan percobaan terbaik dipakai untuk nilai akhir."
      />

      <div className="stagger-grid mb-5 grid gap-3 sm:grid-cols-3">
        <Card className="hover-lift flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900">{quizzes.length}</p>
            <p className="text-xs text-slate-500">kuis tersedia</p>
          </div>
        </Card>
        <Card className="hover-lift flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900">{completed.length}</p>
            <p className="text-xs text-slate-500">sudah dikerjakan</p>
          </div>
        </Card>
        <Card className="hover-lift flex items-center gap-3 p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <Trophy className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-900">{bestOverall ?? '—'}</p>
            <p className="text-xs text-slate-500">
              {bestOverall === null ? 'belum ada nilai' : 'nilai terbaik'}
            </p>
          </div>
        </Card>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          title="Belum ada kuis"
          description="Kuis akan muncul setelah dosen mempublikasikannya."
        />
      ) : (
        <div className="stagger-grid grid gap-4 md:grid-cols-2">
          {quizzes.map(({ quiz, bestScore, attemptCount }, index) => {
            const module = modules.get(quiz.module_id);
            const modulePercent = module?.progress?.progress_percent ?? 0;
            const locked = Boolean(module && module.lessonCount > 0 && modulePercent < 100);

            return (
              <Card key={quiz.id} className="group hover-lift flex flex-col overflow-hidden">
                <QuizCover
                  index={index}
                  moduleTitle={module?.title ?? 'Modul'}
                  durationMinutes={quiz.duration_minutes}
                />

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {locked ? (
                      <Badge tone="slate">
                        <Lock className="mr-1 h-3 w-3" aria-hidden="true" />
                        Terkunci
                      </Badge>
                    ) : bestScore !== null ? (
                      <Badge tone={gradeTone(bestScore)}>
                        <Trophy className="mr-1 h-3 w-3" aria-hidden="true" />
                        Terbaik {bestScore}
                      </Badge>
                    ) : (
                      <Badge tone="amber">Belum dikerjakan</Badge>
                    )}
                    <Badge tone="blue">{module?.title ?? 'Modul'}</Badge>
                  </div>

                  <h2 className="mt-2 text-lg font-bold text-slate-900">{quiz.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-700">
                    {quiz.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      {quiz.duration_minutes
                        ? `${quiz.duration_minutes} menit`
                        : 'Tanpa batas waktu'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      {quiz.deadline_at ? `Tenggat ${formatDate(quiz.deadline_at)}` : 'Tanpa tenggat'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <RotateCcw className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      {attemptCount} percobaan
                    </span>
                  </div>

                  {locked ? (
                    <div className="mt-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                      <p className="text-xs font-semibold text-slate-700">
                        Selesaikan modul untuk membuka kuis
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <ProgressBar value={modulePercent} className="h-1.5 flex-1" />
                        <span className="text-xs font-semibold text-slate-500">
                          {modulePercent}%
                        </span>
                      </div>
                    </div>
                  ) : bestScore !== null ? (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                        <span>Nilai terbaik</span>
                        <span>{bestScore}/100</span>
                      </div>
                      <div className="mt-1.5">
                        <ProgressBar value={bestScore} className="h-1.5" />
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                    <p className="text-xs text-slate-500">
                      {locked
                        ? 'Kuis terbuka setelah modul tuntas.'
                        : bestScore !== null
                          ? 'Bisa dikerjakan ulang untuk latihan.'
                          : 'Siap dikerjakan sekarang.'}
                    </p>
                    {locked ? (
                      <Link
                        to={`/student/modules/${quiz.module_id}`}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-violet-400 hover:text-violet-700"
                      >
                        Buka modul
                        <ArrowRight
                          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </Link>
                    ) : (
                      <Link
                        to={`/student/quizzes/${quiz.id}`}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
                      >
                        <ClipboardList className="h-4 w-4" aria-hidden="true" />
                        {bestScore !== null ? 'Kerjakan lagi' : 'Kerjakan kuis'}
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
