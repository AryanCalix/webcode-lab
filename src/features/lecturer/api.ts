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
import { getSupabase } from '../../lib/supabase';

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
  const [profilesResult, gamificationResult, progressResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('role', 'student').order('full_name'),
    supabase.from('gamification_profiles').select('*'),
    supabase.from('student_progress').select('*'),
  ]);

  throwIfError(profilesResult.error);
  throwIfError(gamificationResult.error);
  throwIfError(progressResult.error);

  const gamificationByStudent = new Map(
    (gamificationResult.data ?? []).map((row) => [row.student_id, row] as const),
  );

  const progressByStudent = new Map<string, StudentProgressRow[]>();
  for (const row of progressResult.data ?? []) {
    const list = progressByStudent.get(row.student_id) ?? [];
    list.push(row);
    progressByStudent.set(row.student_id, list);
  }

  return (profilesResult.data ?? []).map((profile) => {
    const gamification = gamificationByStudent.get(profile.id);
    const progress = progressByStudent.get(profile.id) ?? [];
    const activeModules = progress.filter((row) => row.total_lessons > 0);
    const averageProgress =
      activeModules.length > 0
        ? Math.round(
            activeModules.reduce((sum, row) => sum + row.progress_percent, 0) / activeModules.length,
          )
        : 0;

    return {
      id: profile.id,
      fullName: profile.full_name,
      totalXp: gamification?.total_xp ?? 0,
      level: gamification?.level ?? 1,
      levelName: gamification?.level_name ?? 'Pemula',
      currentStreak: gamification?.current_streak ?? 0,
      averageProgress,
      completedLessons: progress.reduce((sum, row) => sum + row.completed_lessons, 0),
      totalLessons: progress.reduce((sum, row) => sum + row.total_lessons, 0),
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
    .order('order_index', { ascending: true });

  throwIfError(error);
  return data ?? [];
}

export async function fetchModuleLessons(moduleId: string): Promise<LessonRow[]> {
  const { data, error } = await getSupabase()
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
    .order('order_index', { ascending: true });

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

export interface LecturerResults {
  students: ProfileRow[];
  quizzes: QuizRow[];
  projects: ProjectRow[];
  quizAttempts: QuizAttemptRow[];
  projectSubmissions: ProjectSubmissionRow[];
}

export async function fetchLecturerResults(): Promise<LecturerResults> {
  const supabase = getSupabase();
  const [profiles, quizzes, projects, quizAttempts, projectSubmissions] = await Promise.all([
    supabase.from('profiles').select('*').order('full_name'),
    supabase.from('quizzes').select('*'),
    supabase.from('projects').select('*'),
    supabase.from('quiz_attempts').select('*').order('started_at', { ascending: false }),
    supabase.from('project_submissions').select('*').order('submitted_at', { ascending: false }),
  ]);

  throwIfError(profiles.error);
  throwIfError(quizzes.error);
  throwIfError(projects.error);
  throwIfError(quizAttempts.error);
  throwIfError(projectSubmissions.error);

  return {
    students: profiles.data ?? [],
    quizzes: quizzes.data ?? [],
    projects: projects.data ?? [],
    quizAttempts: quizAttempts.data ?? [],
    projectSubmissions: projectSubmissions.data ?? [],
  };
}

export type { GamificationProfileRow };
