import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/AuthContext';
import { RequireAuth, RequireLecturer, RequireStudent } from './auth/RequireAuth';
import { Button } from './components/ui';
import { AppLayout } from './components/Layout';
import LecturerDashboardPage from './pages/lecturer/LecturerDashboardPage';
import LecturerResultsPage from './pages/lecturer/LecturerResultsPage';
import LecturerQuizListPage from './pages/lecturer/QuizListPage';
import QuizEditorPage from './pages/lecturer/QuizEditorPage';
import LoginPage from './pages/LoginPage';
import ModuleDetailPage from './pages/student/ModuleDetailPage';
import ModuleListPage from './pages/student/ModuleListPage';
import PlaygroundPage from './pages/student/PlaygroundPage';
import ProjectDetailPage from './pages/student/ProjectDetailPage';
import ProjectListPage from './pages/student/ProjectListPage';
import StudentForumListPage from './pages/student/ForumListPage';
import StudentForumDetailPage from './pages/student/ForumDetailPage';
import StudentQuizListPage from './pages/student/QuizListPage';
import QuizTakePage from './pages/student/QuizTakePage';
import StudentDashboardPage from './pages/student/StudentDashboardPage';

function RootRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'lecturer' ? '/lecturer/dashboard' : '/student/dashboard'} replace />;
}

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-xl text-center">
      <h1 className="text-3xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-slate-600">Halaman yang Anda tunggu belum tersedia.</p>
      <div className="mt-6">
        <Button onClick={() => navigate('/login', { replace: true })}>Ke halaman login</Button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<RequireStudent />}>
            <Route element={<AppLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboardPage />} />
              <Route path="/student/modules" element={<ModuleListPage />} />
              <Route path="/student/modules/:moduleId" element={<ModuleDetailPage />} />
              <Route path="/student/playground/:exerciseId" element={<PlaygroundPage />} />
              <Route path="/student/quizzes" element={<StudentQuizListPage />} />
              <Route path="/student/quizzes/:quizId" element={<QuizTakePage />} />
              <Route path="/student/projects" element={<ProjectListPage />} />
              <Route path="/student/projects/:projectId" element={<ProjectDetailPage />} />
              <Route path="/student/forum" element={<StudentForumListPage />} />
              <Route path="/student/forum/:threadId" element={<StudentForumDetailPage />} />
            </Route>
          </Route>

          <Route element={<RequireLecturer />}>
            <Route element={<AppLayout />}>
              <Route path="/lecturer/dashboard" element={<LecturerDashboardPage />} />
              <Route path="/lecturer/quizzes" element={<LecturerQuizListPage />} />
              <Route path="/lecturer/quizzes/new" element={<QuizEditorPage />} />
              <Route path="/lecturer/quizzes/:quizId/edit" element={<QuizEditorPage />} />
              <Route path="/lecturer/results" element={<LecturerResultsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
        <Route path="/" element={<RootRedirect />} />
      </Routes>
    </AuthProvider>
  );
}
