import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { ForumReplyRow, ForumThreadRow } from '../../lib/database.types';
import { createReply, createThread, fetchAllReplies, fetchProfiles, fetchReplies, fetchThread, fetchThreads } from './api';

export const forumKeys = {
  all: ['forum'] as const,
  threads: () => [...forumKeys.all, 'threads'] as const,
  thread: (threadId: string) => [...forumKeys.all, 'thread', threadId] as const,
  replies: (threadId: string) => [...forumKeys.all, 'replies', threadId] as const,
};

export interface ThreadListItem extends ForumThreadRow {
  authorName: string;
  replyCount: number;
}

export function useForumThreads() {
  const threadsQuery = useQuery({ queryKey: forumKeys.threads(), queryFn: fetchThreads });
  const repliesQuery = useQuery({
    queryKey: [...forumKeys.all, 'all-replies'] as const,
    queryFn: fetchAllReplies,
  });

  const authorIds = useMemo(
    () => (threadsQuery.data ?? []).map((thread) => thread.author_id),
    [threadsQuery.data],
  );
  const profilesQuery = useQuery({
    queryKey: [...forumKeys.all, 'authors', authorIds.join(',')] as const,
    queryFn: () => fetchProfiles(authorIds),
    enabled: authorIds.length > 0,
  });

  const threads = useMemo<ThreadListItem[]>(() => {
    const replyCounts = new Map<string, number>();
    for (const reply of repliesQuery.data ?? []) {
      replyCounts.set(reply.thread_id, (replyCounts.get(reply.thread_id) ?? 0) + 1);
    }

    return (threadsQuery.data ?? []).map((thread) => ({
      ...thread,
      authorName: profilesQuery.data?.get(thread.author_id)?.fullName ?? 'Pengguna',
      replyCount: replyCounts.get(thread.id) ?? 0,
    }));
  }, [threadsQuery.data, repliesQuery.data, profilesQuery.data]);

  return {
    threads,
    profiles: profilesQuery.data ?? new Map(),
    isLoading: threadsQuery.isLoading || repliesQuery.isLoading || profilesQuery.isLoading,
    error: threadsQuery.error ?? repliesQuery.error ?? profilesQuery.error,
    refetch: () => {
      void threadsQuery.refetch();
      void repliesQuery.refetch();
      void profilesQuery.refetch();
    },
  };
}

export interface ReplyWithAuthor extends ForumReplyRow {
  authorName: string;
  authorRole: 'student' | 'lecturer';
}

export function useForumThread(threadId: string | undefined) {
  const threadQuery = useQuery({
    queryKey: forumKeys.thread(threadId ?? 'none'),
    queryFn: () => fetchThread(threadId as string),
    enabled: Boolean(threadId),
  });

  const repliesQuery = useQuery({
    queryKey: forumKeys.replies(threadId ?? 'none'),
    queryFn: () => fetchReplies(threadId as string),
    enabled: Boolean(threadId),
  });

  const authorIds = useMemo(() => {
    const ids = (repliesQuery.data ?? []).map((reply) => reply.author_id);
    if (threadQuery.data) ids.push(threadQuery.data.author_id);
    return ids;
  }, [repliesQuery.data, threadQuery.data]);

  const profilesQuery = useQuery({
    queryKey: [...forumKeys.all, 'authors', authorIds.join(',')] as const,
    queryFn: () => fetchProfiles(authorIds),
    enabled: authorIds.length > 0,
  });

  const replies = useMemo<ReplyWithAuthor[]>(
    () =>
      (repliesQuery.data ?? []).map((reply) => {
        const author = profilesQuery.data?.get(reply.author_id);
        return {
          ...reply,
          authorName: author?.fullName ?? 'Pengguna',
          authorRole: author?.role ?? 'student',
        };
      }),
    [repliesQuery.data, profilesQuery.data],
  );

  const threadAuthor = threadQuery.data
    ? profilesQuery.data?.get(threadQuery.data.author_id) ?? null
    : null;

  return {
    thread: threadQuery.data ?? null,
    threadAuthor,
    replies,
    isLoading: threadQuery.isLoading || repliesQuery.isLoading || profilesQuery.isLoading,
    error: threadQuery.error ?? repliesQuery.error ?? profilesQuery.error,
    refetch: () => {
      void threadQuery.refetch();
      void repliesQuery.refetch();
      void profilesQuery.refetch();
    },
  };
}

export function useCreateThread(authorId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { title: string; body: string }) => {
      if (!authorId) throw new Error('Anda harus masuk terlebih dahulu.');
      return createThread({ authorId, ...input });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: forumKeys.threads() });
      void queryClient.invalidateQueries({ queryKey: [...forumKeys.all, 'all-replies'] });
    },
  });
}

export function useCreateReply(threadId: string | undefined, authorId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => {
      if (!threadId || !authorId) throw new Error('Anda harus masuk terlebih dahulu.');
      return createReply({ threadId, authorId, body });
    },
    onSuccess: () => {
      if (threadId) {
        void queryClient.invalidateQueries({ queryKey: forumKeys.replies(threadId) });
        void queryClient.invalidateQueries({ queryKey: forumKeys.thread(threadId) });
      }
      void queryClient.invalidateQueries({ queryKey: forumKeys.threads() });
    },
  });
}
