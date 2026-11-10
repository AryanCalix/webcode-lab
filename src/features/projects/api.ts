import type { Json, ProjectRow, ProjectSubmissionRow } from '../../lib/database.types';
import { throwIfError } from '../../lib/errors';
import { getSupabase } from '../../lib/supabase';

export async function fetchProjects(): Promise<ProjectRow[]> {
  const { data, error } = await getSupabase()
    .from('projects')
    .select('*')
    .order('created_at', { ascending: true });

  throwIfError(error);
  return data ?? [];
}

export async function fetchProject(projectId: string): Promise<ProjectRow | null> {
  const { data, error } = await getSupabase()
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .maybeSingle();

  throwIfError(error);
  return data;
}

export async function fetchProjectSubmission(
  studentId: string,
  projectId: string,
): Promise<ProjectSubmissionRow | null> {
  const { data, error } = await getSupabase()
    .from('project_submissions')
    .select('*')
    .eq('student_id', studentId)
    .eq('project_id', projectId)
    .maybeSingle();

  throwIfError(error);
  return data;
}

export async function fetchStudentProjectSubmissions(
  studentId: string,
): Promise<ProjectSubmissionRow[]> {
  const { data, error } = await getSupabase()
    .from('project_submissions')
    .select('*')
    .eq('student_id', studentId);

  throwIfError(error);
  return data ?? [];
}

export async function fetchAllProjectSubmissions(): Promise<ProjectSubmissionRow[]> {
  const { data, error } = await getSupabase()
    .from('project_submissions')
    .select('*')
    .order('submitted_at', { ascending: false });

  throwIfError(error);
  return data ?? [];
}

export async function submitProject(input: {
  projectId: string;
  url: string | null;
  text: string | null;
}): Promise<void> {
  const { error } = await getSupabase().rpc('submit_project', {
    p_project_id: input.projectId,
    p_url: input.url,
    p_text: input.text,
  });

  throwIfError(error);
}

export interface SaveProjectInput {
  id?: string;
  moduleId: string;
  title: string;
  description: string;
  deadlineAt: string | null;
  isPublished: boolean;
}

export async function saveProject(input: SaveProjectInput): Promise<string> {
  const { data, error } = await getSupabase().rpc('save_project', {
    p_project: {
      id: input.id ?? null,
      module_id: input.moduleId,
      title: input.title,
      description: input.description,
      deadline_at: input.deadlineAt,
      is_published: input.isPublished,
    } as unknown as Json,
  });

  throwIfError(error);
  if (typeof data !== 'string') throw new Error('Gagal menyimpan proyek.');
  return data;
}

export async function deleteProject(projectId: string): Promise<void> {
  const { error } = await getSupabase().rpc('delete_project', { p_project_id: projectId });
  throwIfError(error);
}

export async function setProjectPublished(
  projectId: string,
  isPublished: boolean,
): Promise<void> {
  const { error } = await getSupabase()
    .from('projects')
    .update({ is_published: isPublished })
    .eq('id', projectId);

  throwIfError(error);
}

export async function gradeProjectSubmission(input: {
  submissionId: string;
  score: number;
  feedback: string;
}): Promise<void> {
  const { error } = await getSupabase().rpc('grade_project_submission', {
    p_submission_id: input.submissionId,
    p_score: input.score,
    p_feedback: input.feedback,
  });

  throwIfError(error);
}
