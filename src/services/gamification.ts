import { studentProfile } from '../data/demoData';

export interface GamificationProfile {
  studentId: string;
  totalXp: number;
  level: number;
  levelName: string;
  currentStreak: number;
  lastActivityDate: string;
  badges: string[];
}

export interface XpTransaction {
  id: string;
  studentId: string;
  sourceType: string;
  sourceId: string;
  xpAmount: number;
  createdAt: string;
}

const PROFILE_KEY = 'webcode.gamification.v1';
const TRANSACTIONS_KEY = 'webcode.xp-transactions.v1';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // abaikan kegagalan penyimpanan lokal
  }
}

export function getLevelForXp(totalXp: number): { level: number; levelName: string } {
  if (totalXp < 100) {
    return { level: 1, levelName: 'Pemula' };
  }
  if (totalXp < 300) {
    return { level: 2, levelName: 'Menengah' };
  }
  if (totalXp < 600) {
    return { level: 3, levelName: 'Atasan' };
  }
  return { level: 4, levelName: 'Veteran' };
}

export const badgeDefinitions = [
  { id: 'first-solve', name: 'Pertama', description: 'Menyelesaikan latihan pertama.' },
];

export function getProfile(studentId: string): GamificationProfile {
  const stored = readJson<GamificationProfile | null>(PROFILE_KEY, null);
  if (stored && stored.studentId === studentId) {
    return stored;
  }
  const { level, levelName } = getLevelForXp(studentProfile.totalXp);
  return {
    studentId,
    totalXp: studentProfile.totalXp,
    level,
    levelName,
    currentStreak: studentProfile.currentStreak,
    lastActivityDate: '',
    badges: [],
  };
}

export function awardXp(
  studentId: string,
  sourceType: string,
  sourceId: string,
  xpAmount: number,
): { awarded: boolean; profile: GamificationProfile } {
  const transactions = readJson<XpTransaction[]>(TRANSACTIONS_KEY, []);
  const alreadyAwarded = transactions.some(
    (transaction) =>
      transaction.studentId === studentId &&
      transaction.sourceType === sourceType &&
      transaction.sourceId === sourceId,
  );

  if (alreadyAwarded) {
    return { awarded: false, profile: getProfile(studentId) };
  }

  const transaction: XpTransaction = {
    id: `xp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    studentId,
    sourceType,
    sourceId,
    xpAmount,
    createdAt: new Date().toISOString(),
  };
  transactions.push(transaction);
  writeJson(TRANSACTIONS_KEY, transactions);

  const previousProfile = getProfile(studentId);
  const nextXp = previousProfile.totalXp + xpAmount;
  const levelInfo = getLevelForXp(nextXp);
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const profile: GamificationProfile = {
    ...previousProfile,
    totalXp: nextXp,
    level: levelInfo.level,
    levelName: levelInfo.levelName,
    lastActivityDate: today,
    currentStreak: previousProfile.lastActivityDate === yesterday ? previousProfile.currentStreak + 1 : 1,
  };

  const badges = profile.badges.includes('first-solve')
    ? profile.badges
    : [...profile.badges, 'first-solve'];
  const updatedProfile: GamificationProfile = { ...profile, badges };

  writeJson(PROFILE_KEY, updatedProfile);

  return { awarded: true, profile: updatedProfile };
}
