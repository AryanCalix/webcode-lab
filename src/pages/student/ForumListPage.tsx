import { Link } from 'react-router-dom';
import { MessageSquare, Plus } from 'lucide-react';
import { Button, Card, EmptyState, ErrorState, LoadingState } from '../../components/ui';
import { useForumThreads } from '../../features/forum/hooks';
import { getErrorMessage } from '../../lib/errors';
import { formatShortDateTime } from '../../lib/format';

export default function ForumListPage() {
  const { threads, isLoading, error, refetch } = useForumThreads();

  if (isLoading) return <LoadingState label="Memuat diskusi…" />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Forum Diskusi</h1>
          <p className="mt-2 text-sm text-slate-600">
            Diskusikan materi, bagikan temuan praktik, dan bertanya kepada sesama mahasiswa.
          </p>
        </div>
        <Link to="/student/forum/new">
          <Button>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Buat Diskusi
          </Button>
        </Link>
      </div>

      {threads.length === 0 ? (
        <EmptyState
          title="Belum ada diskusi"
          description="Mulai diskusi pertama dan ajukan pertanyaan Anda."
          action={
            <Link to="/student/forum/new">
              <Button>Buat Diskusi</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {threads.map((thread) => (
            <Card key={thread.id} className="p-5">
              <Link to={`/student/forum/${thread.id}`} className="block">
                <h2 className="text-lg font-semibold text-slate-900">{thread.title}</h2>
                <p className="mt-1 line-clamp-2 whitespace-pre-line text-sm text-slate-600">
                  {thread.body}
                </p>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  {thread.replyCount} balasan · {thread.authorName} ·{' '}
                  {formatShortDateTime(thread.created_at)}
                </p>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
