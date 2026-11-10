import type {
  LessonRow,
  ModuleRow,
  ProjectRow,
  ProjectSubmissionRow,
  QuizAttemptRow,
  QuizRow,
  StudentProgressRow,
} from '../../lib/database.types';
import { averageScore, calculateGrade, type GradeBreakdown } from '../../lib/grading';

export interface StudentGradeSummary {
  modulePercent: number;
  completedLessons: number;
  totalLessons: number;
  projectScores: number[];
  quizScores: number[];
  gradedProjects: number;
  totalProjects: number;
  quizzesTaken: number;
  totalQuizzes: number;
  breakdown: GradeBreakdown;
}

/**
 * Builds the class grade for one student from the raw classroom tables.
 * Attendance is deliberately not part of this calculation.
 */
export function summariseStudentGrade(input: {
  studentId: string;
  modules: ModuleRow[];
  lessons: LessonRow[];
  progress: StudentProgressRow[];
  quizzes: QuizRow[];
  attempts: QuizAttemptRow[];
  projects: ProjectRow[];
  submissions: ProjectSubmissionRow[];
}): StudentGradeSummary {
  const publishedModules = input.modules.filter((module) => module.is_published);
  const publishedModuleIds = new Set(publishedModules.map((module) => module.id));

  const lessonsPerModule = new Map<string, number>();
  for (const lesson of input.lessons) {
    if (!lesson.is_published || !publishedModuleIds.has(lesson.module_id)) continue;
    lessonsPerModule.set(lesson.module_id, (lessonsPerModule.get(lesson.module_id) ?? 0) + 1);
  }

  const publishedQuizzes = input.quizzes.filter(
    (quiz) => quiz.is_published && publishedModuleIds.has(quiz.module_id),
  );
  const publishedProjects = input.projects.filter(
    (project) => project.is_published && publishedModuleIds.has(project.module_id),
  );

  const progress = input.progress.filter((row) => row.student_id === input.studentId);
  const progressByModule = new Map(progress.map((row) => [row.module_id, row] as const));

  // A published module with lessons counts toward the average even when the
  // student has not started it yet (missing progress means 0%).
  const modulePercents = publishedModules
    .filter((module) => (lessonsPerModule.get(module.id) ?? 0) > 0)
    .map((module) => progressByModule.get(module.id)?.progress_percent ?? 0);
  const modulePercent = averageScore(modulePercents);

  const bestByQuiz = new Map<string, number>();
  for (const attempt of input.attempts) {
    if (attempt.student_id !== input.studentId) continue;
    if (attempt.status !== 'submitted' || attempt.score === null) continue;
    if (!publishedQuizzes.some((quiz) => quiz.id === attempt.quiz_id)) continue;
    const previous = bestByQuiz.get(attempt.quiz_id);
    if (previous === undefined || attempt.score > previous) {
      bestByQuiz.set(attempt.quiz_id, attempt.score);
    }
  }
  const quizScores = [...bestByQuiz.values()];

  const projectScores = input.submissions
    .filter(
      (submission) =>
        submission.student_id === input.studentId &&
        submission.score !== null &&
        publishedProjects.some((project) => project.id === submission.project_id),
    )
    .map((submission) => submission.score as number);

  const breakdown = calculateGrade({
    projectScores,
    modulePercent,
    quizScores,
  });

  return {
    modulePercent,
    completedLessons: [...lessonsPerModule.entries()].reduce(
      (sum, [moduleId, total]) =>
        sum + Math.min(progressByModule.get(moduleId)?.completed_lessons ?? 0, total),
      0,
    ),
    totalLessons: [...lessonsPerModule.values()].reduce((sum, count) => sum + count, 0),
    projectScores,
    quizScores,
    gradedProjects: projectScores.length,
    totalProjects: publishedProjects.length,
    quizzesTaken: quizScores.length,
    totalQuizzes: publishedQuizzes.length,
    breakdown,
  };
}
