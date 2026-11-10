import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Trophy, Zap } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Badge, Card, EmptyState, ErrorState, LoadingState, ProgressBar } from '../../components/ui';
import { useBadges, useGamification } from '../../features/dashboard/hooks';
import { useModulesWithProgress } from '../../features/modules/hooks';
import { getErrorMessage } from '../../lib/errors';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const gamificationQuery = useGamification(user?.id);
  const badgesQuery = useBadges(user?.id);
  const modulesState = useModulesWithProgress(user?.id);

  if (!user) return null;

  if (gamificationQuery.isLoading || badgesQuery.isLoading || modulesState.isLoading) {
    return <LoadingState label="Memuat dashboard…" />;
  }

  if (gamificationQuery.error || badgesQuery.error || modulesState.error) {
    return (
      <ErrorState
        message={getErrorMessage(
          gamificationQuery.error ?? badgesQuery.error ?? modulesState.error,
        )}
        onRetry={() => {
          void gamificationQuery.refetch();
          void badgesQuery.refetch();
          modulesState.refetch();
        }}
      />
    );
  }

  const gamification = gamificationQuery.data;
  const badges = badgesQuery.data ?? [];
  const awardedBadges = badges.filter((badge) => badge.awardedAt);
  const nextModule = modulesState.modules.find(
    (module) => (module.progress?.progress_percent ?? 0) < 100,
  );

  const stats = [
    {
      label: 'Level',
      value: String(gamification?.level ?? 1),
      hint: gamification?.levelName ?? 'Pemula',
      icon: Trophy,
      accent: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Total XP',
      value: String(gamification?.totalXp ?? 0),
      hint: 'poin belajar',
      icon: Zap,
      accent: 'bg-brand-100 text-brand-700',
    },
    {
      label: 'Streak',
      value: `${gamification?.currentStreak ?? 0} hari`,
      hint: 'belajar berturut-turut',
      icon: Flame,
      accent: 'bg-orange-100 text-orange-700',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Halo, {user.full_name}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Lanjutkan praktik coding Anda — materi, latihan, dan umpan balik ada di satu tempat.
          </p>
        </div>
        {nextModule ? (
          <Link
            to={`/student/modules/${nextModule.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            Lanjutkan Belajar
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.accent}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="mt-0.5 text-xs text-slate-500">{stat.hint}</p>
            </Card>
          );
        })}
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Lencana</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {awardedBadges.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada lencana. Selesaikan latihan untuk mendapatkan lencana pertama.
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
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Progres Modul</h2>
          <Link
            to="/student/modules"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Lihat semua modul →
          </Link>
        </div>

        {modulesState.modules.length === 0 ? (
          <EmptyState
            title="Belum ada modul"
            description="Modul akan muncul setelah dosen mempublikasikannya."
          />
        ) : (
          <div className="grid gap-4">
            {modulesState.modules.map((module) => {
              const percent = module.progress?.progress_percent ?? 0;
              const isComplete = percent >= 100;
              return (
                <Card key={module.id} className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-slate-900">
                          {module.title}
                        </h3>
                        <Badge tone={isComplete ? 'green' : percent > 0 ? 'amber' : 'slate'}>
                          {isComplete ? 'Selesai' : percent > 0 ? 'Sedang dikerjakan' : 'Belum dimulai'}
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <ProgressBar value={percent} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="text-sm font-medium text-slate-600">{percent}%</span>
                      <Link
                        to={`/student/modules/${module.id}`}
                        className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                      >
                        {isComplete ? 'Buka kembali' : 'Buka Modul'} →
                      </Link>
                    </div>
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
