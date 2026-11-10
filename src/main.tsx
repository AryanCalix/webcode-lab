import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './auth/AuthProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { queryClient } from './lib/queryClient';
import { isSupabaseConfigured } from './lib/supabase';

function ConfigurationError() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Konfigurasi Supabase belum lengkap</h1>
        <p className="mt-2 text-sm text-slate-600">
          Buat file <code className="rounded bg-slate-100 px-1">.env.local</code> berdasarkan{' '}
          <code className="rounded bg-slate-100 px-1">.env.example</code>, lalu isi{' '}
          <code className="rounded bg-slate-100 px-1">VITE_SUPABASE_URL</code> dan{' '}
          <code className="rounded bg-slate-100 px-1">VITE_SUPABASE_ANON_KEY</code>.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Jangan pernah menaruh service role key di variabel <code>VITE_*</code>.
        </p>
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Elemen #root tidak ditemukan.');

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      {isSupabaseConfigured ? (
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      ) : (
        <ConfigurationError />
      )}
    </ErrorBoundary>
  </StrictMode>,
);
