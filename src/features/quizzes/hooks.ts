import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { QuizAttemptRow, QuizRow } from '../../lib/database.types';
import { dashboardKeys } from '../dashboard/hooks';
import { lecturerKeys } from '../lecturer/keys';
import { moduleKeys } from '../modules/hooks';
import {
  deleteQuiz,
  fetchAllQuizAttempts,
  fetchAllQuizQuestions,
  fetchQuiz,
  fetchQuizQuestions,
  fetchQuizzes,
  fetchStudentQuizAttempts,
  saveQuiz,
  startQuizAttempt,
  submitQuizAttempt,
  setQuizPublished,
  type SaveQuizInput,
} from './api';

export const quizKeys = {
  all: ['quizzes'] as const,
  list: () => [...quizKeys.all, 'list'] as const,
  detail: (quizId: string) => [...quizKeys.all, 'detail', quizId] as const,
  questions: (quizId: string) => [...quizKeys.all, 'questions', quizId] as const,
  allQuestions: () => [...quizKeys.all, 'all-questions'] as const,
  attempts: (studentId: string) => [...quizKeys.all, 'attempts', studentId] as const,
  allAttempts: () => [...quizKeys.all, 'all-attempts'] as const,
  start: (quizId: string) => [...quizKeys.all, 'start', quizId] as const,
};

export function useQuizzes() {
  return useQuery({ queryKey: quizKeys.list(), queryFn: fetchQuizzes });
}

export function useQuiz(quizId: string | undefined) {
  return useQuery({
    queryKey: quizKeys.detail(quizId ?? 'none'),
    queryFn: () => fetchQuiz(quizId as string),
    enabled: Boolean(quizId),
  });
}

export function useQuizQuestions(quizId: string | undefined) {
  return useQuery({
    queryKey: quizKeys.questions(quizId ?? 'none'),
    queryFn: () => fetchQuizQuestions(quizId as string),
    enabled: Boolean(quizId),
  });
}

export function useAllQuizQuestions() {
  return useQuery({ queryKey: quizKeys.allQuestions(), queryFn: fetchAllQuizQuestions });
}

export function useStudentQuizAttempts(studentId: string | undefined) {
  return useQuery({
    queryKey: quizKeys.attempts(studentId ?? 'anonymous'),
    queryFn: () => fetchStudentQuizAttempts(studentId as string),
    enabled: Boolean(studentId),
  });
}

export function useAllQuizAttempts() {
  return useQuery({ queryKey: quizKeys.allAttempts(), queryFn: fetchAllQuizAttempts });
}

export function useStartQuizAttempt(quizId: string | undefined) {
  return useQuery({
    queryKey: quizKeys.start(quizId ?? 'none'),
    queryFn: () => startQuizAttempt(quizId as string),
    enabled: Boolean(quizId),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 0,
    retry: false,
    refetchOnMount: 'always',
  });
}

export function useSubmitQuizAttempt(studentId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attemptId, answers }: { attemptId: string; answers: number[] }) =>
      submitQuizAttempt(attemptId, answers),
    onSuccess: () => {
      if (studentId) {
        void queryClient.invalidateQueries({ queryKey: quizKeys.attempts(studentId) });
        void queryClient.invalidateQueries({ queryKey: dashboardKeys.gamification(studentId) });
        void queryClient.invalidateQueries({ queryKey: dashboardKeys.badges(studentId) });
        void queryClient.invalidateQueries({ queryKey: dashboardKeys.xp(studentId) });
        void queryClient.invalidateQueries({ queryKey: moduleKeys.progress(studentId) });
      }
    },
  });
}

export function useSaveQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveQuizInput) => saveQuiz(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: quizKeys.all });
      void queryClient.invalidateQueries({ queryKey: lecturerKeys.results() });
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: string) => deleteQuiz(quizId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: quizKeys.all });
      void queryClient.invalidateQueries({ queryKey: lecturerKeys.results() });
    },
  });
}

export function useSetQuizPublished() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { quizId: string; isPublished: boolean }) =>
      setQuizPublished(input.quizId, input.isPublished),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: quizKeys.all });
      void queryClient.invalidateQueries({ queryKey: moduleKeys.all });
      void queryClient.invalidateQueries({ queryKey: lecturerKeys.results() });
    },
  });
}

export interface QuizWithBestAttempt {
  quiz: QuizRow;
  bestScore: number | null;
  attemptCount: number;
}

export function useQuizzesWithAttempts(studentId: string | undefined) {
  const quizzesQuery = useQuizzes();
  const attemptsQuery = useStudentQuizAttempts(studentId);

  const quizzes = useMemo<QuizWithBestAttempt[]>(() => {
    const byQuiz = new Map<string, QuizAttemptRow[]>();

    for (const attempt of attemptsQuery.data ?? []) {
      if (attempt.status !== 'submitted' || attempt.score === null) continue;
      const list = byQuiz.get(attempt.quiz_id) ?? [];
      list.push(attempt);
      byQuiz.set(attempt.quiz_id, list);
    }

    return (quizzesQuery.data ?? []).map((quiz) => {
      const attempts = byQuiz.get(quiz.id) ?? [];
      return {
        quiz,
        bestScore: attempts.length > 0 ? Math.max(...attempts.map((attempt) => attempt.score ?? 0)) : null,
        attemptCount: attempts.length,
      };
    });
  }, [quizzesQuery.data, attemptsQuery.data]);

  return {
    quizzes,
    isLoading: quizzesQuery.isLoading || attemptsQuery.isLoading,
    error: quizzesQuery.error ?? attemptsQuery.error,
    refetch: () => {
      void quizzesQuery.refetch();
      void attemptsQuery.refetch();
    },
  };
}
