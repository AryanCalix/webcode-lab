import type {
  ExerciseRow,
  ExerciseSubmissionRow,
  LessonRow,
  ModuleRow,
  ProjectRow,
  QuizRow,
  StudentProgressRow,
} from '../../lib/database.types';
import { throwIfError } from '../../lib/errors';
import { getSupabase } from '../../lib/supabase';

export async function fetchModules(): Promise<ModuleRow[]> {
  const { data, error } = await getSupabase()
    .from('modules')
    .select('*')
    .order('order_index', { ascending: true });

  throwIfError(error);
  return data ?? [];
}

export async function fetchModule(moduleId: string): Promise<ModuleRow | null> {
  const { data, error } = await getSupabase()
    .from('modules')
    .select('*')
    .eq('id', moduleId)
    .maybeSingle();

  throwIfError(error);
  return data;
}

export async function fetchLessons(moduleId: string): Promise<LessonRow[]> {
  const { data, error } = await getSupabase()
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
    .order('order_index', { ascending: true })
    .order('id', { ascending: true });

  throwIfError(error);
  return data ?? [];
}

export interface LessonIndexRow {
  id: string;
  module_id: string;
  order_index: number;
}

export async function fetchLessonIndex(): Promise<LessonIndexRow[]> {
  const { data, error } = await getSupabase()
    .from('lessons')
    .select('id, module_id, order_index')
    .order('module_id', { ascending: true })
    .order('order_index', { ascending: true })
    .order('id', { ascending: true });

  throwIfError(error);
  return data ?? [];
}

export async function fetchLesson(lessonId: string): Promise<LessonRow | null> {
  const { data, error } = await getSupabase()
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .maybeSingle();

  throwIfError(error);
  return data;
}

export async function fetchExercise(exerciseId: string): Promise<ExerciseRow | null> {
  const { data, error } = await getSupabase()
    .from('exercises')
    .select('*')
    .eq('id', exerciseId)
    .maybeSingle();

  throwIfError(error);
  return data;
}

export async function fetchExerciseByLesson(lessonId: string): Promise<ExerciseRow | null> {
  const { data, error } = await getSupabase()
    .from('exercises')
    .select('*')
    .eq('lesson_id', lessonId)
    .maybeSingle();

  throwIfError(error);
  return data;
}

export async function fetchExerciseSubmission(
  studentId: string,
  exerciseId: string,
): Promise<ExerciseSubmissionRow | null> {
  const { data, error } = await getSupabase()
    .from('exercise_submissions')
    .select('*')
    .eq('student_id', studentId)
    .eq('exercise_id', exerciseId)
    .maybeSingle();

  throwIfError(error);
  return data;
}

export async function fetchStudentProgress(studentId: string): Promise<StudentProgressRow[]> {
  const { data, error } = await getSupabase()
    .from('student_progress')
    .select('*')
    .eq('student_id', studentId);

  throwIfError(error);
  return data ?? [];
}

export async function fetchLessonCompletions(
  studentId: string,
  lessonIds: string[],
): Promise<Set<string>> {
  if (lessonIds.length === 0) return new Set();

  const { data, error } = await getSupabase()
    .from('lesson_completions')
    .select('lesson_id')
    .eq('student_id', studentId)
    .in('lesson_id', lessonIds);

  throwIfError(error);
  return new Set((data ?? []).map((row) => row.lesson_id));
}

export async function fetchExercisesForLessons(lessonIds: string[]): Promise<ExerciseRow[]> {
  if (lessonIds.length === 0) return [];

  const { data, error } = await getSupabase()
    .from('exercises')
    .select('*')
    .in('lesson_id', lessonIds);

  throwIfError(error);
  return data ?? [];
}

export async function fetchLessonCompletion(
  studentId: string,
  lessonId: string,
): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from('lesson_completions')
    .select('lesson_id')
    .eq('student_id', studentId)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  throwIfError(error);
  return Boolean(data);
}

export async function fetchQuizzesForModule(moduleId: string): Promise<QuizRow[]> {
  const { data, error } = await getSupabase()
    .from('quizzes')
    .select('*')
    .eq('module_id', moduleId)
    .order('created_at', { ascending: true });

  throwIfError(error);
  return data ?? [];
}

export async function fetchProjectsForModule(moduleId: string): Promise<ProjectRow[]> {
  const { data, error } = await getSupabase()
    .from('projects')
    .select('*')
    .eq('module_id', moduleId)
    .order('created_at', { ascending: true });

  throwIfError(error);
  return data ?? [];
}

export async function completeLesson(lessonId: string): Promise<void> {
  const { error } = await getSupabase().rpc('complete_lesson', { p_lesson_id: lessonId });
  throwIfError(error);
}
