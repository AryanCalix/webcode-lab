import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Flame, Sparkles, Trophy, Zap } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { ModuleLanguageIcon } from '../../components/ModuleThumbnail';
import { PageHeader } from '../../components/PageHeader';
import { ProgressRing } from '../../components/ProgressRing';
import { StatCard } from '../../components/StatCard';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  ProgressBar,
  Skeleton,
} from '../../components/ui';
import { useBadges, useGamification } from '../../features/dashboard/hooks';
import { useModulesWithProgress } from '../../features/modules/hooks';
import { useProjectsWithSubmissions } from '../../features/projects/hooks';
import { useQuizzesWithAttempts } from '../../features/quizzes/hooks';
import { getErrorMessage } from '../../lib/errors';
import { buildStreakWeek, isStreakCurrent } from '../../lib/format';
import { calculateGrade, gradeTone } from '../../lib/grading';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const gamificationQuery = useGamification(user?.id);
  const badgesQuery = useBadges(user?.id);
  const modulesState = useModulesWithProgress(user?.id);
  const quizzesState = useQuizzesWithAttempts(user?.id);
  const projectsState = useProjectsWithSubmissions(user?.id);

  if (
    gamificationQuery.isLoading ||
    badgesQuery.isLoading ||
    modulesState.isLoading ||
    quizzesState.isLoading ||
    projectsState.isLoading
  ) {
    return (
      <div className="mx-auto grid max-w-5xl gap-4">
        <Skeleton className="h-44 w-full" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const error =
    gamificationQuery.error ??
    badgesQuery.error ??
    modulesState.error ??
    quizzesState.error ??
    projectsState.error;

  if (error) {
    return (
      <ErrorState
        message={getErrorMessage(error)}
        onRetry={() => {
          void gamificationQuery.refetch();
          void badgesQuery.refetch();
          modulesState.refetch();
          quizzesState.refetch();
          projectsState.refetch();
        }}
      />
    );
  }

  const gamification = gamificationQuery.data;
  const badges = badgesQuery.data ?? [];
  const awardedBadges = badges.filter((badge) => badge.awardedAt);
  const modules = modulesState.modules;
  const activeModules = modules.filter((module) => module.lessonCount > 0);
  const modulePercent =
    activeModules.length > 0
      ? Math.round(
          activeModules.reduce((sum, module) => sum + (module.progress?.progress_percent ?? 0), 0) /
            activeModules.length,
        )
      : 0;
  const nextModule = activeModules.find((module) => (module.progress?.progress_percent ?? 0) < 100);
  const quizScores = quizzesState.quizzes
    .map((quiz) => quiz.bestScore)
    .filter((score): score is number => score !== null);
  const projectScores = projectsState.projects
    .map((project) => project.submission?.score)
    .filter((score): score is number => score != null);
  const grade = calculateGrade({ projectScores, modulePercent, quizScores });

  const streak = isStreakCurrent(gamification?.lastActivityDate)
    ? (gamification?.currentStreak ?? 0)
    : 0;
  const week = buildStreakWeek(streak, gamification?.lastActivityDate);

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        eyebrow="Ruang belajar"
        title={`Halo, ${user?.full_name ?? 'Mahasiswa'}!`}
        description="Lanjutkan perjalanan coding-mu. Materi, latihan, proyek, dan umpan balik dosen ada di satu tempat."
        action={
          nextModule ? (
            <Link
              to={`/student/modules/${nextModule.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
            >
              Lanjutkan Belajar
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : null
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card className="overflow-hidden">
          <div className="hero-mesh flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-700">
                Progres kelas
              </p>
              <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
                {modulePercent}%
              </p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
                {nextModule
                  ? `Tahap berikutnya: ${nextModule.title}. Selesaikan pelajaran berurutan agar kuis dan proyek modul terbuka.`
                  : 'Semua modul sudah selesai. Kamu bisa mengulang materi atau mengecek nilai akhir.'}
              </p>
            </div>
            <ProgressRing value={modulePercent} size={112} strokeWidth={10} />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Nilai akhir sementara</p>
              <p className="mt-1 flex items-center gap-2 text-3xl font-bold text-slate-900">
                {grade.final}
                <Badge tone={gradeTone(grade.final)}>{grade.letter}</Badge>
              </p>
            </div>
            <Trophy className="h-8 w-8 text-amber-500" aria-hidden="true" />
          </div>

          <div className="mt-4 space-y-3">
            {[
              { label: 'Proyek (50%)', value: grade.project },
              { label: 'Modul (40%)', value: grade.module },
              { label: 'Kuis (10%)', value: grade.quiz },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <ProgressBar value={item.value} className="h-1.5" />
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Absensi bersifat informatif dan tidak mengubah nilai akhir.
          </p>
        </Card>
      </div>

      <div className="stagger-grid mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total XP"
          value={gamification?.totalXp ?? 0}
          hint={`Level ${gamification?.level ?? 1} — ${gamification?.levelName ?? 'Pemula'}`}
          icon={Zap}
          tone="orange"
        />
        <StatCard
          label="Streak belajar"
          value={`${streak} hari`}
          hint="jaga ritme setiap hari"
          icon={Flame}
          tone="violet"
        />
        <StatCard
          label="Materi selesai"
          value={`${modules.reduce(
            (sum, module) => sum + (module.progress?.completed_lessons ?? 0),
            0,
          )}`}
          hint={`dari ${modules.reduce((sum, module) => sum + module.lessonCount, 0)} pelajaran`}
          icon={BookOpen}
          tone="emerald"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Ritme minggu ini</h2>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {streak > 0 ? `${streak} hari beruntun` : 'Mulai hari ini'}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {week.map((day) => (
              <div key={day.key} className="text-center">
                <p className="mb-1 text-[11px] font-semibold uppercase text-slate-400">
                  {day.label}
                </p>
                <div
                  className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${
                    day.active
                      ? 'bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                  title={day.active ? 'Ada aktivitas belajar' : 'Belum ada aktivitas'}
                >
                  {day.active ? '✓' : '·'}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Selesaikan satu pelajaran setiap hari untuk menjaga streak dan progres.
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-slate-900">Lencana</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {awardedBadges.length === 0 ? (
              <p className="text-sm leading-relaxed text-slate-500">
                Belum ada lencana. Selesaikan latihan atau proyek untuk mendapatkan lencana
                pertama.
              </p>
            ) : (
              awardedBadges.map((badge) => (
                <span
                  key={badge.id}
                  title={badge.description}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800"
                >
                  🏅 {badge.name}
                </span>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Modul kamu</h2>
          <Link
            to="/student/modules"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Lihat semua modul →
          </Link>
        </div>

        {modules.length === 0 ? (
          <EmptyState
            title="Belum ada modul"
            description="Modul akan muncul setelah dosen mempublikasikannya."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {modules.slice(0, 4).map((module) => {
              const percent = module.progress?.progress_percent ?? 0;
              const isComplete = percent >= 100;
              return (
                <Card key={module.id} className="hover-lift flex flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <ModuleLanguageIcon title={module.title} />
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-slate-900">{module.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                          {module.description}
                        </p>
                      </div>
                    </div>
                    <Badge tone={isComplete ? 'green' : percent > 0 ? 'amber' : 'slate'}>
                      {isComplete ? 'Selesai' : percent > 0 ? 'Berjalan' : 'Baru'}
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
                      <span>
                        {module.progress?.completed_lessons ?? 0}/{module.lessonCount} pelajaran
                      </span>
                      <span>{percent}%</span>
                    </div>
                    <ProgressBar value={percent} />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Link
                      to={`/student/modules/${module.id}`}
                      className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                    >
                      {isComplete ? 'Buka kembali' : 'Buka modul'} →
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
