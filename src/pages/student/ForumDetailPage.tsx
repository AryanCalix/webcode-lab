import { useState, type FormEvent } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { getForumThreadById, saveForumReply } from '../../data/demoData';
import { Button, Card } from '../../components/ui';

const createReplyId = () => `reply-${Date.now()}`;
const createReplyTimestamp = () => new Date().toISOString();

export default function ForumDetailPage() {
  const { threadId } = useParams<{ threadId: string }>();
  const thread = threadId ? getForumThreadById(threadId) : undefined;

  const [replyBody, setReplyBody] = useState('');

  if (!thread) {
    return <Navigate to="/student/forum" replace />;
  }

  const handleSubmitReply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!replyBody.trim()) {
      return;
    }
    const reply = {
      id: createReplyId(),
      threadId: thread.id,
      authorId: 'usr_student',
      authorName: 'Budi Santoso',
      body: replyBody.trim(),
      createdAt: createReplyTimestamp(),
    };
    saveForumReply(reply);
    setReplyBody('');
    // refresh daftar thread lokal setelah reply baru
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/student/forum" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke forum
      </Link>

      <Card className="p-6">
        <h1 className="text-2xl font-bold text-slate-900">{thread.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{thread.body}</p>
        <p className="mt-2 text-xs text-slate-500">
          {thread.authorName} · {new Date(thread.createdAt).toLocaleString('id-ID')}
        </p>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Balasan ({thread.replies.length})
          </h2>
          {thread.replies.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Belum ada balasan.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {thread.replies.map((reply) => (
                <li key={reply.id} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-900">{reply.authorName}</p>
                  <p className="mt-1 text-sm text-slate-700">{reply.body}</p>
                  <p className="mt-1 text-xs text-slate-500">{new Date(reply.createdAt).toLocaleString('id-ID')}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Tulis Balasan</h2>
        <form onSubmit={handleSubmitReply} className="mt-4 flex flex-col gap-3">
          <textarea
            value={replyBody}
            onChange={(event) => setReplyBody(event.target.value)}
            rows={4}
            required
            placeholder="Tulis balasan Anda..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          <div>
            <Button type="submit" disabled={!replyBody.trim()}>
              <Send className="h-4 w-4" aria-hidden="true" />
              Kirim Balasan
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
