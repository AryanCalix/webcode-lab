import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Send } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Alert, Badge, Button, Card, ErrorState, LoadingState } from '../../components/ui';
import {
  useProject,
  useProjectSubmission,
  useSubmitProject,
} from '../../features/projects/hooks';
import { getErrorMessage } from '../../lib/errors';
import { formatDateTime, safeExternalUrl } from '../../lib/format';

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const projectQuery = useProject(projectId);
  const submissionQuery = useProjectSubmission(user?.id, projectId);
  const submitProject = useSubmitProject(user?.id, projectId);

  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!submissionQuery.data) return;
    setSubmissionUrl(submissionQuery.data.submission_url ?? '');
    setSubmissionText(submissionQuery.data.submission_text ?? '');
  }, [submissionQuery.data]);

  if (projectQuery.isLoading || submissionQuery.isLoading) {
    return <LoadingState label="Memuat proyek…" />;
  }

  if (projectQuery.error) {
    return <ErrorState message={getErrorMessage(projectQuery.error)} />;
  }

  const project = projectQuery.data;
  if (!project) return <Navigate to="/student/projects" replace />;

  const submission = submissionQuery.data;
  const safeUrl = safeExternalUrl(submission?.submission_url);
  const isPastDeadline = project.deadline_at ? new Date(project.deadline_at) < new Date() : false;

  const handleSubmit = () => {
    setFormError(null);
    const url = submissionUrl.trim();
    const text = submissionText.trim();

    if (!url && !text) {
      setFormError('Isi tautan proyek atau deskripsi hasil terlebih dahulu.');
      return;
    }

    if (url && !/^https?:\/\//i.test(url)) {
      setFormError('Tautan proyek harus diawali http:// atau https://.');
      return;
    }

    submitProject.mutate({ url: url || null, text: text || null });
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Link
        to="/student/projects"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke daftar proyek
      </Link>

      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
          {submission ? <Badge tone="green">Sudah dikumpulkan</Badge> : <Badge tone="slate">Belum dikumpulkan</Badge>}
        </div>
        <p className="mt-2 text-sm text-slate-600">{project.description}</p>
        <p className="mt-2 text-xs text-slate-500">
          Tenggat: {project.deadline_at ? formatDateTime(project.deadline_at) : 'tidak ditentukan'}
        </p>
        {isPastDeadline ? (
          <div className="mt-4">
            <Alert tone="error">Tenggat proyek ini sudah lewat. Pengumpulan baru tidak dapat dilakukan.</Alert>
          </div>
        ) : null}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">Pengumpulan</h2>

        {submission ? (
          <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
            Terakhir dikumpulkan {formatDateTime(submission.submitted_at)}.
            {safeUrl ? (
              <>
                {' '}
                <a
                  href={safeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold underline"
                >
                  Buka tautan
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label htmlFor="project-url" className="mb-1 block text-sm font-semibold text-slate-700">
              Tautan proyek (opsional)
            </label>
            <input
              id="project-url"
              type="url"
              value={submissionUrl}
              onChange={(event) => setSubmissionUrl(event.target.value)}
              placeholder="https://..."
              disabled={isPastDeadline}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50"
            />
          </div>
          <div>
            <label htmlFor="project-text" className="mb-1 block text-sm font-semibold text-slate-700">
              Deskripsi hasil / kode (opsional)
            </label>
            <textarea
              id="project-text"
              value={submissionText}
              onChange={(event) => setSubmissionText(event.target.value)}
              rows={5}
              disabled={isPastDeadline}
              placeholder="Tulis ringkasan hasil atau tempel kode..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50"
            />
          </div>

          {formError ? <Alert tone="error">{formError}</Alert> : null}
          {submitProject.error ? <Alert tone="error">{getErrorMessage(submitProject.error)}</Alert> : null}
          {submitProject.isSuccess ? (
            <Alert tone="success">Pengumpulan proyek berhasil disimpan.</Alert>
          ) : null}

          <div>
            <Button
              onClick={handleSubmit}
              disabled={isPastDeadline || submitProject.isPending}
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {submitProject.isPending ? 'Mengirim…' : submission ? 'Perbarui Pengumpulan' : 'Kirim Proyek'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
