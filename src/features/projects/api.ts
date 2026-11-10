import type { ProjectRow, ProjectSubmissionRow } from '../../lib/database.types';
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
