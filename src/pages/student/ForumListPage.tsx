import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { getForumThreads } from '../../data/demoData';
import { Card } from '../../components/ui';

export default function ForumListPage() {
  const threads = [...getForumThreads()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Forum Diskusi</h1>
        <p className="mt-2 text-sm text-slate-600">
          Diskusikan materi, share temuan praktik, dan bertanya kepada sesama mahasiswa.
        </p>
      </div>

      <div className="grid gap-4">
        {threads.map((thread) => (
          <Card key={thread.id} className="p-5">
            <Link to={`/student/forum/${thread.id}`} className="block">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">{thread.title}</h2>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{thread.body}</p>
              <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                {thread.replies.length} balasan · {thread.authorName} ·{' '}
                {new Date(thread.createdAt).toLocaleDateString('id-ID')}
              </p>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
