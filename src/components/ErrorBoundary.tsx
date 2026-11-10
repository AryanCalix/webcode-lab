import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled application error', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-svh items-center justify-center bg-slate-100 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">Terjadi kesalahan</h1>
            <p className="mt-2 text-sm text-slate-600">
              Aplikasi mengalami masalah yang tidak terduga. Muat ulang halaman untuk mencoba lagi.
            </p>
            <pre className="mt-4 max-h-32 overflow-auto rounded-lg bg-slate-50 p-3 text-left text-xs text-red-700">
              {this.state.error.message}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Muat ulang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
