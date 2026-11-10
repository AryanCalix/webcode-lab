import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function AuthLoadingScreen() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-slate-600">Memuat WebCode Lab…</p>
      </div>
    </div>
  );
}

export function RequireAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function RequireStudent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'student') {
    return <Navigate to="/lecturer/dashboard" replace />;
  }

  return <Outlet />;
}

export function RequireLecturer() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'lecturer') {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Outlet />;
}
