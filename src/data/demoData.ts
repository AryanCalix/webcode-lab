export type Role = 'student' | 'lecturer';

export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: Role;
}

export type ModuleStatus = 'completed' | 'in-progress' | 'not-started';

export interface Lesson {
  id: string;
  title: string;
  kind: 'material' | 'exercise';
  exerciseId?: string;
}

export interface Exercise {
  id: string;
  lessonId: string;
  title: string;
  instructions: string;
  starterHtml: string;
  starterCss: string;
  starterJs: string;
  hint: string;
}

export interface ExerciseSubmission {
  exerciseId: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  isCorrect: boolean;
  feedback: string;
  submittedAt: string;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  order: number;
  published: boolean;
  status: ModuleStatus;
  progressPercent: number;
  lessons: Lesson[];
}

export interface StudentGamification {
  level: number;
  levelName: string;
  totalXp: number;
  currentStreak: number;
}

export interface StudentProfile extends StudentGamification {
  fullName: string;
  completedModules: number;
}

export interface LecturerStudentProgress {
  studentId: string;
  fullName: string;
  email: string;
  level: number;
  levelName: string;
  totalXp: number;
  currentStreak: number;
  averageProgressPercent: number;
  lastActiveModuleId: string | null;
}

export const demoUsers: User[] = [
  {
    id: 'usr_student',
    fullName: 'Budi Santoso',
    email: 'budi@webcode.lab',
    password: 'budi1234',
    role: 'student',
  },
  {
    id: 'usr_lecturer',
    fullName: 'Dr. Siti Aminah',
    email: 'siti@webcode.lab',
    password: 'siti1234',
    role: 'lecturer',
  },
];

export const studentProfile: StudentProfile = {
  fullName: 'Budi Santoso',
  level: 2,
  levelName: 'Menengah',
  totalXp: 340,
  currentStreak: 5,
  completedModules: 2,
};

export const modules: LearningModule[] = [
  {
    id: 'mod-pengantar-web',
    title: 'Pengantar Web',
    description:
      'Konsep dasar pengembangan web: apa itu web, client-server, dan cara browser memuat halaman.',
    order: 1,
    published: true,
    status: 'completed',
    progressPercent: 100,
    lessons: [
      { id: 'les-pengantar-web-1', title: 'Apa itu Pemrograman Web?', kind: 'material' },
      { id: 'les-pengantar-web-2', title: 'Client, Server, dan Browser', kind: 'material' },
      {
        id: 'les-pengantar-web-3',
        title: 'Latihan: Sajikan halaman pertama',
        kind: 'exercise',
        exerciseId: 'ex-pengantar-web-1',
      },
    ],
  },
  {
    id: 'mod-html-dasar',
    title: 'HTML Dasar',
    description: 'Struktur dokumen HTML: elemen dasar, atribut, dan semantic HTML.',
    order: 2,
    published: true,
    status: 'completed',
    progressPercent: 100,
    lessons: [
      { id: 'les-html-dasar-1', title: 'Elemen Dasar HTML', kind: 'material' },
      { id: 'les-html-dasar-2', title: 'Atribut dan Semantic HTML', kind: 'material' },
      {
        id: 'les-html-dasar-3',
        title: 'Latihan: Struktur halaman portofolio',
        kind: 'exercise',
        exerciseId: 'ex-html-dasar-3',
      },
    ],
  },
  {
    id: 'mod-css-dasar',
    title: 'CSS Dasar',
    description: 'Memilih elemen, selector, dan properti dasar CSS seperti warna dan ukuran.',
    order: 3,
    published: true,
    status: 'in-progress',
    progressPercent: 60,
    lessons: [
      { id: 'les-css-dasar-1', title: 'Selektor dan Cascade', kind: 'material' },
      {
        id: 'les-css-dasar-2',
        title: 'Latihan: Ubah warna judul menjadi biru',
        kind: 'exercise',
        exerciseId: 'ex-css-judul-biru',
      },
    ],
  },
  {
    id: 'mod-flexbox-grid',
    title: 'Flexbox dan Grid',
    description: 'Tata letak dua dimensi untuk tampilan web yang kompleks.',
    order: 4,
    published: true,
    status: 'not-started',
    progressPercent: 0,
    lessons: [
      { id: 'les-flexbox-grid-1', title: 'Flexbox untuk tata letak baris', kind: 'material' },
    ],
  },
];

export const lecturerStudents: LecturerStudentProgress[] = [
  {
    studentId: 'stu-001',
    fullName: 'Budi Santoso',
    email: 'budi@webcode.lab',
    level: 2,
    levelName: 'Menengah',
    totalXp: 340,
    currentStreak: 5,
    averageProgressPercent: 75,
    lastActiveModuleId: 'mod-css-dasar',
  },
  {
    studentId: 'stu-002',
    fullName: 'Citra Laras',
    email: 'citra@webcode.lab',
    level: 1,
    levelName: 'Pemula',
    totalXp: 120,
    currentStreak: 2,
    averageProgressPercent: 35,
    lastActiveModuleId: 'mod-html-dasar',
  },
  {
    studentId: 'stu-003',
    fullName: 'Dimas Prakoso',
    email: 'dimas@webcode.lab',
    level: 3,
    levelName: 'Atasan',
    totalXp: 520,
    currentStreak: 12,
    averageProgressPercent: 90,
    lastActiveModuleId: 'mod-flexbox-grid',
  },
];

export function getModuleById(moduleId: string): LearningModule | undefined {
  return modules.find((module) => module.id === moduleId);
}

/** Modul pertama yang belum selesai — ditargetkan tombol "Lanjutkan Belajar". */
export function getNextModuleToContinue(status: ModuleStatus): LearningModule | undefined {
  if (status === 'completed') {
    return undefined;
  }
  return modules
    .filter((module) => module.status !== 'completed')
    .sort((a, b) => a.order - b.order)[0];
}

export const exercises: Exercise[] = [
  {
    id: 'ex-pengantar-web-1',
    lessonId: 'les-pengantar-web-3',
    title: 'Latihan: Sajikan Halaman Pertama',
    instructions:
      'Buatlah halaman web sederhana yang menampilkan heading "Halo Web" menggunakan tag HTML yang tepat. Pelajari cara menulis elemen dasar HTML sebelum lanjut ke latihan berikutnya.',
    starterHtml: '<h1>Halo Web</h1>',
    starterCss: '',
    starterJs: '',
    hint: 'Gunakan tag heading seperti <h1> untuk tajuk utama, atau <h2> untuk sub-tajuk.',
  },
  {
    id: 'ex-html-dasar-3',
    lessonId: 'les-html-dasar-3',
    title: 'Latihan: Struktur Halaman Portofolio',
    instructions:
      'Buatlah struktur HTML untuk halaman portofolio: ada elemen header dengan judul, beberapa elemen section untuk proyek, dan footer.',
    starterHtml:
      '<header>\n  <h1>Nama Saya</h1>\n</header>\n<section>\n  <h2>Proyek Pertama</h2>\n</section>\n<footer>© 2026</footer>',
    starterCss: '',
    starterJs: '',
    hint: 'Gunakan elemen semantik seperti header, section, dan footer, bukan hanya div kosong.',
  },
  {
    id: 'ex-css-judul-biru',
    lessonId: 'les-css-dasar-2',
    title: 'Latihan: Ubah Warna Judul Menjadi Biru',
    instructions:
      'Ubah warna judul menjadi biru. Perhatikan cara CSS mengatur warna melalui properti `color` pada selektor elemen.',
    starterHtml: '<h1>Halo Web</h1>',
    starterCss: 'h1 {\n  color: red;\n}',
    starterJs: '',
    hint: 'Cek properti `color` pada selektor `h1`. Anda bisa memakai nilai seperti `blue`, `#0000ff`, atau `rgb(0, 0, 255)`.',
  },
];

export function getExerciseById(exerciseId: string): Exercise | undefined {
  return exercises.find((exercise) => exercise.id === exerciseId);
}

const SUBMIT_KEY_PREFIX = 'webcode.submission.';

export function saveExerciseSubmission(submission: ExerciseSubmission): void {
  try {
    window.localStorage.setItem(
      `${SUBMIT_KEY_PREFIX}${submission.exerciseId}`,
      JSON.stringify(submission),
    );
  } catch {
    // abaikan kegagalan penyimpanan lokal
  }
}

export function getExerciseSubmission(exerciseId: string): ExerciseSubmission | null {
  try {
    const raw = window.localStorage.getItem(`${SUBMIT_KEY_PREFIX}${exerciseId}`);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as ExerciseSubmission;
  } catch {
    return null;
  }
}

export function clearExerciseSubmission(exerciseId: string): void {
  try {
    window.localStorage.removeItem(`${SUBMIT_KEY_PREFIX}${exerciseId}`);
  } catch {
    // abaikan
  }
}

/** Mock validator untuk demo latihan. Layout/konfigurasi validator per latihan akan berasal dari backend. */
export function validateExercise(
  exercise: Exercise,
  code: { html: string; css: string; js: string },
): { isCorrect: boolean; feedback: string } {
  if (exercise.id === 'ex-css-judul-biru') {
    const normalizedCss = code.css.toLowerCase().replace(/\s+/g, ' ');
    const match = normalizedCss.match(/h1\s*{([^}]*)}/);
    const block = match?.[1] ?? '';

    const hasColorProperty = /(^|\s)color\s*:/.test(block);
    const usesBlue =
      /(^|\s)color\s*:\s*(blue|#0000ff|rgb\(0,\s*0,\s*255\))/.test(block);

    if (hasColorProperty && usesBlue) {
      return {
        isCorrect: true,
        feedback:
          'Kode benar! Elemen h1 sekarang memiliki warna biru. Anda telah memahami cara CSS mengatur warna.',
      };
    }

    if (!hasColorProperty) {
      return {
        isCorrect: false,
        feedback:
          'Masih tidak ada properti `color` pada selektor `h1`. Tambahkan `color: <nilai>` di dalam blok `h1 { ... }`.',
      };
    }

    return {
      isCorrect: false,
      feedback:
        'Warna judul belum berupa biru. Ubah nilai properti `color` menjadi biru, misalnya `color: blue` atau `#0000ff`.',
    };
  }

  if (exercise.id === 'ex-pengantar-web-1') {
    const hasHeading = /<h[1-6[^>]*>/.test(code.html);
    if (hasHeading) {
      return {
        isCorrect: true,
        feedback: 'Kode benar! Heading HTML Anda valid dan halaman berhasil disajikan.',
      };
    }
    return {
      isCorrect: false,
      feedback: 'Heading HTML belum ditemukan. Pastikan Anda menggunakan tag heading seperti <h1> atau <h2>.',
    };
  }

  return { isCorrect: false, feedback: 'Validasi demo belum tersedia untuk latihan ini.' };
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctIndex: number;
  points: number;
  order: number;
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  durationMinutes: number | null;
  deadlineAt: string | null;
  published: boolean;
  createdBy: string;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  answers: number[];
  score: number;
  startedAt: string;
  submittedAt: string;
}

export interface Project {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  deadlineAt: string | null;
}

export interface ProjectSubmission {
  id: string;
  projectId: string;
  studentId: string;
  studentName: string;
  submissionUrl: string | null;
  submissionText: string | null;
  submittedAt: string;
}

const demoQuizzes: Quiz[] = [
  {
    id: 'quiz-html-dasar',
    moduleId: 'mod-html-dasar',
    title: 'Kuis: HTML Dasar',
    description: 'Uji pemahaman dasar Anda tentang elemen HTML.',
    durationMinutes: 15,
    deadlineAt: null,
    published: true,
    createdBy: 'usr_lecturer',
    questions: [
      {
        id: 'q1',
        quizId: 'quiz-html-dasar',
        question: 'Elemen HTML apa yang digunakan untuk membuat judul utama halaman?',
        options: ['<h1>', '<div>', '<p>', '<span>'],
        correctIndex: 0,
        points: 100,
        order: 0,
      },
      {
        id: 'q2',
        quizId: 'quiz-html-dasar',
        question: 'Elemen HTML apa yang digunakan untuk paragraf?',
        options: ['<p>', '<h2>', '<ul>', '<ol>'],
        correctIndex: 0,
        points: 100,
        order: 1,
      },
      {
        id: 'q3',
        quizId: 'quiz-html-dasar',
        question: 'Tag HTML apa yang membuat daftar tidak terurut?',
        options: ['<ul>', '<ol>', '<div>', '<h3>'],
        correctIndex: 0,
        points: 100,
        order: 2,
      },
    ],
  },
  {
    id: 'quiz-css-judul-biru',
    moduleId: 'mod-css-dasar',
    title: 'Kuis: CSS Dasar',
    description: 'Uji pemahaman properti dasar CSS seperti selector dan color.',
    durationMinutes: 10,
    deadlineAt: null,
    published: true,
    createdBy: 'usr_lecturer',
    questions: [
      {
        id: 'q4',
        quizId: 'quiz-css-judul-biru',
        question: 'Properti CSS apa yang digunakan untuk mengubah warna teks?',
        options: ['color', 'background-color', 'text-style', 'font-color'],
        correctIndex: 0,
        points: 100,
        order: 0,
      },
    ],
  },
];

const demoQuizAttempts: QuizAttempt[] = [
  {
    id: 'att-001',
    quizId: 'quiz-html-dasar',
    studentId: 'stu_001',
    studentName: 'Budi Santoso',
    answers: [0, 0, 0],
    score: 100,
    startedAt: '2026-10-28T09:12:00.000Z',
    submittedAt: '2026-10-28T09:14:30.000Z',
  },
];

const demoProjects: Project[] = [
  {
    id: 'prj-portofolio',
    moduleId: 'mod-html-dasar',
    title: 'Portofolio Dua Halaman',
    description:
      'Buatlah halaman web portofolio dengan minimal dua halaman: beranda (tentang) dan detail proyek.',
    deadlineAt: '2026-11-30T23:59:00.000Z',
  },
  {
    id: 'prj-halaman-tugas',
    moduleId: 'mod-pengantar-web',
    title: 'Halaman Kegiatan Kelas',
    description: 'Sajikan informasi singkat tentang kegiatan kelas dengan heading dan daftar kegiatan.',
    deadlineAt: '2026-11-12T23:59:00.000Z',
  },
];

const demoProjectSubmissions: ProjectSubmission[] = [
  {
    id: 'prjsub-001',
    projectId: 'prj-portofolio',
    studentId: 'stu_001',
    studentName: 'Budi Santoso',
    submissionUrl: 'https://example.com/budi-portofolio',
    submissionText: null,
    submittedAt: '2026-11-01T14:20:00.000Z',
  },
];

const QUIZ_KEY = 'webcode.quizzes.v1';
const ATTEMPT_KEY = 'webcode.attempts.v1';
const PROJECT_KEY = 'webcode.projects.v1';
const PROJECT_SUBMISSION_KEY = 'webcode.project-submissions.v1';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // abaikan kegagalan penyimpanan lokal
  }
}

export function getQuizzes(): Quiz[] {
  return readJson<Quiz[]>(QUIZ_KEY, demoQuizzes);
}

export function saveQuiz(quiz: Quiz): void {
  const list = getQuizzes().filter((item) => item.id !== quiz.id);
  list.push(quiz);
  writeJson(QUIZ_KEY, list);
}

export function deleteQuiz(quizId: string): void {
  writeJson(
    QUIZ_KEY,
    getQuizzes().filter((quiz) => quiz.id !== quizId),
  );
}

export function getQuizById(quizId: string): Quiz | undefined {
  return getQuizzes().find((quiz) => quiz.id === quizId);
}

export function getQuizzesByModule(moduleId: string): Quiz[] {
  return getQuizzes().filter((quiz) => quiz.moduleId === moduleId && quiz.published);
}

export function getQuizAttempts(): QuizAttempt[] {
  return readJson<QuizAttempt[]>(ATTEMPT_KEY, demoQuizAttempts);
}

export function saveQuizAttempt(attempt: QuizAttempt): QuizAttempt[] {
  const list = [
    ...getQuizAttempts().filter(
      (item) => !(item.quizId === attempt.quizId && item.studentId === attempt.studentId),
    ),
    attempt,
  ];
  writeJson(ATTEMPT_KEY, list);
  return list;
}

export function getProjects(): Project[] {
  return readJson<Project[]>(PROJECT_KEY, demoProjects);
}

export function saveProjectSubmission(submission: ProjectSubmission): void {
  const list = [...getProjectSubmissions().filter((item) => item.id !== submission.id), submission];
  writeJson(PROJECT_SUBMISSION_KEY, list);
}

export function getProjectById(projectId: string): Project | undefined {
  return getProjects().find((project) => project.id === projectId);
}

export function getProjectSubmissions(): ProjectSubmission[] {
  return readJson<ProjectSubmission[]>(PROJECT_SUBMISSION_KEY, demoProjectSubmissions);
}

export interface ForumReply {
  id: string;
  threadId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface ForumThread {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  createdAt: string;
  replies: ForumReply[];
}

const demoThreads: ForumThread[] = [
  {
    id: 'thread-1',
    authorId: 'stu_002',
    authorName: 'Citra Laras',
    title: 'Tanya tentang selector CSS untuk warna',
    body: 'Saya bingung, apakah kita harus pakai `color` atau `background-color` untuk menata warna teks?',
    createdAt: '2026-10-30T08:15:00.000Z',
    replies: [
      {
        id: 'reply-1',
        threadId: 'thread-1',
        authorId: 'usr_student',
        authorName: 'Budi Santoso',
        body: 'Untuk warna teks pakai properti `color`. `background-color` hanya untuk latar belakang elemen.',
        createdAt: '2026-10-30T09:02:00.000Z',
      },
    ],
  },
];

const FORUM_THREADS_KEY = 'webcode.forum-threads.v1';

export function getForumThreads(): ForumThread[] {
  return readJson<ForumThread[]>(FORUM_THREADS_KEY, demoThreads);
}

export function getForumThreadById(threadId: string): ForumThread | undefined {
  return getForumThreads().find((thread) => thread.id === threadId);
}

export function saveForumThread(thread: ForumThread): void {
  const list = getForumThreads().filter((item) => item.id !== thread.id);
  list.push(thread);
  writeJson(FORUM_THREADS_KEY, list);
}

export function saveForumReply(reply: ForumReply): ForumThread | undefined {
  const threads = getForumThreads();
  const thread = threads.find((item) => item.id === reply.threadId);
  if (!thread) {
    return undefined;
  }
  thread.replies.push(reply);
  writeJson(FORUM_THREADS_KEY, threads);
  return thread;
}
