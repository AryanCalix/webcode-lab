export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function isPastDeadline(value: string | null | undefined): boolean {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() < Date.now();
}

export interface StreakDay {
  key: string;
  label: string;
  active: boolean;
}

function formatDateKey(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function parseDateKey(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysSinceActivity(
  lastActivityDate: string | null | undefined,
  today = new Date(),
): number | null {
  const activityDate = lastActivityDate ? parseDateKey(lastActivityDate) : null;
  if (!activityDate) return null;
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfActivity = new Date(
    activityDate.getFullYear(),
    activityDate.getMonth(),
    activityDate.getDate(),
  );
  return Math.round((startOfToday.getTime() - startOfActivity.getTime()) / 86_400_000);
}

/**
 * A stored streak only counts while the student studied today or yesterday.
 * Older activity means the streak has lapsed until they return.
 */
export function isStreakCurrent(
  lastActivityDate: string | null | undefined,
  today = new Date(),
): boolean {
  const days = daysSinceActivity(lastActivityDate, today);
  return days !== null && days >= 0 && days <= 1;
}

/**
 * Builds the last seven days ending today and marks the days covered by the
 * current streak. A streak is only shown when the last activity happened today
 * or yesterday; older activity means the streak is stale and today is not lit.
 * Kept outside components so render stays deterministic.
 */
export function buildStreakWeek(
  streak: number,
  lastActivityDate: string | null | undefined,
  today = new Date(),
): StreakDay[] {
  const safeStreak = Math.max(0, Math.floor(streak));
  const activeDays = new Set<string>();
  const activityDate = lastActivityDate ? parseDateKey(lastActivityDate) : null;
  const activityAge = daysSinceActivity(lastActivityDate, today);

  if (
    activityDate &&
    safeStreak > 0 &&
    activityAge !== null &&
    activityAge >= 0 &&
    activityAge <= 1
  ) {
    for (let index = 0; index < safeStreak; index += 1) {
      const date = new Date(activityDate);
      date.setDate(activityDate.getDate() - index);
      activeDays.add(formatDateKey(date));
    }
  }

  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfToday);
    date.setDate(startOfToday.getDate() - (6 - index));
    const key = formatDateKey(date);
    return {
      key,
      label: date.toLocaleDateString('id-ID', { weekday: 'short' }),
      active: activeDays.has(key),
    };
  });
}

/**
 * Only http(s) URLs are rendered as links. Everything else (including
 * javascript: and data:) becomes null.
 */
export function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}
