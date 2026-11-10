/**
 * Final grade formula for the single Web Programming class.
 *
 * 50% project work + 40% module completion + 10% quiz.
 * Attendance is intentionally informational and never changes the grade.
 */
export const GRADE_WEIGHTS = {
  project: 0.5,
  module: 0.4,
  quiz: 0.1,
} as const;

export interface GradeBreakdown {
  /** Average project score, 0–100. */
  project: number;
  /** Average module completion, 0–100. */
  module: number;
  /** Average best quiz score, 0–100. */
  quiz: number;
  /** Weighted final score, 0–100. */
  final: number;
  letter: GradeLetter;
}

export type GradeLetter = 'A' | 'B' | 'C' | 'D' | 'E';

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function averageScore(values: number[]): number {
  const valid = values.filter((value) => Number.isFinite(value)).map(clampScore);
  if (valid.length === 0) return 0;
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

export function gradeLetter(score: number): GradeLetter {
  const value = clampScore(score);
  if (value >= 85) return 'A';
  if (value >= 75) return 'B';
  if (value >= 65) return 'C';
  if (value >= 55) return 'D';
  return 'E';
}

export function calculateGrade(input: {
  projectScores: number[];
  modulePercent: number;
  quizScores: number[];
}): GradeBreakdown {
  const project = averageScore(input.projectScores);
  const moduleScore = clampScore(input.modulePercent);
  const quiz = averageScore(input.quizScores);
  const final = Math.round(
    project * GRADE_WEIGHTS.project +
      moduleScore * GRADE_WEIGHTS.module +
      quiz * GRADE_WEIGHTS.quiz,
  );

  return {
    project,
    module: moduleScore,
    quiz,
    final,
    letter: gradeLetter(final),
  };
}

export function gradeTone(score: number): 'green' | 'amber' | 'blue' | 'slate' {
  const value = clampScore(score);
  if (value >= 75) return 'green';
  if (value >= 60) return 'amber';
  if (value >= 40) return 'blue';
  return 'slate';
}
