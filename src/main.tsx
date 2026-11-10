import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './auth/AuthProvider';
import { ConfigurationError } from './components/ConfigurationError';
import { ErrorBoundary } from './components/ErrorBoundary';
import { queryClient } from './lib/queryClient';
import { isSupabaseConfigured } from './lib/supabase';

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
