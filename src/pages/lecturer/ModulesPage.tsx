import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  inputClassName,
} from '../../components/ui';
import {
  useDeleteModule,
  useModulesWithLessonCounts,
  useSaveModule,
} from '../../features/lecturer/hooks';
import type { ModuleWithLessonCount } from '../../features/lecturer/hooks';
import { getErrorMessage } from '../../lib/errors';

interface ModuleForm {
  id?: string;
  title: string;
  description: string;
  orderIndex: number;
  isPublished: boolean;
}

const emptyForm = (orderIndex: number): ModuleForm => ({
  title: '',
  description: '',
  orderIndex,
  isPublished: true,
});

export default function ModulesPage() {
  const { modules, isLoading, error, refetch } = useModulesWithLessonCounts();
  const saveModule = useSaveModule();
  const deleteModule = useDeleteModule();
  const [form, setForm] = useState<ModuleForm | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoading) return <LoadingState label="Memuat modul…" />;
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />;

  const startCreate = () => {
    setForm(emptyForm(modules.length + 1));
    setFormError(null);
  };

  const startEdit = (module: ModuleWithLessonCount) => {
    setForm({
      id: module.id,
      title: module.title,
      description: module.description,
      orderIndex: module.order_index,
      isPublished: module.is_published,
    });
    setFormError(null);
  };

  const handleSave = () => {
    if (!form) return;
    setFormError(null);

    if (form.title.trim().length < 3) {
      setFormError('Judul modul minimal 3 karakter.');
      return;
    }

    saveModule.mutate(
      {
        id: form.id,
        title: form.title,
        description: form.description,
        orderIndex: form.orderIndex,
        isPublished: form.isPublished,
      },
      {
        onSuccess: () => setForm(null),
      },
    );
  };

  const handleDelete = (module: ModuleWithLessonCount) => {
    const confirmed = window.confirm(
      `Hapus modul “${module.title}”? Semua pelajaran, kuis, dan proyek di dalamnya akan ikut terhapus.`,
    );
    if (!confirmed) return;

    deleteModule.mutate(module.id, {
      onSuccess: () => {
        if (form?.id === module.id) setForm(null);
      },
    });
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Manajemen Modul</h1>
          <p className="mt-2 text-sm text-slate-600">
            Kelola modul, pelajaran, latihan, dan publikasi materi.
          </p>
        </div>
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah Modul
        </Button>
      </div>

      {form ? (
        <Card className="mb-6 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {form.id ? 'Edit Modul' : 'Modul Baru'}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Judul" htmlFor="module-title">
              <input
                id="module-title"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                className={inputClassName}
                placeholder="Contoh: CSS Dasar"
              />
            </Field>
            <Field label="Urutan" htmlFor="module-order">
              <input
                id="module-order"
                type="number"
                min={0}
                value={form.orderIndex}
                onChange={(event) =>
                  setForm({ ...form, orderIndex: Number(event.target.value) || 0 })
                }
                className={inputClassName}
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Deskripsi" htmlFor="module-description">
              <textarea
                id="module-description"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                rows={3}
                className={inputClassName}
                placeholder="Ringkasan singkat modul."
              />
            </Field>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) => setForm({ ...form, isPublished: event.target.checked })}
              className="h-4 w-4 accent-brand-600"
            />
            Publikasikan modul untuk mahasiswa
          </label>

          {formError ? <div className="mt-4"><Alert tone="error">{formError}</Alert></div> : null}
          {saveModule.error ? (
            <div className="mt-4"><Alert tone="error">{getErrorMessage(saveModule.error)}</Alert></div>
          ) : null}

          <div className="mt-5 flex items-center gap-3">
            <Button onClick={handleSave} disabled={saveModule.isPending}>
              {saveModule.isPending ? 'Menyimpan…' : 'Simpan Modul'}
            </Button>
            <Button variant="outline" onClick={() => setForm(null)}>
              Batal
            </Button>
          </div>
        </Card>
      ) : null}

      {deleteModule.error ? (
        <div className="mb-4"><Alert tone="error">{getErrorMessage(deleteModule.error)}</Alert></div>
      ) : null}

      {modules.length === 0 ? (
        <EmptyState
          title="Belum ada modul"
          description="Tambahkan modul pertama untuk mulai membuat materi."
          action={<Button onClick={startCreate}>Tambah Modul</Button>}
        />
      ) : (
        <div className="grid gap-4">
          {modules.map((module) => (
            <Card key={module.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">{module.title}</h2>
                    <Badge tone={module.is_published ? 'green' : 'slate'}>
                      {module.is_published ? 'Published' : 'Draft'}
                    </Badge>
                    <Badge tone="blue">Urutan {module.order_index}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{module.description}</p>
                  <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    {module.lessonCount} pelajaran
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/lecturer/modules/${module.id}`}>
                    <Button variant="outline" size="sm">
                      Kelola Pelajaran
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => startEdit(module)}>
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(module)}
                    disabled={deleteModule.isPending}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Hapus
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
