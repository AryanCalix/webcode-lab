import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ExternalLink, Lock, Send, Trophy } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import {
  Alert,
  Badge,
  Button,
  Card,
  ErrorState,
  Field,
  LoadingState,
  inputClassName,
} from '../../components/ui';
import { useModuleDetail } from '../../features/modules/hooks';
import {
  useProject,
  useProjectSubmission,
  useSubmitProject,
} from '../../features/projects/hooks';
import type { ProjectSubmissionRow } from '../../lib/database.types';
import { getErrorMessage } from '../../lib/errors';
import { formatDateTime, isPastDeadline, safeExternalUrl } from '../../lib/format';
import { gradeTone } from '../../lib/grading';

function SubmissionEditor({
  projectId,
  studentId,
  submission,
  closed,
}: {
  projectId: string;
  studentId: string | undefined;
  submission: ProjectSubmissionRow | null;
  closed: boolean;
}) {
  const submitProject = useSubmitProject(studentId, projectId);
  const [submissionUrl, setSubmissionUrl] = useState(submission?.submission_url ?? '');
  const [submissionText, setSubmissionText] = useState(submission?.submission_text ?? '');
  const [formError, setFormError] = useState<string | null>(null);
  const safeUrl = safeExternalUrl(submission?.submission_url);

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
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-slate-900">Pengumpulan</h2>

      {closed ? (
        <div className="mt-4">
          <Alert tone="error">
            Tenggat proyek ini sudah lewat. Pengumpulan baru tidak dapat dilakukan.
          </Alert>
        </div>
      ) : null}

      {submission ? (
        <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
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

      <div className="mt-4 flex flex-col gap-4">
        <Field label="Tautan proyek (opsional)" htmlFor="project-url">
          <input
            id="project-url"
            type="url"
            value={submissionUrl}
            onChange={(event) => setSubmissionUrl(event.target.value)}
            placeholder="https://..."
            disabled={closed}
            className={inputClassName}
          />
        </Field>
        <Field label="Deskripsi hasil / catatan (opsional)" htmlFor="project-text">
          <textarea
            id="project-text"
            value={submissionText}
            onChange={(event) => setSubmissionText(event.target.value)}
            rows={6}
            disabled={closed}
            placeholder="Tulis ringkasan hasil, kendala, atau tempel potongan kode..."
            className={inputClassName}
          />
        </Field>

        {formError ? <Alert tone="error">{formError}</Alert> : null}
        {submitProject.error ? (
          <Alert tone="error">{getErrorMessage(submitProject.error)}</Alert>
        ) : null}
        {submitProject.isSuccess ? (
          <Alert tone="success">Pengumpulan proyek berhasil disimpan.</Alert>
        ) : null}

        <div>
          <Button onClick={handleSubmit} disabled={closed || submitProject.isPending}>
            <Send className="h-4 w-4" aria-hidden="true" />
            {submitProject.isPending
              ? 'Mengirim…'
              : submission
                ? 'Perbarui Pengumpulan'
                : 'Kirim Proyek'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const projectQuery = useProject(projectId);
  const submissionQuery = useProjectSubmission(user?.id, projectId);
  const moduleState = useModuleDetail(projectQuery.data?.module_id, user?.id);

  if (projectQuery.isLoading || submissionQuery.isLoading || moduleState.isLoading) {
    return <LoadingState label="Memuat proyek…" />;
  }

  if (projectQuery.error || moduleState.error) {
    return (
      <ErrorState
        message={getErrorMessage(projectQuery.error ?? moduleState.error)}
        onRetry={() => {
          void projectQuery.refetch();
          moduleState.refetch();
        }}
      />
    );
  }

  const project = projectQuery.data;
  if (!project) return <Navigate to="/student/projects" replace />;

  const moduleDetail = moduleState.detail;
  const allLessonsComplete =
    !moduleDetail ||
    moduleDetail.lessons.length === 0 ||
    moduleDetail.lessons.every((lesson) => moduleDetail.completedLessonIds.has(lesson.id));
  const closed = isPastDeadline(project.deadline_at);
  const submission = submissionQuery.data ?? null;
  const isLocked = !allLessonsComplete;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <Link
        to="/student/projects"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke daftar proyek
      </Link>

      <Card className="overflow-hidden">
        <div className="hero-mesh p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="blue">Proyek modul</Badge>
            {submission ? (
              <Badge tone="green">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                Sudah dikumpulkan
              </Badge>
            ) : (
              <Badge tone="slate">Belum dikumpulkan</Badge>
            )}
            {submission?.score != null ? (
              <Badge tone={gradeTone(submission.score)}>Nilai {submission.score}</Badge>
            ) : null}
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {project.title}
          </h1>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {project.description}
          </p>
          <p className="mt-3 text-xs text-slate-500">
            {moduleDetail?.module.title ? `${moduleDetail.module.title} · ` : ''}
            Tenggat: {project.deadline_at ? formatDateTime(project.deadline_at) : 'tidak ditentukan'}
          </p>
        </div>
      </Card>

      {isLocked ? (
        <Card className="p-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Lock className="h-7 w-7" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Proyek masih terkunci</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
            Selesaikan semua pelajaran pada modul ini terlebih dahulu. Setelah itu kamu dapat
            mengumpulkan proyek dan menerima penilaian dari dosen.
          </p>
          {project.module_id ? (
            <div className="mt-5 flex justify-center">
              <Link to={`/student/modules/${project.module_id}`}>
                <Button>Lihat modul</Button>
              </Link>
            </div>
          ) : null}
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <SubmissionEditor
            key={submission?.id ?? 'new'}
            projectId={project.id}
            studentId={user?.id}
            submission={submission}
            closed={closed}
          />

          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Penilaian dosen
                </h2>
                <Trophy className="h-5 w-5 text-amber-500" aria-hidden="true" />
              </div>

              {submission?.score != null ? (
                <>
                  <p className="mt-3 flex items-center gap-2 text-3xl font-bold text-slate-900">
                    {submission.score}
                    <Badge tone={gradeTone(submission.score)}>dari 100</Badge>
                  </p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                    {submission.feedback?.trim() || 'Dosen belum menuliskan umpan balik.'}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  Proyekmu akan dinilai oleh dosen setelah dikumpulkan. Nilai dan umpan balik
                  muncul di sini.
                </p>
              )}
            </Card>

            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 text-sm text-brand-900">
              <p className="font-semibold">Bobot nilai</p>
              <p className="mt-1 leading-relaxed">
                Nilai proyek menyumbang 50% dari nilai akhir kelas. Pastikan tautan dapat dibuka
                dan deskripsi cukup jelas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
