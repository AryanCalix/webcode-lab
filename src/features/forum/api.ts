import type {
  ForumReplyRow,
  ForumThreadRow,
  ProfileRow,
} from '../../lib/database.types';
import { throwIfError } from '../../lib/errors';
import { getSupabase } from '../../lib/supabase';

export interface AuthorInfo {
  id: string;
  fullName: string;
  role: ProfileRow['role'];
}

export async function fetchProfiles(ids: string[]): Promise<Map<string, AuthorInfo>> {
  if (ids.length === 0) return new Map();

  const unique = Array.from(new Set(ids));
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, full_name, role')
    .in('id', unique);

  throwIfError(error);

  return new Map(
    (data ?? []).map((profile) => [
      profile.id,
      { id: profile.id, fullName: profile.full_name, role: profile.role },
    ]),
  );
}

export async function fetchThreads(): Promise<ForumThreadRow[]> {
  const { data, error } = await getSupabase()
    .from('forum_threads')
    .select('*')
    .order('created_at', { ascending: false });

  throwIfError(error);
  return data ?? [];
}

export async function fetchThread(threadId: string): Promise<ForumThreadRow | null> {
  const { data, error } = await getSupabase()
    .from('forum_threads')
    .select('*')
    .eq('id', threadId)
    .maybeSingle();

  throwIfError(error);
  return data;
}

export async function fetchAllReplies(): Promise<ForumReplyRow[]> {
  const { data, error } = await getSupabase()
    .from('forum_replies')
    .select('*')
    .order('created_at', { ascending: true });

  throwIfError(error);
  return data ?? [];
}

export async function fetchReplies(threadId: string): Promise<ForumReplyRow[]> {
  const { data, error } = await getSupabase()
    .from('forum_replies')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  throwIfError(error);
  return data ?? [];
}

export async function createThread(input: {
  authorId: string;
  title: string;
  body: string;
}): Promise<ForumThreadRow> {
  const title = input.title.trim();
  const body = input.body.trim();

  if (title.length < 5) throw new Error('Judul minimal 5 karakter.');
  if (title.length > 160) throw new Error('Judul maksimal 160 karakter.');
  if (body.length < 10) throw new Error('Isi diskusi minimal 10 karakter.');
  if (body.length > 10_000) throw new Error('Isi diskusi maksimal 10.000 karakter.');

  const { data, error } = await getSupabase()
    .from('forum_threads')
    .insert({ author_id: input.authorId, title, body })
    .select('*')
    .single();

  throwIfError(error);
  if (!data) throw new Error('Gagal membuat diskusi.');
  return data;
}

export async function createReply(input: {
  threadId: string;
  authorId: string;
  body: string;
}): Promise<ForumReplyRow> {
  const body = input.body.trim();

  if (body.length < 2) throw new Error('Balasan minimal 2 karakter.');
  if (body.length > 10_000) throw new Error('Balasan maksimal 10.000 karakter.');

  const { data, error } = await getSupabase()
    .from('forum_replies')
    .insert({ thread_id: input.threadId, author_id: input.authorId, body })
    .select('*')
    .single();

  throwIfError(error);
  if (!data) throw new Error('Gagal mengirim balasan.');
  return data;
}
