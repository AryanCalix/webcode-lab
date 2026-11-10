import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardKeys } from '../dashboard/hooks';
import { moduleKeys } from '../modules/hooks';
import {
  requestAiExplanation,
  requestAiHint,
  submitExercise,
  type ExerciseSubmissionResult,
} from './api';

export function useSubmitExercise(
  studentId: string | undefined,
  exerciseId: string | undefined,
  moduleId: string | undefined,
  lessonId: string | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { html: string; css: string; js: string }): Promise<ExerciseSubmissionResult> => {
      if (!exerciseId) throw new Error('Latihan tidak ditemukan.');
      return submitExercise({ exerciseId, ...input });
    },
    onSuccess: () => {
      if (studentId && exerciseId) {
        void queryClient.invalidateQueries({ queryKey: moduleKeys.submission(studentId, exerciseId) });
        void queryClient.invalidateQueries({ queryKey: dashboardKeys.gamification(studentId) });
        void queryClient.invalidateQueries({ queryKey: dashboardKeys.badges(studentId) });
        void queryClient.invalidateQueries({ queryKey: dashboardKeys.xp(studentId) });
        void queryClient.invalidateQueries({ queryKey: moduleKeys.progress(studentId) });
      }
      if (studentId && moduleId) {
        void queryClient.invalidateQueries({ queryKey: moduleKeys.completions(studentId, moduleId) });
      }
      if (studentId && lessonId) {
        void queryClient.invalidateQueries({ queryKey: moduleKeys.completion(studentId, lessonId) });
      }
      if (moduleId) {
        void queryClient.invalidateQueries({ queryKey: moduleKeys.detail(moduleId) });
      }
    },
  });
}

export function useRequestAiHint(exerciseId: string | undefined) {
  return useMutation({
    mutationFn: (input: { html: string; css: string; js: string; errorMessage?: string }) => {
      if (!exerciseId) throw new Error('Latihan tidak ditemukan.');
      return requestAiHint({ exerciseId, ...input });
    },
  });
}

export function useRequestAiExplanation(exerciseId: string | undefined) {
  return useMutation({
    mutationFn: (input: { html: string; css: string; js: string; errorMessage: string }) => {
      if (!exerciseId) throw new Error('Latihan tidak ditemukan.');
      return requestAiExplanation({ exerciseId, ...input });
    },
  });
}
