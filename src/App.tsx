import { lazy, Suspense } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { AuthLoadingScreen, RequireAuth, RequireLecturer, RequireStudent } from './auth/RequireAuth';
import { AppLayout } from './components/Layout';
import { Card, LoadingState } from './components/ui';
import LecturerDashboardPage from './pages/lecturer/LecturerDashboardPage';
import LecturerResultsPage from './pages/lecturer/LecturerResultsPage';
import LecturerQuizListPage from './pages/lecturer/QuizListPage';
import QuizEditorPage from './pages/lecturer/QuizEditorPage';
import ModulesPage from './pages/lecturer/ModulesPage';
import ModuleEditorPage from './pages/lecturer/ModuleEditorPage';
import LessonEditorPage from './pages/lecturer/LessonEditorPage';
import StudentsPage from './pages/lecturer/StudentsPage';
import LecturerStudentDetailPage from './pages/lecturer/StudentDetailPage';
import LecturerAttendancePage from './pages/lecturer/AttendancePage';
import LecturerProjectListPage from './pages/lecturer/ProjectListPage';
import LecturerProjectEditorPage from './pages/lecturer/ProjectEditorPage';
import LoginPage from './pages/LoginPage';
import LessonDetailPage from './pages/student/LessonDetailPage';
import ModuleDetailPage from './pages/student/ModuleDetailPage';
import ModuleListPage from './pages/student/ModuleListPage';
import ProjectDetailPage from './pages/student/ProjectDetailPage';
import ProjectListPage from './pages/student/ProjectListPage';
import StudentAttendancePage from './pages/student/StudentAttendancePage';
import StudentForumListPage from './pages/student/ForumListPage';
import ForumCreatePage from './pages/student/ForumCreatePage';
import StudentForumDetailPage from './pages/student/ForumDetailPage';
import StudentQuizListPage from './pages/student/QuizListPage';
import QuizTakePage from './pages/student/QuizTakePage';
import StudentDashboardPage from './pages/student/StudentDashboardPage';

// Monaco is large; only load the editor bundle when the playground is opened.
const PlaygroundPage = lazy(() => import('./pages/student/PlaygroundPage'));

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <AuthLoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to={user.role === 'lecturer' ? '/lecturer/dashboard' : '/student/dashboard'} replace />;
}

function NotFoundPage() {
  const { user } = useAuth();
  const home = user
    ? user.role === 'lecturer'
      ? '/lecturer/dashboard'
      : '/student/dashboard'
    : '/login';

  return (
    <div className="mx-auto flex min-h-svh max-w-xl items-center px-4">
      <Card className="w-full p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-sm text-slate-600">
          Alamat yang Anda buka tidak tersedia atau sudah dipindahkan.
        </p>
        <Link
          to={home}
          className="mt-6 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Kembali ke halaman utama
        </Link>
      </Card>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<RequireStudent />}>
          <Route element={<AppLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboardPage />} />
            <Route path="/student/modules" element={<ModuleListPage />} />
            <Route path="/student/modules/:moduleId" element={<ModuleDetailPage />} />
            <Route
              path="/student/modules/:moduleId/lessons/:lessonId"
              element={<LessonDetailPage />}
            />
            <Route path="/student/quizzes" element={<StudentQuizListPage />} />
            <Route path="/student/quizzes/:quizId" element={<QuizTakePage />} />
            <Route path="/student/projects" element={<ProjectListPage />} />
            <Route path="/student/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/student/attendance" element={<StudentAttendancePage />} />
            <Route path="/student/forum" element={<StudentForumListPage />} />
            <Route path="/student/forum/new" element={<ForumCreatePage />} />
            <Route path="/student/forum/:threadId" element={<StudentForumDetailPage />} />
            <Route
              path="/student/playground/:exerciseId"
              element={
                <Suspense fallback={<LoadingState label="Memuat editor kode…" />}>
                  <PlaygroundPage />
                </Suspense>
              }
            />
          </Route>
        </Route>

        <Route element={<RequireLecturer />}>
          <Route element={<AppLayout />}>
            <Route path="/lecturer/dashboard" element={<LecturerDashboardPage />} />
            <Route path="/lecturer/students" element={<StudentsPage />} />
            <Route
              path="/lecturer/students/:studentId"
              element={<LecturerStudentDetailPage />}
            />
            <Route path="/lecturer/modules" element={<ModulesPage />} />
            <Route path="/lecturer/modules/:moduleId" element={<ModuleEditorPage />} />
            <Route path="/lecturer/modules/:moduleId/lessons/new" element={<LessonEditorPage />} />
            <Route
              path="/lecturer/modules/:moduleId/lessons/:lessonId"
              element={<LessonEditorPage />}
            />
            <Route path="/lecturer/quizzes" element={<LecturerQuizListPage />} />
            <Route path="/lecturer/quizzes/new" element={<QuizEditorPage />} />
            <Route path="/lecturer/quizzes/:quizId/edit" element={<QuizEditorPage />} />
            <Route path="/lecturer/projects" element={<LecturerProjectListPage />} />
            <Route path="/lecturer/projects/new" element={<LecturerProjectEditorPage />} />
            <Route
              path="/lecturer/projects/:projectId/edit"
              element={<LecturerProjectEditorPage />}
            />
            <Route path="/lecturer/attendance" element={<LecturerAttendancePage />} />
            <Route path="/lecturer/results" element={<LecturerResultsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
