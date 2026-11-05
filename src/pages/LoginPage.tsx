import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Alert, Button, Field } from '../components/ui';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = login(email, password);

    if (result.ok) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
            <Code2 className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">WebCode Lab</h1>
            <p className="mt-1 text-sm text-slate-600">
              Platform pembelajaran interaktif untuk Pemrograman Web
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </Field>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Masuk
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-slate-500">
              Akun demo
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('budi@webcode.lab', 'budi1234')}
              >
                Mahasiswa
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemoCredentials('siti@webcode.lab', 'siti1234')}
              >
                Dosen
              </Button>
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">
              Gunakan akun demo di atas untuk mencoba alur belajar.
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-slate-600">
          Belum punya akun?{' '}
          <Link to="/" className="font-semibold text-brand-700 hover:text-brand-800">
            Kembali ke beranda
          </Link>
        </p>
      </div>
    </div>
  );
}
