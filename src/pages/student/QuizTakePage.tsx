import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Alert, Badge, Button, Card, ErrorState, LoadingState } from '../../components/ui';
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
        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600">Skor Anda</p>
            <p className="mt-1 text-5xl font-bold text-slate-900">{result.score}</p>
            <p className="mt-1 text-sm text-slate-600">
              {result.earned_points} dari {result.total_points} poin
            </p>
            <div className="mt-4">
              <Badge tone={passed ? 'green' : 'amber'}>{passed ? 'Lulus' : 'Belum lulus'}</Badge>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {questions.map((question, index) => {
              const review = result.review[index];
              const chosen = review?.chosen_index ?? -1;
              const correct = review?.correct_index ?? -1;

              return (
                <div key={question.id} className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {index + 1}. {question.question_text}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {question.options.map((option, optionIndex) => {
                      const isChosen = chosen === optionIndex;
                      const isCorrectOption = correct === optionIndex;
                      return (
                        <li
                          key={optionIndex}
                          className={`flex items-center gap-2 text-sm ${
                            isCorrectOption
                              ? 'font-semibold text-emerald-700'
                              : isChosen
                                ? 'font-semibold text-red-600'
                                : 'text-slate-600'
                          }`}
                        >
                          {isCorrectOption ? (
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          ) : isChosen ? (
                            <XCircle className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <span className="h-4 w-4" />
                          )}
                          {option}
                          {isChosen ? ' (jawaban Anda)' : ''}
                        </li>
                      );
                    })}
                  </ul>
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
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{payload.quiz.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{payload.quiz.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="blue">
            {questions.length} soal · {totalPoints} poin
          </Badge>
          {payload.quiz.duration_minutes ? (
            <Badge tone="slate">Durasi: {payload.quiz.duration_minutes} menit</Badge>
          ) : null}
          {payload.quiz.deadline_at ? (
            <Badge tone="amber">Tenggat: {formatDateTime(payload.quiz.deadline_at)}</Badge>
          ) : null}
          {remaining !== null ? (
            <Badge tone={remaining < 120 ? 'amber' : 'slate'}>
              <Clock className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              Sisa waktu {formatDuration(remaining)}
            </Badge>
          ) : null}
        </div>
      </div>

      {isExpired ? (
        <Alert tone="error">
          Waktu pengerjaan sudah habis. Jawaban yang belum dikirim tidak akan dinilai.
        </Alert>
      ) : null}

      {submitAttempt.error ? <Alert tone="error">{getErrorMessage(submitAttempt.error)}</Alert> : null}

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">Soal</h2>
        <div className="mt-4 flex flex-col gap-6">
          {questions.map((question, index) => (
            <fieldset key={question.id} className="rounded-lg border border-slate-200 p-4">
              <legend className="text-sm font-semibold text-slate-900">
                {index + 1}. {question.question_text}{' '}
                <span className="font-normal text-slate-500">({question.points} poin)</span>
              </legend>
              <div className="mt-3 flex flex-col gap-2">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                      answers[index] === optionIndex
                        ? 'border-brand-300 bg-brand-50 text-slate-900'
                        : 'border-slate-200 text-slate-700'
                    } ${isExpired ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={answers[index] === optionIndex}
                      disabled={isExpired}
                      onChange={() => {
                        setAnswers((previous) => {
                          const next = [...previous];
                          next[index] = optionIndex;
                          return next;
                        });
                      }}
                      className="h-4 w-4 accent-brand-600"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {answeredCount} dari {questions.length} soal dijawab
          </p>
          <Button
            onClick={handleSubmit}
            disabled={
              answeredCount < questions.length || isExpired || submitAttempt.isPending
            }
          >
            {submitAttempt.isPending ? 'Mengirim…' : 'Kirim Jawaban'}
          </Button>
        </div>
        {answeredCount < questions.length ? (
          <p className="mt-2 text-xs text-slate-500">
            Jawaban semua soal harus diisi sebelum mengirim.
          </p>
        ) : null}
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
