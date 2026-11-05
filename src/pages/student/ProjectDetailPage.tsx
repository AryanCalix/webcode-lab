import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { getProjectById, getProjectSubmissions, saveProjectSubmission } from '../../data/demoData';
import { Button, Card } from '../../components/ui';

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = projectId ? getProjectById(projectId) : undefined;
  const submissions = getProjectSubmissions();

  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [justSubmitted, setJustSubmitted] = useState(false);

  if (!project) {
    return <Navigate to="/student/projects" replace />;
  }

  const existingSubmission = submissions.find((item) => item.projectId === project.id && item.studentId === 'usr_student');

  const handleSubmit = () => {
    const submission = {
      id: `prjsub-${Date.now()}`,
      projectId: project.id,
      studentId: 'usr_student',
      studentName: 'Budi Santoso',
      submissionUrl: submissionUrl.trim() || null,
      submissionText: submissionText.trim() || null,
      submittedAt: new Date().toISOString(),
    };
    saveProjectSubmission(submission);
    setJustSubmitted(true);
  };

  const hasContent = Boolean(submissionUrl.trim() || submissionText.trim());

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <Link
        to="/student/projects"
        className="text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        ← Kembali ke daftar proyek
      </Link>

      <Card className="p-6">
        <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{project.description}</p>
        <p className="mt-2 text-xs text-slate-500">
          Tenggat:{' '}
          {project.deadlineAt ? new Date(project.deadlineAt).toLocaleString('id-ID') : 'tidak ditentukan'}
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">Hasil / tautan proyek</h2>
        {existingSubmission ? (
          <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
            Anda sudah mengumpulkan proyek ini. Terakhir dikumpulkan:{' '}
            {new Date(existingSubmission.submittedAt).toLocaleString('id-ID')}
            {existingSubmission.submissionUrl ? (
              <>
                {' '}
                — <a className="font-semibold underline" href={existingSubmission.submissionUrl}>tautan</a>
              </>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label htmlFor="prj-url" className="mb-1 block text-sm font-semibold text-slate-700">
              Tautan proyek (opsional)
            </label>
            <input
              id="prj-url"
              type="url"
              value={submissionUrl}
              onChange={(event) => setSubmissionUrl(event.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
          <div>
            <label htmlFor="prj-text" className="mb-1 block text-sm font-semibold text-slate-700">
              Deskripsi hasil / kode (opsional)
            </label>
            <textarea
              id="prj-text"
              value={submissionText}
              onChange={(event) => setSubmissionText(event.target.value)}
              rows={4}
              placeholder="Tulis ringkasan hasil atau tempel kode..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>
          <Button onClick={handleSubmit} disabled={!hasContent && !justSubmitted}>
            <Send className="h-4 w-4" aria-hidden="true" />
            Kirim Proyek
          </Button>
          {justSubmitted && hasContent ? (
            <p className="text-xs text-emerald-700">Pengumpulan proyek berhasil disimpan (demo).</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
