import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Trophy, Zap } from 'lucide-react';
import { modules, studentProfile } from '../../data/demoData';
import { getProfile, badgeDefinitions } from '../../services/gamification';
import { Badge, Card, ProgressBar } from '../../components/ui';

export default function StudentDashboardPage() {
  const profile = getProfile('usr_student');
  const sortedModules = [...modules].sort((a, b) => a.order - b.order);
  const nextModule = sortedModules.find((module) => module.status !== 'completed');

  const stats = [
    {
      label: 'Level',
      value: String(profile.level),
      hint: profile.levelName,
      icon: Trophy,
      accent: 'bg-amber-100 text-amber-700',
    },
    {
      label: 'Total XP',
      value: String(profile.totalXp),
      hint: 'poin belajar',
      icon: Zap,
      accent: 'bg-brand-100 text-brand-700',
    },
    {
      label: 'Streak',
      value: `${profile.currentStreak} hari`,
      hint: 'meniti belajar',
      icon: Flame,
      accent: 'bg-orange-100 text-orange-700',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Halo, {studentProfile.fullName}</h1>
          <p className="mt-1 text-sm text-slate-600">
            Lanjutkan praktik coding Anda — materi, latihan, dan umpan balik ada di satu tempat.
          </p>
        </div>
        {nextModule ? (
          <Link
            to={`/student/modules/${nextModule.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
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
          {profile.badges.length === 0 ? (
            <p className="text-sm text-slate-500">
              Belum ada lencana. Selesaikan latihan untuk mendapatkan lencana pertama.
            </p>
          ) : (
            profile.badges.map((badgeId) => {
              const badge = badgeDefinitions.find((item) => item.id === badgeId);
              return (
                <span
                  key={badgeId}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800"
                >
                  🏅 {badge?.name ?? badgeId}
                </span>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Progres Modul</h2>
          <Link to="/student/modules" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
            Lihat semua modul →
          </Link>
        </div>

        <div className="grid gap-4">
          {sortedModules.map((module) => (
            <Card key={module.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-base font-semibold text-slate-900">{module.title}</h3>
                    <Badge
                      tone={
                        module.status === 'completed'
                          ? 'green'
                          : module.status === 'in-progress'
                            ? 'amber'
                            : 'slate'
                      }
                    >
                      {module.status === 'completed'
                        ? 'Selesai'
                        : module.status === 'in-progress'
                          ? 'Sedang dikerjakan'
                          : 'Belum dimulai'}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={module.progressPercent} />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className="text-sm font-medium text-slate-600">{module.progressPercent}%</span>
                  <Link
                    to={`/student/modules/${module.id}`}
                    className="text-sm font-semibold text-brand-700 hover:text-brand-800"
                  >
                    {module.status === 'completed' ? 'Buka kembali' : 'Buka Modul'} →
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
