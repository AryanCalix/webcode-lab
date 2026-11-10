import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { LessonRow, ModuleRow } from '../../lib/database.types';
import { moduleKeys } from '../modules/hooks';
import { quizKeys } from '../quizzes/hooks';
import {
  deleteLesson,
  deleteModule,
  fetchAllLessons,
  fetchAllModules,
  fetchExerciseByLesson,
  fetchLesson,
  fetchLecturerResults,
  fetchModuleLessons,
  fetchStudentsOverview,
  saveLesson,
  saveModule,
  type SaveLessonInput,
  type SaveModuleInput,
} from './api';

export const lecturerKeys = {
  all: ['lecturer'] as const,
  students: () => [...lecturerKeys.all, 'students'] as const,
  modules: () => [...lecturerKeys.all, 'modules'] as const,
  lessons: () => [...lecturerKeys.all, 'lessons'] as const,
  moduleLessons: (moduleId: string) => [...lecturerKeys.all, 'module-lessons', moduleId] as const,
  lesson: (lessonId: string) => [...lecturerKeys.all, 'lesson', lessonId] as const,
  exercise: (lessonId: string) => [...lecturerKeys.all, 'exercise', lessonId] as const,
  results: () => [...lecturerKeys.all, 'results'] as const,
};

export function useStudentsOverview() {
  return useQuery({ queryKey: lecturerKeys.students(), queryFn: fetchStudentsOverview });
}

export function useAllModules() {
  return useQuery({ queryKey: lecturerKeys.modules(), queryFn: fetchAllModules });
}

export function useAllLessons() {
  return useQuery({ queryKey: lecturerKeys.lessons(), queryFn: fetchAllLessons });
}

export interface ModuleWithLessonCount extends ModuleRow {
  lessonCount: number;
}

export function useModulesWithLessonCounts() {
  const modulesQuery = useAllModules();
  const lessonsQuery = useAllLessons();

  const modules = useMemo<ModuleWithLessonCount[]>(() => {
    const counts = new Map<string, number>();
    for (const lesson of lessonsQuery.data ?? []) {
      counts.set(lesson.module_id, (counts.get(lesson.module_id) ?? 0) + 1);
    }

    return (modulesQuery.data ?? []).map((module) => ({
      ...module,
      lessonCount: counts.get(module.id) ?? 0,
    }));
  }, [modulesQuery.data, lessonsQuery.data]);

  return {
    modules,
    isLoading: modulesQuery.isLoading || lessonsQuery.isLoading,
    error: modulesQuery.error ?? lessonsQuery.error,
    refetch: () => {
      void modulesQuery.refetch();
      void lessonsQuery.refetch();
    },
  };
}

export function useModuleLessons(moduleId: string | undefined) {
  return useQuery({
    queryKey: lecturerKeys.moduleLessons(moduleId ?? 'none'),
    queryFn: () => fetchModuleLessons(moduleId as string),
    enabled: Boolean(moduleId),
  });
}

export interface LessonEditorData {
  lesson: LessonRow | null;
  exercise: Awaited<ReturnType<typeof fetchExerciseByLesson>>;
}

export function useLessonEditor(lessonId: string | undefined) {
  const lessonQuery = useQuery({
    queryKey: lecturerKeys.lesson(lessonId ?? 'none'),
    queryFn: () => fetchLesson(lessonId as string),
    enabled: Boolean(lessonId),
  });

  const exerciseQuery = useQuery({
    queryKey: lecturerKeys.exercise(lessonId ?? 'none'),
    queryFn: () => fetchExerciseByLesson(lessonId as string),
    enabled: Boolean(lessonId),
  });

  return {
    lesson: lessonQuery.data ?? null,
    exercise: exerciseQuery.data ?? null,
    isLoading: lessonQuery.isLoading || exerciseQuery.isLoading,
    error: lessonQuery.error ?? exerciseQuery.error,
  };
}

function invalidateContent(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: lecturerKeys.modules() });
  void queryClient.invalidateQueries({ queryKey: lecturerKeys.lessons() });
  void queryClient.invalidateQueries({ queryKey: moduleKeys.all });
  void queryClient.invalidateQueries({ queryKey: quizKeys.all });
}

export function useSaveModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveModuleInput) => saveModule(input),
    onSuccess: () => invalidateContent(queryClient),
  });
}

export function useDeleteModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => deleteModule(moduleId),
    onSuccess: () => invalidateContent(queryClient),
  });
}

export function useSaveLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveLessonInput) => saveLesson(input),
    onSuccess: (lessonId, input) => {
      invalidateContent(queryClient);
      void queryClient.invalidateQueries({ queryKey: lecturerKeys.moduleLessons(input.moduleId) });
      void queryClient.invalidateQueries({ queryKey: lecturerKeys.lesson(lessonId) });
      void queryClient.invalidateQueries({ queryKey: lecturerKeys.exercise(lessonId) });
    },
  });
}

export function useDeleteLesson(moduleId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => deleteLesson(lessonId),
    onSuccess: () => {
      invalidateContent(queryClient);
      if (moduleId) {
        void queryClient.invalidateQueries({ queryKey: lecturerKeys.moduleLessons(moduleId) });
      }
    },
  });
}

export function useLecturerResults() {
  return useQuery({ queryKey: lecturerKeys.results(), queryFn: fetchLecturerResults });
}
