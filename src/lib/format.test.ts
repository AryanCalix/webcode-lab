import { describe, expect, it } from 'vitest';
import { buildStreakWeek, isStreakCurrent } from './format';

const TODAY = new Date(2026, 10, 10, 12, 0, 0);

function activeKeys(lastActivityDate: string | null, streak: number): string[] {
  return buildStreakWeek(streak, lastActivityDate, TODAY)
    .filter((day) => day.active)
    .map((day) => day.key);
}

describe('buildStreakWeek', () => {
  it('lights today and the preceding days when activity happened today', () => {
    expect(activeKeys('2026-11-10', 3)).toEqual([
      '2026-11-08',
      '2026-11-09',
      '2026-11-10',
    ]);
  });

  it('keeps yesterday active but leaves today unlit before the student studies', () => {
    expect(activeKeys('2026-11-09', 2)).toEqual(['2026-11-08', '2026-11-09']);
  });

  it('does not light any day when the streak is stale', () => {
    expect(activeKeys('2026-11-05', 5)).toEqual([]);
  });

  it('does not light any day without a last activity date', () => {
    expect(activeKeys(null, 5)).toEqual([]);
  });

  it('does not light any day for a zero streak', () => {
    expect(activeKeys('2026-11-10', 0)).toEqual([]);
  });

  it('ignores malformed activity dates', () => {
    expect(activeKeys('not-a-date', 3)).toEqual([]);
  });
});

describe('isStreakCurrent', () => {
  it('treats activity today and yesterday as current', () => {
    expect(isStreakCurrent('2026-11-10', TODAY)).toBe(true);
    expect(isStreakCurrent('2026-11-09', TODAY)).toBe(true);
  });

  it('treats older or missing activity as lapsed', () => {
    expect(isStreakCurrent('2026-11-08', TODAY)).toBe(false);
    expect(isStreakCurrent(null, TODAY)).toBe(false);
    expect(isStreakCurrent('not-a-date', TODAY)).toBe(false);
  });
});
