import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import {
  getQuizById,
  getQuizAttempts,
  saveQuizAttempt,
  type Quiz,
  type QuizAttempt,
} from '../../data/demoData';
import { Badge, Button, Card } from '../../components/ui';

const createAttemptId = () => `att-${Date.now()}`;
const createAttemptTimestamp = () => new Date().toISOString();

function formatDeadline(deadlineAt: string | null): string | null {
  if (!deadlineAt) {
    return null;
  }
  const date = new Date(deadlineAt);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function QuizTakePage() {
  const { quizId } = useParams<{ quizId: string }>();
  const quiz: Quiz | undefined = quizId ? getQuizById(quizId) : undefined;

  const [answers, setAnswers] = useState<number[]>(quiz?.questions.map(() => -1) ?? []);
  const [result, setResult] = useState<QuizAttempt | null>(null);

  if (!quiz) {
    return <Navigate to="/student/quizzes" replace />;
  }

  if (!quiz.published) {
    return (
      <div className="mx-auto max-w-xl">
        <Card className="p-6 text-center">
          <h1 className="text-xl font-bold text-slate-900">Kuis belum tersedia</h1>
          <p className="mt-2 text-sm text-slate-600">
            Kuis ini belum dipublikasikan oleh dosen.
          </p>
          <div className="mt-6">
            <Link to="/student/quizzes">
              <Button variant="outline">Kembali ke daftar kuis</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const totalPoints = quiz.questions.reduce((sum, question) => sum + question.points, 0);
  const answeredCount = answers.filter((answer) => answer >= 0).length;

  const handleSubmit = () => {
    const earned = quiz.questions.reduce(
      (sum, question, index) => sum + (answers[index] === question.correctIndex ? question.points : 0),
      0,
    );
    const score = totalPoints > 0 ? Math.round((earned / totalPoints) * 100) : 0;

    const attempt: QuizAttempt = {
      id: createAttemptId(),
      quizId: quiz.id,
      studentId: 'usr_student',
      studentName: 'Budi Santoso',
      answers,
      score,
      startedAt: createAttemptTimestamp(),
      submittedAt: createAttemptTimestamp(),
    };
    saveQuizAttempt(attempt);
    setResult(attempt);
  };

  const existingAttempts = getQuizAttempts().filter((attempt) => attempt.quizId === quiz.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <Link
          to="/student/quizzes"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Kembali ke daftar kuis
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{quiz.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{quiz.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="blue">
            {quiz.questions.length} soal · {totalPoints} poin
          </Badge>
          {quiz.durationMinutes ? <Badge tone="slate">Durasi: {quiz.durationMinutes} menit</Badge> : null}
          {formatDeadline(quiz.deadlineAt) ? <Badge tone="amber">Tenggat: {formatDeadline(quiz.deadlineAt)}</Badge> : null}
        </div>
      </div>

      {result ? (
        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600">Skor Anda</p>
            <p className="mt-1 text-5xl font-bold text-slate-900">{result.score}</p>
            <p className="mt-1 text-sm text-slate-600">dari skor maksimal {totalPoints}</p>
            <div className="mt-4">
              <Badge tone={result.score >= 70 ? 'green' : 'amber'}>
                {result.score >= 70 ? 'Lulus' : 'Belum lulus'}
              </Badge>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {quiz.questions.map((question, index) => {
              return (
                <div
                  key={question.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <p className="text-sm font-semibold text-slate-900">{question.question}</p>
                  <ul className="mt-2 space-y-1">
                    {question.options.map((option, optionIndex) => {
                      const isChosen = result.answers[index] === optionIndex;
                      const isCorrectOption = question.correctIndex === optionIndex;
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
                          {isCorrectOption ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : isChosen ? <XCircle className="h-4 w-4" aria-hidden="true" /> : <span className="h-4 w-4" />}
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

          <div className="mt-6">
            <Link to="/student/quizzes">
              <Button variant="outline">Kerjakan Kuis Lain</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900">Soal</h2>
          <div className="mt-4 flex flex-col gap-6">
            {quiz.questions.map((question, index) => (
              <fieldset key={question.id} className="rounded-lg border border-slate-200 p-4">
                <legend className="text-sm font-semibold text-slate-900">
                  {index + 1}. {question.question}{' '}
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
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        checked={answers[index] === optionIndex}
                        onChange={() => {
                          const nextAnswers = [...answers];
                          nextAnswers[index] = optionIndex;
                          setAnswers(nextAnswers);
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

          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              {answeredCount} dari {quiz.questions.length} soal dijawab
            </p>
            <Button onClick={handleSubmit} disabled={answeredCount < quiz.questions.length}>
              Kirim Jawaban
            </Button>
          </div>
          {answeredCount < quiz.questions.length ? (
            <p className="mt-2 text-xs text-slate-500">
              Jawaban semua soal harus diisi sebelum mengirim.
            </p>
          ) : null}
        </Card>
      )}

      <p className="text-xs text-slate-500">
        Riwayat percobaan kuis tersimpan otomatis. Skor dihitung secara otomatis dari jawaban yang benar.
        {existingAttempts.length > 0 ? ` Percobaan tersimpan: ${existingAttempts.length}.` : ''}
      </p>
    </div>
  );
}
