import type {
  ExerciseRow,
  GamificationProfileRow,
  Json,
  LessonRow,
  ModuleRow,
  ProfileRow,
  ProjectRow,
  ProjectSubmissionRow,
  QuizAttemptRow,
  QuizRow,
  StudentProgressRow,
} from '../../lib/database.types';
import { throwIfError } from '../../lib/errors';
import { invokeFunction } from '../../lib/edge';
import { isStreakCurrent } from '../../lib/format';
import { getSupabase } from '../../lib/supabase';

export interface CreateStudentInput {
  fullName: string;
  email: string;
  password: string;
}

export interface CreatedStudent {
  id: string;
  email: string;
  fullName: string;
}

export function createStudent(input: CreateStudentInput): Promise<CreatedStudent> {
  return invokeFunction<CreatedStudent>('create-student', { ...input });
}

export interface StudentOverview {
  id: string;
  fullName: string;
  totalXp: number;
  level: number;
  levelName: string;
  currentStreak: number;
  averageProgress: number;
  completedLessons: number;
  totalLessons: number;
}

export async function fetchStudentsOverview(): Promise<StudentOverview[]> {
  const supabase = getSupabase();
  const [
    profilesResult,
    gamificationResult,
    progressResult,
    modulesResult,
    lessonsResult,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('role', 'student').order('full_name'),
    supabase.from('gamification_profiles').select('*'),
    supabase.from('student_progress').select('*'),
    supabase.from('modules').select('*').eq('is_published', true),
    supabase.from('lessons').select('*').eq('is_published', true),
  ]);

  throwIfError(profilesResult.error);
  throwIfError(gamificationResult.error);
  throwIfError(progressResult.error);
  throwIfError(modulesResult.error);
  throwIfError(lessonsResult.error);

  const gamificationByStudent = new Map(
    (gamificationResult.data ?? []).map((row) => [row.student_id, row] as const),
  );

  const publishedModuleIds = new Set((modulesResult.data ?? []).map((module) => module.id));
  const lessonsPerModule = new Map<string, number>();
  for (const lesson of lessonsResult.data ?? []) {
    if (!publishedModuleIds.has(lesson.module_id)) continue;
    lessonsPerModule.set(lesson.module_id, (lessonsPerModule.get(lesson.module_id) ?? 0) + 1);
  }

  // Every published module with lessons counts, even when the student has never
  // opened it. Missing progress therefore contributes 0% instead of being ignored.
  const gradableModuleIds = [...lessonsPerModule.keys()];
  const totalLessons = [...lessonsPerModule.values()].reduce((sum, count) => sum + count, 0);

  const progressByStudent = new Map<string, Map<string, StudentProgressRow>>();
  for (const row of progressResult.data ?? []) {
    if (!lessonsPerModule.has(row.module_id)) continue;
    const byModule = progressByStudent.get(row.student_id) ?? new Map();
    byModule.set(row.module_id, row);
    progressByStudent.set(row.student_id, byModule);
  }

  return (profilesResult.data ?? []).map((profile) => {
    const gamification = gamificationByStudent.get(profile.id);
    const progress = progressByStudent.get(profile.id) ?? new Map<string, StudentProgressRow>();
    const averageProgress =
      gradableModuleIds.length > 0
        ? Math.round(
            gradableModuleIds.reduce(
              (sum, moduleId) => sum + (progress.get(moduleId)?.progress_percent ?? 0),
              0,
            ) / gradableModuleIds.length,
          )
        : 0;

    return {
      id: profile.id,
      fullName: profile.full_name,
      totalXp: gamification?.total_xp ?? 0,
      level: gamification?.level ?? 1,
      levelName: gamification?.level_name ?? 'Pemula',
      currentStreak:
        gamification && isStreakCurrent(gamification.last_activity_date)
          ? gamification.current_streak
          : 0,
      averageProgress,
      completedLessons: gradableModuleIds.reduce(
        (sum, moduleId) => sum + (progress.get(moduleId)?.completed_lessons ?? 0),
        0,
      ),
      totalLessons,
    };
  });
}

export async function fetchAllModules(): Promise<ModuleRow[]> {
  const { data, error } = await getSupabase()
    .from('modules')
    .select('*')
    .order('order_index', { ascending: true });

  throwIfError(error);
  return data ?? [];
}

export async function fetchAllLessons(): Promise<LessonRow[]> {
  const { data, error } = await getSupabase()
    .from('lessons')
    .select('*')
    .order('order_index', { ascending: true })
    .order('id', { ascending: true });

  throwIfError(error);
  return data ?? [];
}

export async function fetchModuleLessons(moduleId: string): Promise<LessonRow[]> {
  const { data, error } = await getSupabase()
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
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

export async function fetchExerciseByLesson(lessonId: string): Promise<ExerciseRow | null> {
  const { data, error } = await getSupabase()
    .from('exercises')
    .select('*')
    .eq('lesson_id', lessonId)
    .maybeSingle();

  throwIfError(error);
  return data;
}

export interface SaveModuleInput {
  id?: string;
  title: string;
  description: string;
  orderIndex: number;
  isPublished: boolean;
}

export async function saveModule(input: SaveModuleInput): Promise<string> {
  const { data, error } = await getSupabase().rpc('save_module', {
    p_module: {
      id: input.id ?? null,
      title: input.title,
      description: input.description,
      order_index: input.orderIndex,
      is_published: input.isPublished,
    } as unknown as Json,
  });

  throwIfError(error);
  if (typeof data !== 'string') throw new Error('Gagal menyimpan modul.');
  return data;
}

export async function deleteModule(moduleId: string): Promise<void> {
  const { error } = await getSupabase().rpc('delete_module', { p_module_id: moduleId });
  throwIfError(error);
}

export interface SaveExerciseInput {
  title: string;
  instructions: string;
  starterHtml: string;
  starterCss: string;
  starterJs: string;
  hint: string;
  validatorConfig: Json;
  isPublished: boolean;
}

export interface SaveLessonInput {
  id?: string;
  moduleId: string;
  title: string;
  content: string;
  videoUrl: string | null;
  kind: 'material' | 'exercise';
  orderIndex: number;
  isPublished: boolean;
  exercise?: SaveExerciseInput | null;
}

export async function saveLesson(input: SaveLessonInput): Promise<string> {
  const payload: Record<string, unknown> = {
    id: input.id ?? null,
    module_id: input.moduleId,
    title: input.title,
    content: input.content,
    video_url: input.videoUrl,
    kind: input.kind,
    order_index: input.orderIndex,
    is_published: input.isPublished,
  };

  if (input.kind === 'exercise' && input.exercise) {
    payload.exercise = {
      title: input.exercise.title,
      instructions: input.exercise.instructions,
      starter_html: input.exercise.starterHtml,
      starter_css: input.exercise.starterCss,
      starter_js: input.exercise.starterJs,
      hint: input.exercise.hint,
      validator_config: input.exercise.validatorConfig,
      is_published: input.exercise.isPublished,
    };
  }

  const { data, error } = await getSupabase().rpc('save_lesson', {
    p_lesson: payload as unknown as Json,
  });

  throwIfError(error);
  if (typeof data !== 'string') throw new Error('Gagal menyimpan pelajaran.');
  return data;
}

export async function deleteLesson(lessonId: string): Promise<void> {
  const { error } = await getSupabase().rpc('delete_lesson', { p_lesson_id: lessonId });
  throwIfError(error);
}

export async function reorderLessons(moduleId: string, lessonIds: string[]): Promise<void> {
  const { error } = await getSupabase().rpc('reorder_lessons', {
    p_module_id: moduleId,
    p_lesson_ids: lessonIds,
  });
  throwIfError(error);
}

export async function setLessonPublished(
  lessonId: string,
  isPublished: boolean,
): Promise<void> {
  const { error } = await getSupabase()
    .from('lessons')
    .update({ is_published: isPublished })
    .eq('id', lessonId);

  throwIfError(error);
}

export interface LecturerResults {
  students: ProfileRow[];
  modules: ModuleRow[];
  lessons: LessonRow[];
  quizzes: QuizRow[];
  projects: ProjectRow[];
  quizAttempts: QuizAttemptRow[];
  projectSubmissions: ProjectSubmissionRow[];
  progress: StudentProgressRow[];
}

export async function fetchLecturerResults(): Promise<LecturerResults> {
  const supabase = getSupabase();
  const [profiles, modules, lessons, quizzes, projects, quizAttempts, projectSubmissions, progress] =
    await Promise.all([
      supabase.from('profiles').select('*').order('full_name'),
      supabase.from('modules').select('*').order('order_index', { ascending: true }),
      supabase.from('lessons').select('*').order('order_index', { ascending: true }),
      supabase.from('quizzes').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('quiz_attempts').select('*').order('started_at', { ascending: false }),
      supabase.from('project_submissions').select('*').order('submitted_at', { ascending: false }),
      supabase.from('student_progress').select('*'),
    ]);

  throwIfError(profiles.error);
  throwIfError(modules.error);
  throwIfError(lessons.error);
  throwIfError(quizzes.error);
  throwIfError(projects.error);
  throwIfError(quizAttempts.error);
  throwIfError(projectSubmissions.error);
  throwIfError(progress.error);

  return {
    students: profiles.data ?? [],
    modules: modules.data ?? [],
    lessons: lessons.data ?? [],
    quizzes: quizzes.data ?? [],
    projects: projects.data ?? [],
    quizAttempts: quizAttempts.data ?? [],
    projectSubmissions: projectSubmissions.data ?? [],
    progress: progress.data ?? [],
  };
}

export type { GamificationProfileRow };
