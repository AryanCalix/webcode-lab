import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type {
  ExerciseRow,
  ExerciseSubmissionRow,
  LessonRow,
  ModuleRow,
  ProjectRow,
  QuizRow,
  StudentProgressRow,
} from '../../lib/database.types';
import {
  completeLesson,
  fetchExercise,
  fetchExerciseSubmission,
  fetchExercisesForLessons,
  fetchLesson,
  fetchLessonCompletion,
  fetchLessonCompletions,
  fetchLessonIndex,
  fetchLessons,
  fetchModule,
  fetchModules,
  fetchProjectsForModule,
  fetchQuizzesForModule,
  fetchStudentProgress,
} from './api';
import { dashboardKeys } from '../dashboard/hooks';

export const moduleKeys = {
  all: ['modules'] as const,
  list: () => [...moduleKeys.all, 'list'] as const,
  lessonIndex: () => [...moduleKeys.all, 'lesson-index'] as const,
  detail: (moduleId: string) => [...moduleKeys.all, 'detail', moduleId] as const,
  lessons: (moduleId: string) => [...moduleKeys.all, 'lessons', moduleId] as const,
  lesson: (lessonId: string) => [...moduleKeys.all, 'lesson', lessonId] as const,
  exercise: (exerciseId: string) => [...moduleKeys.all, 'exercise', exerciseId] as const,
  submission: (studentId: string, exerciseId: string) =>
    [...moduleKeys.all, 'submission', studentId, exerciseId] as const,
  exercises: (lessonIds: string[]) =>
    [...moduleKeys.all, 'exercises', lessonIds.join(',')] as const,
  progress: (studentId: string) => [...moduleKeys.all, 'progress', studentId] as const,
  completions: (studentId: string, moduleId: string) =>
    [...moduleKeys.all, 'completions', studentId, moduleId] as const,
  completion: (studentId: string, lessonId: string) =>
    [...moduleKeys.all, 'completion', studentId, lessonId] as const,
  quizzes: (moduleId: string) => [...moduleKeys.all, 'quizzes', moduleId] as const,
  projects: (moduleId: string) => [...moduleKeys.all, 'projects', moduleId] as const,
};

export interface ModuleWithProgress extends ModuleRow {
  progress: StudentProgressRow | null;
  lessonCount: number;
}

export function useModules() {
  return useQuery({
    queryKey: moduleKeys.list(),
    queryFn: fetchModules,
  });
}

export function useLessonIndex() {
  return useQuery({
    queryKey: moduleKeys.lessonIndex(),
    queryFn: fetchLessonIndex,
  });
}

export function useStudentProgress(studentId: string | undefined) {
  return useQuery({
    queryKey: moduleKeys.progress(studentId ?? 'anonymous'),
    queryFn: () => fetchStudentProgress(studentId as string),
    enabled: Boolean(studentId),
  });
}

export function useModulesWithProgress(studentId: string | undefined) {
  const modulesQuery = useModules();
  const progressQuery = useStudentProgress(studentId);
  const lessonIndexQuery = useLessonIndex();

  const modules = useMemo<ModuleWithProgress[]>(() => {
    const progressByModule = new Map(
      (progressQuery.data ?? []).map((row) => [row.module_id, row] as const),
    );
    const lessonCounts = new Map<string, number>();
    for (const lesson of lessonIndexQuery.data ?? []) {
      lessonCounts.set(lesson.module_id, (lessonCounts.get(lesson.module_id) ?? 0) + 1);
    }

    return (modulesQuery.data ?? []).map((module) => ({
      ...module,
      progress: progressByModule.get(module.id) ?? null,
      lessonCount: lessonCounts.get(module.id) ?? 0,
    }));
  }, [modulesQuery.data, progressQuery.data, lessonIndexQuery.data]);

  return {
    modules,
    isLoading: modulesQuery.isLoading || progressQuery.isLoading || lessonIndexQuery.isLoading,
    error: modulesQuery.error ?? progressQuery.error ?? lessonIndexQuery.error,
    refetch: () => {
      void modulesQuery.refetch();
      void progressQuery.refetch();
      void lessonIndexQuery.refetch();
    },
  };
}

export interface ModuleDetail {
  module: ModuleRow;
  lessons: LessonRow[];
  exercises: ExerciseRow[];
  quizzes: QuizRow[];
  projects: ProjectRow[];
  progress: StudentProgressRow | null;
  completedLessonIds: Set<string>;
  exerciseByLessonId: Map<string, ExerciseRow>;
}

export function useModuleDetail(moduleId: string | undefined, studentId: string | undefined) {
  const moduleQuery = useQuery({
    queryKey: moduleKeys.detail(moduleId ?? 'none'),
    queryFn: () => fetchModule(moduleId as string),
    enabled: Boolean(moduleId),
  });

  const lessonsQuery = useQuery({
    queryKey: moduleKeys.lessons(moduleId ?? 'none'),
    queryFn: () => fetchLessons(moduleId as string),
    enabled: Boolean(moduleId),
  });

  const progressQuery = useQuery({
    queryKey: moduleKeys.progress(studentId ?? 'anonymous'),
    queryFn: () => fetchStudentProgress(studentId as string),
    enabled: Boolean(studentId),
  });

  const lessonIds = (lessonsQuery.data ?? []).map((lesson) => lesson.id);

  const completionsQuery = useQuery({
    queryKey: moduleKeys.completions(studentId ?? 'anonymous', moduleId ?? 'none'),
    queryFn: () => fetchLessonCompletions(studentId as string, lessonIds),
    enabled: Boolean(studentId && lessonIds.length > 0),
  });

  const exercisesQuery = useQuery({
    queryKey: moduleKeys.exercises(lessonIds),
    queryFn: () => fetchExercisesForLessons(lessonIds),
    enabled: lessonIds.length > 0,
  });

  const quizzesQuery = useQuery({
    queryKey: moduleKeys.quizzes(moduleId ?? 'none'),
    queryFn: () => fetchQuizzesForModule(moduleId as string),
    enabled: Boolean(moduleId),
  });

  const projectsQuery = useQuery({
    queryKey: moduleKeys.projects(moduleId ?? 'none'),
    queryFn: () => fetchProjectsForModule(moduleId as string),
    enabled: Boolean(moduleId),
  });

  const progress = useMemo(
    () => (progressQuery.data ?? []).find((row) => row.module_id === moduleId) ?? null,
    [progressQuery.data, moduleId],
  );

  const detail = useMemo<ModuleDetail | null>(() => {
    if (!moduleQuery.data) return null;
    const exercises = exercisesQuery.data ?? [];
    return {
      module: moduleQuery.data,
      lessons: lessonsQuery.data ?? [],
      exercises,
      quizzes: quizzesQuery.data ?? [],
      projects: projectsQuery.data ?? [],
      progress,
      completedLessonIds: completionsQuery.data ?? new Set(),
      exerciseByLessonId: new Map(exercises.map((exercise) => [exercise.lesson_id, exercise])),
    };
  }, [
    moduleQuery.data,
    lessonsQuery.data,
    exercisesQuery.data,
    quizzesQuery.data,
    projectsQuery.data,
    progress,
    completionsQuery.data,
  ]);

  const error =
    moduleQuery.error ??
    lessonsQuery.error ??
    progressQuery.error ??
    completionsQuery.error ??
    exercisesQuery.error ??
    quizzesQuery.error ??
    projectsQuery.error;

  return {
    detail,
    isLoading:
      moduleQuery.isLoading ||
      lessonsQuery.isLoading ||
      progressQuery.isLoading ||
      completionsQuery.isLoading ||
      exercisesQuery.isLoading ||
      quizzesQuery.isLoading ||
      projectsQuery.isLoading,
    error,
    refetch: () => {
      void moduleQuery.refetch();
      void lessonsQuery.refetch();
      void progressQuery.refetch();
      void completionsQuery.refetch();
      void exercisesQuery.refetch();
      void quizzesQuery.refetch();
      void projectsQuery.refetch();
    },
  };
}

export function useLessonDetail(
  lessonId: string | undefined,
  studentId: string | undefined,
) {
  const lessonQuery = useQuery({
    queryKey: moduleKeys.lesson(lessonId ?? 'none'),
    queryFn: () => fetchLesson(lessonId as string),
    enabled: Boolean(lessonId),
  });

  const moduleQuery = useQuery({
    queryKey: moduleKeys.detail(lessonQuery.data?.module_id ?? 'none'),
    queryFn: () => fetchModule(lessonQuery.data?.module_id as string),
    enabled: Boolean(lessonQuery.data?.module_id),
  });

  const completionQuery = useQuery({
    queryKey: moduleKeys.completion(studentId ?? 'anonymous', lessonId ?? 'none'),
    queryFn: () => fetchLessonCompletion(studentId as string, lessonId as string),
    enabled: Boolean(studentId && lessonId),
  });

  return {
    lesson: lessonQuery.data ?? null,
    module: moduleQuery.data ?? null,
    isCompleted: completionQuery.data ?? false,
    isLoading: lessonQuery.isLoading || moduleQuery.isLoading || completionQuery.isLoading,
    error: lessonQuery.error ?? moduleQuery.error ?? completionQuery.error,
  };
}

export function useCompleteLesson(
  studentId: string | undefined,
  moduleId: string | undefined,
  lessonId: string | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!lessonId) throw new Error('Lesson tidak ditemukan.');
      await completeLesson(lessonId);
    },
    onSuccess: () => {
      if (studentId && moduleId) {
        void queryClient.invalidateQueries({
          queryKey: moduleKeys.completions(studentId, moduleId),
        });
      }
      if (studentId && lessonId) {
        void queryClient.invalidateQueries({
          queryKey: moduleKeys.completion(studentId, lessonId),
        });
      }
      if (studentId) {
        void queryClient.invalidateQueries({ queryKey: moduleKeys.progress(studentId) });
        void queryClient.invalidateQueries({ queryKey: dashboardKeys.gamification(studentId) });
        void queryClient.invalidateQueries({ queryKey: dashboardKeys.badges(studentId) });
        void queryClient.invalidateQueries({ queryKey: dashboardKeys.xp(studentId) });
      }
    },
  });
}

export interface ExerciseDetail {
  exercise: ExerciseRow;
  submission: ExerciseSubmissionRow | null;
}

export function useExerciseDetail(
  exerciseId: string | undefined,
  studentId: string | undefined,
) {
  const exerciseQuery = useQuery({
    queryKey: moduleKeys.exercise(exerciseId ?? 'none'),
    queryFn: () => fetchExercise(exerciseId as string),
    enabled: Boolean(exerciseId),
  });

  const submissionQuery = useQuery({
    queryKey: moduleKeys.submission(studentId ?? 'anonymous', exerciseId ?? 'none'),
    queryFn: () => fetchExerciseSubmission(studentId as string, exerciseId as string),
    enabled: Boolean(studentId && exerciseId),
  });

  const detail = useMemo<ExerciseDetail | null>(() => {
    if (!exerciseQuery.data) return null;
    return {
      exercise: exerciseQuery.data,
      submission: submissionQuery.data ?? null,
    };
  }, [exerciseQuery.data, submissionQuery.data]);

  return {
    detail,
    isLoading: exerciseQuery.isLoading || submissionQuery.isLoading,
    error: exerciseQuery.error ?? submissionQuery.error,
    refetchSubmission: () => void submissionQuery.refetch(),
  };
}
