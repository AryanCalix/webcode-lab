import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Alert, Button, Card, Field, inputClassName } from '../../components/ui';
import { useCreateThread } from '../../features/forum/hooks';
import { getErrorMessage } from '../../lib/errors';

export default function ForumCreatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createThread = useCreateThread(user?.id);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (title.trim().length < 5) {
      setFormError('Judul minimal 5 karakter.');
      return;
    }
    if (body.trim().length < 10) {
      setFormError('Isi diskusi minimal 10 karakter.');
      return;
    }

    createThread.mutate(
      { title, body },
      {
        onSuccess: (thread) => navigate(`/student/forum/${thread.id}`, { replace: true }),
      },
    );
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
        <h1 className="text-2xl font-bold text-slate-900">Buat Diskusi Baru</h1>
        <p className="mt-2 text-sm text-slate-600">
          Tulis pertanyaan yang jelas agar teman dan dosen dapat membantu dengan cepat.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          {formError ? <Alert tone="error">{formError}</Alert> : null}
          {createThread.error ? <Alert tone="error">{getErrorMessage(createThread.error)}</Alert> : null}

          <Field label="Judul" htmlFor="thread-title">
            <input
              id="thread-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={160}
              required
              placeholder="Contoh: Mengapa warna CSS saya tidak berubah?"
              className={inputClassName}
            />
          </Field>

          <Field label="Isi diskusi" htmlFor="thread-body">
            <textarea
              id="thread-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={7}
              required
              maxLength={10_000}
              placeholder="Jelaskan apa yang Anda coba, hasil yang diharapkan, dan pesan error yang muncul."
              className={inputClassName}
            />
          </Field>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={createThread.isPending}>
              <Send className="h-4 w-4" aria-hidden="true" />
              {createThread.isPending ? 'Mengirim…' : 'Kirim Diskusi'}
            </Button>
            <Link to="/student/forum">
              <Button variant="outline">Batal</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
