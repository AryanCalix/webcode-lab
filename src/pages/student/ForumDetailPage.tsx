import { useState, type FormEvent } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Alert, Badge, Button, Card, ErrorState, LoadingState } from '../../components/ui';
import { useCreateReply, useForumThread } from '../../features/forum/hooks';
import { getErrorMessage } from '../../lib/errors';
import { formatDateTime } from '../../lib/format';

export default function ForumDetailPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const { user } = useAuth();
  const { thread, threadAuthor, replies, isLoading, error, refetch } = useForumThread(threadId);
  const createReply = useCreateReply(threadId, user?.id);
  const [replyBody, setReplyBody] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoading) return <LoadingState label="Memuat diskusi…" />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;
  if (!thread) return <Navigate to="/student/forum" replace />;

  const handleSubmitReply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (replyBody.trim().length < 2) {
      setFormError('Balasan minimal 2 karakter.');
      return;
    }

    createReply.mutate(replyBody, {
      onSuccess: () => setReplyBody(''),
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/student/forum"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke forum
      </Link>

      <Card className="p-6">
        <h1 className="text-2xl font-bold text-slate-900">{thread.title}</h1>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{thread.body}</p>
        <p className="mt-3 text-xs text-slate-500">
          {threadAuthor?.fullName ?? 'Pengguna'}
          {threadAuthor?.role === 'lecturer' ? ' (Dosen)' : ''} ·{' '}
          {formatDateTime(thread.created_at)}
        </p>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Balasan ({replies.length})
          </h2>
          {replies.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Belum ada balasan.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {replies.map((reply) => (
                <li key={reply.id} className="rounded-lg bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">{reply.authorName}</p>
                    {reply.authorRole === 'lecturer' ? <Badge tone="blue">Dosen</Badge> : null}
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{reply.body}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDateTime(reply.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Tulis Balasan</h2>
        <form onSubmit={handleSubmitReply} className="mt-4 flex flex-col gap-3">
          {formError ? <Alert tone="error">{formError}</Alert> : null}
          {createReply.error ? <Alert tone="error">{getErrorMessage(createReply.error)}</Alert> : null}
          <textarea
            value={replyBody}
            onChange={(event) => setReplyBody(event.target.value)}
            rows={4}
            required
            maxLength={10_000}
            placeholder="Tulis balasan Anda..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          <div>
            <Button type="submit" disabled={!replyBody.trim() || createReply.isPending}>
              <Send className="h-4 w-4" aria-hidden="true" />
              {createReply.isPending ? 'Mengirim…' : 'Kirim Balasan'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
