export function ConfigurationError() {
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
