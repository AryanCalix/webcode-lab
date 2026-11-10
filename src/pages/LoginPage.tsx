import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Code2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Alert, Button, Field, inputClassName } from '../components/ui';

const DEMO_ACCOUNTS = [
  { role: 'Mahasiswa', email: 'budi@webcode.lab', password: 'budi1234' },
  { role: 'Dosen', email: 'siti@webcode.lab', password: 'siti1234' },
];

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

          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-slate-500">
              Akun demo
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {DEMO_ACCOUNTS.map((account) => (
                <Button
                  key={account.email}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials(account.email, account.password)}
                >
                  {account.role}
                </Button>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-slate-500">
              Pendaftaran publik dinonaktifkan. Hubungi dosen jika Anda belum memiliki akun.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
