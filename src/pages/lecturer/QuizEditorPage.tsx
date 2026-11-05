import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { modules, getQuizById, saveQuiz, type Quiz, type QuizQuestion } from '../../data/demoData';
import { Button, Card } from '../../components/ui';

export default function QuizEditorPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const quiz = quizId ? getQuizByIdSafe(quizId) : undefined;

  const [title, setTitle] = useState(quiz?.title ?? '');
  const [description, setDescription] = useState(quiz?.description ?? '');
  const [moduleId, setModuleId] = useState(quiz?.moduleId ?? modules[0]?.id ?? '');
  const [durationMinutes, setDurationMinutes] = useState(
    quiz?.durationMinutes ? String(quiz.durationMinutes) : '',
  );
  const [deadlineAt, setDeadlineAt] = useState(
    quiz?.deadlineAt ? quiz.deadlineAt.slice(0, 16) : '',
  );
  const [published, setPublished] = useState(quiz?.published ?? false);
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    quiz ? quiz.questions.map((question) => ({ ...question })) : [],
  );

  if (quizId && !quiz) {
    return <Navigate to="/lecturer/quizzes" replace />;
  }

  const updateQuestion = (index: number, patch: Partial<QuizQuestion>) => {
    setQuestions((prev) =>
      prev.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question,
      ),
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        quizId: quiz?.id ?? '',
        question: '',
        options: ['', ''],
        correctIndex: 0,
        points: 100,
        order: prev.length,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, questionIndex) => questionIndex !== index));
  };

  const handleSave = () => {
    const cleanedQuestions = questions
      .filter((question) => question.question.trim().length > 0)
      .map((question, index) => ({
        ...question,
        order: index,
        quizId: quiz?.id ?? `quiz-${Date.now()}`,
      }));

    const newQuiz: Quiz = {
      id: quiz?.id ?? `quiz-${Date.now()}`,
      moduleId,
      title: title.trim() || 'Kuis tanpa judul',
      description: description.trim(),
      durationMinutes: durationMinutes ? Number(durationMinutes) : null,
      deadlineAt: deadlineAt ? new Date(deadlineAt).toISOString() : null,
      published,
      createdBy: quiz?.createdBy ?? 'usr_lecturer',
      questions: cleanedQuestions,
    };
    saveQuiz(newQuiz);
    navigate('/lecturer/quizzes');
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link to="/lecturer/quizzes" className="text-sm font-medium text-slate-500 hover:text-slate-900">
          ← Kembali ke daftar kuis
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          {quiz ? 'Edit Kuis' : 'Buat Kuis'}
        </h1>
      </div>

      <Card className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-slate-700">Judul</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-slate-700">Modul</span>
            <select
              value={moduleId}
              onChange={(event) => setModuleId(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-slate-700">Durasi (menit)</span>
            <input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-slate-700">Tenggat</span>
            <input
              type="datetime-local"
              value={deadlineAt}
              onChange={(event) => setDeadlineAt(event.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </label>
        </div>
        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-slate-700">Deskripsi</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </label>
        <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={published}
            onChange={(event) => setPublished(event.target.checked)}
            className="h-4 w-4 accent-brand-600"
          />
          Terbitkan kuis (publish)
        </label>
      </Card>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Soal ({questions.length})</h2>
          <Button variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah Soal
          </Button>
        </div>

        {questions.length === 0 ? (
          <Card className="p-6 text-sm text-slate-600">
            Belum ada soal. Klik "Tambah Soal" untuk membuat soal pertama.
          </Card>
        ) : (
          <div className="grid gap-4">
            {questions.map((question, index) => (
              <Card key={`${question.id}-${index}`} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">Soal {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    aria-label="Hapus soal"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <input
                  value={question.question}
                  onChange={(event) => updateQuestion(index, { question: event.target.value })}
                  placeholder="Teks soal"
                  className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />

                <div className="mt-3 flex flex-col gap-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${question.id}`}
                        checked={question.correctIndex === optionIndex}
                        onChange={() => updateQuestion(index, { correctIndex: optionIndex })}
                        className="h-4 w-4 accent-brand-600"
                        aria-label={`Jawaban benar ke-${optionIndex + 1}`}
                      />
                      <input
                        value={option}
                        onChange={(event) => {
                          const nextOptions = [...question.options];
                          nextOptions[optionIndex] = event.target.value;
                          updateQuestion(index, { options: nextOptions });
                        }}
                        placeholder={`Pilihan ${optionIndex + 1}`}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateQuestion(index, {
                            options: question.options.filter((_, optionIndex) => optionIndex !== optionIndex),
                          })
                        }
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
                        disabled={question.options.length <= 2}
                        aria-label="Hapus pilihan"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {question.options.length < 6 ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateQuestion(index, { options: [...question.options, ''] })
                      }
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Tambah Pilihan
                    </Button>
                  ) : null}
                </div>

                <div className="mt-3 grid w-full max-w-40 gap-2 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-600">Poin</span>
                    <input
                      type="number"
                      min={1}
                      value={question.points}
                      onChange={(event) => updateQuestion(index, { points: Number(event.target.value) || 100 })}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-600">Jawaban benar</span>
                    <select
                      value={question.correctIndex}
                      onChange={(event) => updateQuestion(index, { correctIndex: Number(event.target.value) })}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    >
                      {question.options.map((option, optionIndex) => (
                        <option key={optionIndex} value={optionIndex}>
                          {option || `Pilihan ${optionIndex + 1}`}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={handleSave}>Simpan Kuis</Button>
        <Link to="/lecturer/quizzes">
          <Button variant="outline">Batal</Button>
        </Link>
      </div>
    </div>
  );
}

function getQuizByIdSafe(id: string | undefined): Quiz | undefined {
  return id ? getQuizById(id) : undefined;
}
