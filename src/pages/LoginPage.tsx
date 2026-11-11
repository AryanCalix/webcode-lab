import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Code2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Alert, Button, Field, inputClassName } from '../components/ui';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await login(email, password);

    if (result.ok) {
      navigate('/', { replace: true });
      return;
    }

    setError(result.error ?? 'Gagal masuk. Periksa email dan password Anda.');
    setIsSubmitting(false);
  };

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-cream-100 px-4 py-10">
      <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 opacity-40" />
      <div
        aria-hidden="true"
        className="animate-float-slow pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-300/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-float pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-blue-300/30 blur-3xl"
      />
      <div className="animate-scale-in relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="animate-bob flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-900/20">
            <Code2 className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">WebCode Lab</h1>
            <p className="mt-1 text-sm text-slate-600">
              Platform pembelajaran interaktif untuk Pemrograman Web
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-sm">
          <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-4">
            {error ? <Alert tone="error">{error}</Alert> : null}

            <Field label="Email" htmlFor="email">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@webcode.lab"
                className={inputClassName}
              />
            </Field>

            <Field label="Password" htmlFor="password">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className={inputClassName}
              />
            </Field>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Memproses…' : 'Masuk'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
