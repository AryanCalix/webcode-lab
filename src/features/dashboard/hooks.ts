import { useQuery } from '@tanstack/react-query';
import { fetchBadges, fetchGamification, fetchXpTransactions } from './api';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  gamification: (studentId: string) => [...dashboardKeys.all, 'gamification', studentId] as const,
  badges: (studentId: string) => [...dashboardKeys.all, 'badges', studentId] as const,
  xp: (studentId: string) => [...dashboardKeys.all, 'xp', studentId] as const,
};

export function useGamification(studentId: string | undefined) {
  return useQuery({
    queryKey: dashboardKeys.gamification(studentId ?? 'anonymous'),
    queryFn: () => fetchGamification(studentId as string),
    enabled: Boolean(studentId),
  });
}

export function useBadges(studentId: string | undefined) {
  return useQuery({
    queryKey: dashboardKeys.badges(studentId ?? 'anonymous'),
    queryFn: () => fetchBadges(studentId as string),
    enabled: Boolean(studentId),
  });
}

export function useXpTransactions(studentId: string | undefined) {
  return useQuery({
    queryKey: dashboardKeys.xp(studentId ?? 'anonymous'),
    queryFn: () => fetchXpTransactions(studentId as string),
    enabled: Boolean(studentId),
  });
}
