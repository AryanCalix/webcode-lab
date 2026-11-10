import { describe, expect, it } from 'vitest';
import type {
  LessonRow,
  ModuleRow,
  ProjectRow,
  ProjectSubmissionRow,
  QuizAttemptRow,
  QuizRow,
  StudentProgressRow,
} from '../../lib/database.types';
import { summariseStudentGrade } from './summary';

function module(id: string, isPublished = true): ModuleRow {
  return {
    id,
    title: `Modul ${id}`,
    description: '',
    order_index: 0,
    is_published: isPublished,
    created_by: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };
}

function lesson(id: string, moduleId: string, isPublished = true): LessonRow {
  return {
    id,
    module_id: moduleId,
    title: `Pelajaran ${id}`,
    content: '',
    video_url: null,
    kind: 'material',
    order_index: 0,
    is_published: isPublished,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };
}

function progress(
  studentId: string,
  moduleId: string,
  percent: number,
  completed: number,
  total: number,
): StudentProgressRow {
  return {
    id: `${studentId}-${moduleId}`,
    student_id: studentId,
    module_id: moduleId,
    completed_lessons: completed,
    total_lessons: total,
    progress_percent: percent,
    completed_at: null,
    updated_at: '2026-01-01T00:00:00.000Z',
  };
}

function quiz(id: string, moduleId: string, isPublished = true): QuizRow {
  return {
    id,
    module_id: moduleId,
    title: `Kuis ${id}`,
    description: '',
    duration_minutes: null,
    deadline_at: null,
    is_published: isPublished,
    created_by: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };
}

function attempt(id: string, quizId: string, studentId: string, score: number): QuizAttemptRow {
  return {
    id,
    quiz_id: quizId,
    student_id: studentId,
    answers: null,
    score,
    status: 'submitted',
    started_at: '2026-01-01T00:00:00.000Z',
    expires_at: null,
    submitted_at: '2026-01-01T00:10:00.000Z',
  };
}

function project(id: string, moduleId: string, isPublished = true): ProjectRow {
  return {
    id,
    module_id: moduleId,
    title: `Proyek ${id}`,
    description: '',
    deadline_at: null,
    is_published: isPublished,
    created_by: null,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  };
}

function submission(
  id: string,
  projectId: string,
  studentId: string,
  score: number | null,
): ProjectSubmissionRow {
  return {
    id,
    project_id: projectId,
    student_id: studentId,
    submission_url: null,
    submission_text: 'hasil',
    score,
    feedback: null,
    submitted_at: '2026-01-01T00:00:00.000Z',
  };
}

describe('summariseStudentGrade', () => {
  it('counts a published module with lessons that the student never started as 0%', () => {
    const summary = summariseStudentGrade({
      studentId: 'student-1',
      modules: [module('m1'), module('m2')],
      lessons: [lesson('l1', 'm1'), lesson('l2', 'm2')],
      progress: [progress('student-1', 'm1', 100, 1, 1)],
      quizzes: [],
      attempts: [],
      projects: [],
      submissions: [],
    });

    expect(summary.modulePercent).toBe(50);
    expect(summary.completedLessons).toBe(1);
    expect(summary.totalLessons).toBe(2);
    expect(summary.breakdown.module).toBe(50);
  });

  it('ignores draft modules, lessons, quizzes, and projects', () => {
    const summary = summariseStudentGrade({
      studentId: 'student-1',
      modules: [module('m1'), module('draft', false)],
      lessons: [lesson('l1', 'm1'), lesson('l2', 'draft'), lesson('hidden', 'm1', false)],
      progress: [progress('student-1', 'm1', 100, 1, 1)],
      quizzes: [quiz('q1', 'm1'), quiz('q2', 'draft')],
      attempts: [attempt('a1', 'q1', 'student-1', 80), attempt('a2', 'q2', 'student-1', 100)],
      projects: [project('p1', 'm1'), project('p2', 'draft')],
      submissions: [
        submission('s1', 'p1', 'student-1', 90),
        submission('s2', 'p2', 'student-1', 100),
      ],
    });

    expect(summary.modulePercent).toBe(100);
    expect(summary.totalLessons).toBe(1);
    expect(summary.breakdown.quiz).toBe(80);
    expect(summary.breakdown.project).toBe(90);
    expect(summary.totalQuizzes).toBe(1);
    expect(summary.totalProjects).toBe(1);
  });

  it('uses the best submitted attempt per quiz and ignores other students', () => {
    const summary = summariseStudentGrade({
      studentId: 'student-1',
      modules: [module('m1')],
      lessons: [lesson('l1', 'm1')],
      progress: [progress('student-1', 'm1', 100, 1, 1)],
      quizzes: [quiz('q1', 'm1')],
      attempts: [
        attempt('a1', 'q1', 'student-1', 60),
        attempt('a2', 'q1', 'student-1', 90),
        attempt('a3', 'q1', 'student-2', 100),
      ],
      projects: [project('p1', 'm1')],
      submissions: [
        submission('s1', 'p1', 'student-1', 80),
        submission('s2', 'p1', 'student-2', 100),
      ],
    });

    expect(summary.breakdown.quiz).toBe(90);
    expect(summary.breakdown.project).toBe(80);
    expect(summary.quizzesTaken).toBe(1);
    expect(summary.gradedProjects).toBe(1);
  });

  it('ignores progress from draft modules when counting completed lessons', () => {
    const summary = summariseStudentGrade({
      studentId: 'student-1',
      modules: [module('m1'), module('draft', false), module('empty')],
      lessons: [lesson('l1', 'm1'), lesson('l2', 'draft')],
      progress: [
        progress('student-1', 'm1', 100, 1, 1),
        progress('student-1', 'draft', 100, 1, 1),
        progress('student-1', 'empty', 100, 1, 1),
      ],
      quizzes: [],
      attempts: [],
      projects: [],
      submissions: [],
    });

    expect(summary.completedLessons).toBe(1);
    expect(summary.totalLessons).toBe(1);
  });
});
