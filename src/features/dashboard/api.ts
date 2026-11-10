import type {
  BadgeRow,
  GamificationProfileRow,
  XpTransactionRow,
} from '../../lib/database.types';
import { throwIfError } from '../../lib/errors';
import { getSupabase } from '../../lib/supabase';

export interface GamificationSummary {
  totalXp: number;
  level: number;
  levelName: string;
  currentStreak: number;
  lastActivityDate: string | null;
}

const EMPTY_SUMMARY: GamificationSummary = {
  totalXp: 0,
  level: 1,
  levelName: 'Pemula',
  currentStreak: 0,
  lastActivityDate: null,
};

function mapSummary(row: GamificationProfileRow | null): GamificationSummary {
  if (!row) return EMPTY_SUMMARY;
  return {
    totalXp: row.total_xp,
    level: row.level,
    levelName: row.level_name,
    currentStreak: row.current_streak,
    lastActivityDate: row.last_activity_date,
  };
}

export async function fetchGamification(studentId: string): Promise<GamificationSummary> {
  const { data, error } = await getSupabase()
    .from('gamification_profiles')
    .select('*')
    .eq('student_id', studentId)
    .maybeSingle();

  throwIfError(error);
  return mapSummary(data);
}

export interface BadgeWithStatus extends BadgeRow {
  awardedAt: string | null;
}

export async function fetchBadges(studentId: string): Promise<BadgeWithStatus[]> {
  const supabase = getSupabase();
  const [badgesResult, awardedResult] = await Promise.all([
    supabase.from('badges').select('*').order('name', { ascending: true }),
    supabase.from('student_badges').select('*').eq('student_id', studentId),
  ]);

  throwIfError(badgesResult.error);
  throwIfError(awardedResult.error);

  const awardedByBadge = new Map(
    (awardedResult.data ?? []).map((row) => [row.badge_id, row.awarded_at] as const),
  );

  return (badgesResult.data ?? []).map((badge) => ({
    ...badge,
    awardedAt: awardedByBadge.get(badge.id) ?? null,
  }));
}

export async function fetchXpTransactions(
  studentId: string,
  limit = 20,
): Promise<XpTransactionRow[]> {
  const { data, error } = await getSupabase()
    .from('xp_transactions')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(limit);

  throwIfError(error);
  return data ?? [];
}
