import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { ProjectRow, ProjectSubmissionRow } from '../../lib/database.types';
import { dashboardKeys } from '../dashboard/hooks';
import {
  fetchAllProjectSubmissions,
  fetchProject,
  fetchProjectSubmission,
  fetchProjects,
  fetchStudentProjectSubmissions,
  submitProject,
} from './api';

export const projectKeys = {
  all: ['projects'] as const,
  list: () => [...projectKeys.all, 'list'] as const,
  detail: (projectId: string) => [...projectKeys.all, 'detail', projectId] as const,
  submission: (studentId: string, projectId: string) =>
    [...projectKeys.all, 'submission', studentId, projectId] as const,
  submissions: (studentId: string) => [...projectKeys.all, 'submissions', studentId] as const,
  allSubmissions: () => [...projectKeys.all, 'all-submissions'] as const,
};

export function useProjects() {
  return useQuery({ queryKey: projectKeys.list(), queryFn: fetchProjects });
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(projectId ?? 'none'),
    queryFn: () => fetchProject(projectId as string),
    enabled: Boolean(projectId),
  });
}

export function useProjectSubmission(studentId: string | undefined, projectId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.submission(studentId ?? 'anonymous', projectId ?? 'none'),
    queryFn: () => fetchProjectSubmission(studentId as string, projectId as string),
    enabled: Boolean(studentId && projectId),
  });
}

export function useStudentProjectSubmissions(studentId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.submissions(studentId ?? 'anonymous'),
    queryFn: () => fetchStudentProjectSubmissions(studentId as string),
    enabled: Boolean(studentId),
  });
}

export function useAllProjectSubmissions() {
  return useQuery({
    queryKey: projectKeys.allSubmissions(),
    queryFn: fetchAllProjectSubmissions,
  });
}

export function useSubmitProject(studentId: string | undefined, projectId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { url: string | null; text: string | null }) => {
      if (!projectId) throw new Error('Proyek tidak ditemukan.');
      return submitProject({ projectId, ...input });
    },
    onSuccess: () => {
      if (studentId && projectId) {
        void queryClient.invalidateQueries({
          queryKey: projectKeys.submission(studentId, projectId),
        });
        void queryClient.invalidateQueries({ queryKey: projectKeys.submissions(studentId) });
        void queryClient.invalidateQueries({ queryKey: projectKeys.allSubmissions() });
        void queryClient.invalidateQueries({ queryKey: dashboardKeys.gamification(studentId) });
        void queryClient.invalidateQueries({ queryKey: dashboardKeys.badges(studentId) });
        void queryClient.invalidateQueries({ queryKey: dashboardKeys.xp(studentId) });
      }
    },
  });
}

export interface ProjectWithSubmission {
  project: ProjectRow;
  submission: ProjectSubmissionRow | null;
}

export function useProjectsWithSubmissions(studentId: string | undefined) {
  const projectsQuery = useProjects();
  const submissionsQuery = useStudentProjectSubmissions(studentId);

  const projects = useMemo<ProjectWithSubmission[]>(() => {
    const byProject = new Map(
      (submissionsQuery.data ?? []).map((submission) => [submission.project_id, submission] as const),
    );

    return (projectsQuery.data ?? []).map((project) => ({
      project,
      submission: byProject.get(project.id) ?? null,
    }));
  }, [projectsQuery.data, submissionsQuery.data]);

  return {
    projects,
    isLoading: projectsQuery.isLoading || submissionsQuery.isLoading,
    error: projectsQuery.error ?? submissionsQuery.error,
    refetch: () => {
      void projectsQuery.refetch();
      void submissionsQuery.refetch();
    },
  };
}
