import type { Json, QuizAttemptRow, QuizQuestionRow, QuizRow } from '../../lib/database.types';
import { throwIfError } from '../../lib/errors';
import { getSupabase } from '../../lib/supabase';

export interface QuizQuestionPayload {
  id: string;
  question_text: string;
  options: string[];
  points: number;
  order_index: number;
}

export interface QuizStartPayload {
  attempt_id: string;
  quiz: {
    id: string;
    title: string;
    description: string;
    duration_minutes: number | null;
    deadline_at: string | null;
  };
  questions: QuizQuestionPayload[];
  started_at: string;
  expires_at: string | null;
}

export interface QuizReviewItem {
  question_id: string;
  chosen_index: number;
  correct_index: number;
  is_correct: boolean;
  points: number;
}

export interface QuizSubmitPayload {
  attempt_id: string;
  score: number;
  earned_points: number;
  total_points: number;
  review: QuizReviewItem[];
}

function asObject(value: Json | null): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export async function fetchQuizzes(): Promise<QuizRow[]> {
  const { data, error } = await getSupabase()
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: true });

  throwIfError(error);
  return data ?? [];
}

export async function fetchQuiz(quizId: string): Promise<QuizRow | null> {
  const { data, error } = await getSupabase()
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .maybeSingle();

  throwIfError(error);
  return data;
}

export async function fetchQuizQuestions(quizId: string): Promise<QuizQuestionRow[]> {
  const { data, error } = await getSupabase()
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order_index', { ascending: true });

  throwIfError(error);
  return data ?? [];
}

export async function fetchAllQuizQuestions(): Promise<QuizQuestionRow[]> {
  const { data, error } = await getSupabase()
    .from('quiz_questions')
    .select('*')
    .order('order_index', { ascending: true });

  throwIfError(error);
  return data ?? [];
}

export async function fetchStudentQuizAttempts(studentId: string): Promise<QuizAttemptRow[]> {
  const { data, error } = await getSupabase()
    .from('quiz_attempts')
    .select('*')
    .eq('student_id', studentId)
    .order('started_at', { ascending: false });

  throwIfError(error);
  return data ?? [];
}

export async function fetchAllQuizAttempts(): Promise<QuizAttemptRow[]> {
  const { data, error } = await getSupabase()
    .from('quiz_attempts')
    .select('*')
    .order('started_at', { ascending: false });

  throwIfError(error);
  return data ?? [];
}

export async function startQuizAttempt(quizId: string): Promise<QuizStartPayload> {
  const { data, error } = await getSupabase().rpc('start_quiz_attempt', { p_quiz_id: quizId });
  throwIfError(error);

  const payload = asObject(data);
  if (!payload || typeof payload.attempt_id !== 'string' || !Array.isArray(payload.questions)) {
    throw new Error('Server mengembalikan data kuis yang tidak valid.');
  }

  return payload as unknown as QuizStartPayload;
}

export async function submitQuizAttempt(
  attemptId: string,
  answers: number[],
): Promise<QuizSubmitPayload> {
  const { data, error } = await getSupabase().rpc('submit_quiz_attempt', {
    p_attempt_id: attemptId,
    p_answers: answers as unknown as Json,
  });
  throwIfError(error);

  const payload = asObject(data);
  if (!payload || typeof payload.score !== 'number' || !Array.isArray(payload.review)) {
    throw new Error('Server mengembalikan hasil kuis yang tidak valid.');
  }

  return payload as unknown as QuizSubmitPayload;
}

export interface SaveQuizQuestionInput {
  id?: string;
  question_text: string;
  options: string[];
  correct_index: number;
  points: number;
}

export interface SaveQuizInput {
  id?: string;
  moduleId: string;
  title: string;
  description: string;
  durationMinutes: number | null;
  deadlineAt: string | null;
  isPublished: boolean;
  questions: SaveQuizQuestionInput[];
}

export async function saveQuiz(input: SaveQuizInput): Promise<string> {
  const { data, error } = await getSupabase().rpc('save_quiz', {
    p_quiz: {
      id: input.id ?? null,
      module_id: input.moduleId,
      title: input.title,
      description: input.description,
      duration_minutes: input.durationMinutes,
      deadline_at: input.deadlineAt,
      is_published: input.isPublished,
      questions: input.questions.map((question) => ({
        question_text: question.question_text,
        options: question.options,
        correct_index: question.correct_index,
        points: question.points,
      })),
    } as unknown as Json,
  });

  throwIfError(error);
  if (typeof data !== 'string') throw new Error('Gagal menyimpan kuis.');
  return data;
}

export async function deleteQuiz(quizId: string): Promise<void> {
  const { error } = await getSupabase().rpc('delete_quiz', { p_quiz_id: quizId });
  throwIfError(error);
}

export async function setQuizPublished(quizId: string, isPublished: boolean): Promise<void> {
  const { error } = await getSupabase()
    .from('quizzes')
    .update({ is_published: isPublished })
    .eq('id', quizId);

  throwIfError(error);
}
