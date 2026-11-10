import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { ProgressRing } from '../../components/ProgressRing';
import { Alert, Button, Card, ErrorState, LoadingState } from '../../components/ui';
import {
  useStartQuizAttempt,
  useSubmitQuizAttempt,
} from '../../features/quizzes/hooks';
import type { QuizStartPayload, QuizSubmitPayload } from '../../features/quizzes/api';
import { getErrorMessage } from '../../lib/errors';
import { formatDateTime, formatDuration } from '../../lib/format';

function QuizRunner({
  payload,
  studentId,
}: {
  payload: QuizStartPayload;
  studentId: string | undefined;
}) {
  const questions = useMemo(
    () =>
      payload.questions.map((question) => ({
        ...question,
        options: Array.isArray(question.options) ? (question.options as string[]) : [],
      })),
    [payload.questions],
  );

  const totalPoints = questions.reduce((sum, question) => sum + question.points, 0);
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => -1));
  const [result, setResult] = useState<QuizSubmitPayload | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const submitAttempt = useSubmitQuizAttempt(studentId);

  useEffect(() => {
    if (!payload.expires_at) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [payload.expires_at]);

  const remaining = payload.expires_at
    ? Math.max(0, Math.floor((new Date(payload.expires_at).getTime() - now) / 1000))
    : null;
  const isExpired = remaining !== null && remaining <= 0;
  const answeredCount = answers.filter((answer) => answer >= 0).length;
  const answeredPercent = Math.round((answeredCount / questions.length) * 100);

  const handleSubmit = () => {
    submitAttempt.mutate(
      { attemptId: payload.attempt_id, answers },
      { onSuccess: (data) => setResult(data) },
    );
  };

  if (result) {
    const passed = result.score >= 70;

    return (
      <div className="mx-auto max-w-3xl">
        <Link
          to="/student/quizzes"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Kembali ke daftar kuis
        </Link>

        <Card className="overflow-hidden">
          <div className="relative overflow-hidden bg-[#120b2b] px-5 py-6 sm:px-6">
            <div
              aria-hidden="true"
              className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-violet-600/55 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-fuchsia-500/25 blur-3xl"
            />
            <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-[0.16]" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-1 -top-10 select-none text-[130px] font-black leading-none text-white/[0.07]"
            >
              ?
            </span>

            <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
              <div className="min-w-0 text-center sm:text-left">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">
                  Hasil kuis
                </p>
                <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                  {payload.quiz.title}
                </h1>
                <p className="mt-2 text-sm text-white/70">
                  {result.earned_points} dari {result.total_points} poin
                </p>
                <span
                  className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                    passed
                      ? 'bg-emerald-400/15 text-emerald-300 ring-emerald-400/30'
                      : 'bg-amber-400/15 text-amber-300 ring-amber-400/30'
                  }`}
                >
                  {passed ? (
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {passed ? 'Lulus' : 'Belum lulus'}
                </span>
              </div>

              <div className="shrink-0 rounded-2xl bg-white p-3 shadow-xl shadow-black/30">
                <ProgressRing
                  value={result.score}
                  size={104}
                  strokeWidth={10}
                  strokeClassName={passed ? 'stroke-violet-500' : 'stroke-amber-500'}
                />
              </div>
            </div>
          </div>

          <div className="p-5">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Pembahasan
            </h2>
            <div className="mt-3 flex flex-col gap-3">
              {questions.map((question, index) => {
                const review = result.review.find((item) => item.question_id === question.id);
                const chosen = review?.chosen_index ?? -1;
                const correct = review?.correct_index ?? -1;

                return (
                  <div
                    key={question.id}
                    className={`rounded-xl border p-4 ${
                      review?.is_correct
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                          review?.is_correct
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {review?.is_correct ? (
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <XCircle className="h-4 w-4" aria-hidden="true" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {index + 1}. {question.question_text}
                        </p>
                        <ul className="mt-2 space-y-1.5">
                          {question.options.map((option, optionIndex) => {
                            const isChosen = chosen === optionIndex;
                            const isCorrectOption = correct === optionIndex;
                            return (
                              <li
                                key={optionIndex}
                                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm ${
                                  isCorrectOption
                                    ? 'bg-emerald-50 font-semibold text-emerald-800 ring-1 ring-emerald-200'
                                    : isChosen
                                      ? 'bg-red-50 font-semibold text-red-700 ring-1 ring-red-200'
                                      : 'text-slate-600'
                                }`}
                              >
                                {isCorrectOption ? (
                                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                                ) : isChosen ? (
                                  <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                                ) : (
                                  <span className="h-4 w-4 shrink-0" />
                                )}
                                {option}
                                {isChosen ? (
                                  <span className="ml-auto text-[11px] font-medium">jawaban Anda</span>
                                ) : null}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/student/quizzes">
                <Button variant="outline">Kembali ke daftar kuis</Button>
              </Link>
              <Button onClick={() => window.location.reload()}>Kerjakan Ulang</Button>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              XP dari kuis ini sudah dihitung sekali per kuis. Mengulang kuis tidak menambah XP.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <Link
          to="/student/quizzes"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Kembali ke daftar kuis
        </Link>

        <Card className="overflow-hidden">
          <div className="relative overflow-hidden bg-[#120b2b] px-5 py-6 sm:px-6">
            <div
              aria-hidden="true"
              className="absolute -right-14 -top-16 h-48 w-48 rounded-full bg-violet-600/55 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-24 -left-12 h-44 w-44 rounded-full bg-fuchsia-500/25 blur-3xl"
            />
            <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-[0.16]" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-1 -top-10 select-none text-[130px] font-black leading-none text-white/[0.07]"
            >
              ?
            </span>

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">
                  Lembar kuis
                </p>
                <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                  {payload.quiz.title}
                </h1>
                {payload.quiz.description ? (
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
                    {payload.quiz.description}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/80 ring-1 ring-white/10">
                    {questions.length} soal · {totalPoints} poin
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/80 ring-1 ring-white/10">
                    {payload.quiz.duration_minutes
                      ? `${payload.quiz.duration_minutes} menit`
                      : 'Tanpa batas waktu'}
                  </span>
                  {payload.quiz.deadline_at ? (
                    <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-xs font-semibold text-amber-200 ring-1 ring-amber-400/25">
                      Tenggat {formatDateTime(payload.quiz.deadline_at)}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="shrink-0">
                <div
                  className={`rounded-2xl px-4 py-3 text-center ring-1 ${
                    remaining !== null && remaining < 120
                      ? 'bg-amber-400/15 ring-amber-300/30'
                      : 'bg-white/10 ring-white/15'
                  }`}
                >
                  <Clock className="mx-auto h-4 w-4 text-violet-300" aria-hidden="true" />
                  <p className="mt-1 font-mono text-xl font-bold tabular-nums text-white">
                    {remaining !== null ? formatDuration(remaining) : '∞'}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-white/50">
                    {remaining !== null ? 'sisa waktu' : 'tanpa batas'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3">
            <p className="whitespace-nowrap text-xs font-semibold text-slate-600">
              {answeredCount}/{questions.length} dijawab
            </p>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="progress-fill h-full rounded-full bg-gradient-to-r from-violet-400 to-violet-600"
                style={{ width: `${answeredPercent}%` }}
              />
            </div>
            <p className="text-xs font-bold text-violet-700">{answeredPercent}%</p>
          </div>
        </Card>
      </div>

      {isExpired ? (
        <Alert tone="error">
          Waktu pengerjaan sudah habis. Jawaban yang belum dikirim tidak akan dinilai.
        </Alert>
      ) : null}

      {submitAttempt.error ? <Alert tone="error">{getErrorMessage(submitAttempt.error)}</Alert> : null}

      <div className="flex flex-col gap-4">
        {questions.map((question, index) => (
          <Card key={question.id} className="p-5">
            <fieldset>
              <legend className="sr-only">Soal {index + 1}</legend>
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{question.question_text}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{question.points} poin</p>

                  <div className="mt-3 grid gap-2">
                    {question.options.map((option, optionIndex) => {
                      const selected = answers[index] === optionIndex;

                      return (
                        <label
                          key={optionIndex}
                          className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                            selected
                              ? 'border-violet-300 bg-violet-50 text-slate-900'
                              : 'border-slate-200 text-slate-700 hover:border-violet-200 hover:bg-slate-50'
                          } ${isExpired ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={selected}
                            disabled={isExpired}
                            onChange={() => {
                              setAnswers((previous) => {
                                const next = [...previous];
                                next[index] = optionIndex;
                                return next;
                              });
                            }}
                            className="h-4 w-4 accent-violet-600"
                          />
                          {option}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </fieldset>
          </Card>
        ))}
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {answeredCount} dari {questions.length} soal dijawab
          </p>
          <p className="text-xs text-slate-500">
            {answeredCount < questions.length
              ? 'Semua soal harus dijawab sebelum mengirim.'
              : 'Semua soal sudah dijawab. Periksa kembali sebelum mengirim.'}
          </p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={answeredCount < questions.length || isExpired || submitAttempt.isPending}
        >
          {submitAttempt.isPending ? 'Mengirim…' : 'Kirim Jawaban'}
        </Button>
      </Card>
    </div>
  );
}

export default function QuizTakePage() {
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuth();
  const startAttempt = useStartQuizAttempt(quizId);

  if (startAttempt.isLoading) return <LoadingState label="Menyiapkan kuis…" />;

  if (startAttempt.error) {
    return (
      <div className="mx-auto max-w-xl">
        <ErrorState message={getErrorMessage(startAttempt.error)} />
        <div className="mt-4 text-center">
          <Link to="/student/quizzes">
            <Button variant="outline">Kembali ke daftar kuis</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!startAttempt.data) return <LoadingState label="Menyiapkan kuis…" />;

  return (
    <QuizRunner
      key={startAttempt.data.attempt_id}
      payload={startAttempt.data}
      studentId={user?.id}
    />
  );
}
