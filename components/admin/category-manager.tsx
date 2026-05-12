'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, FolderTree } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from '@/components/ui/toast';
import { MediaInput } from '@/components/admin/media-input';

type Cat = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  image: string | null;
  active: boolean;
  order: number;
};

export function CategoryManager({ initial }: { initial: Cat[] }) {
  const router = useRouter();
  const t = useTranslations('admin.categories');
  const tc = useTranslations('admin.common');
  const [creating, setCreating] = useState(false);

  const addCategory = async () => {
    setCreating(true);
    try {
      const slug = `category-${Date.now()}`;
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          nameAr: 'فئة جديدة',
          nameEn: 'New category',
          order: initial.length,
          active: true,
        }),
      });
      if (!res.ok) { toast('error', tc('createFailed')); return; }
      toast('success', tc('created'));
      router.refresh();
    } finally { setCreating(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <p className="text-sm text-muted max-w-2xl">{t('intro')}</p>
        <button onClick={addCategory} disabled={creating} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
          <Plus className="w-4 h-4" /> {t('addCategory')}
        </button>
      </div>

      {initial.length === 0 ? (
        <div className="ed-card text-center text-muted py-16">
          <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('empty')}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {initial.map((c) => <CategoryCard key={c.id} c={c} />)}
        </div>
      )}
    </div>
  );
}

function CategoryCard({ c }: { c: Cat }) {
  const router = useRouter();
  const t = useTranslations('admin.categories');
  const tc = useTranslations('admin.common');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [d, setD] = useState({
    slug: c.slug,
    nameAr: c.nameAr,
    nameEn: c.nameEn,
    image: c.image || '',
    active: c.active,
  });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/categories/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d),
      });
      if (!res.ok) { toast('error', tc('updateFailed')); return; }
      toast('success', tc('saved'));
      router.refresh();
    } finally { setBusy(false); }
  };

  const del = async () => {
    if (!confirm(t('confirmDelete'))) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/categories/${c.id}`, { method: 'DELETE' });
      if (!res.ok) { toast('error', tc('deleteFailed')); return; }
      toast('success', tc('deleted'));
      router.refresh();
    } finally { setBusy(false); }
  };

  return (
    <div className="ed-card space-y-4">
      <div className="flex items-center justify-between">
        <span className="ed-eye">— {isAr ? d.nameAr : d.nameEn}</span>
        <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
          <input type="checkbox" checked={d.active} onChange={(e) => setD({ ...d, active: e.target.checked })} />
          <span>{d.active ? tc('active') : tc('inactive')}</span>
        </label>
      </div>

      <MediaInput
        kind="image"
        label={t('fields.image')}
        hint={t('fields.imageHint')}
        value={d.image}
        onChange={(v) => setD({ ...d, image: v })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Field label={t('fields.nameAr')}>
          <input className="input" placeholder={t('placeholders.nameAr')} value={d.nameAr} onChange={(e) => setD({ ...d, nameAr: e.target.value })} />
        </Field>
        <Field label={t('fields.nameEn')}>
          <input className="input" dir="ltr" placeholder={t('placeholders.nameEn')} value={d.nameEn} onChange={(e) => setD({ ...d, nameEn: e.target.value })} />
        </Field>
      </div>
      <Field label={t('fields.slug')} hint={t('fields.slugHint')}>
        <input className="input font-mono text-xs" dir="ltr" placeholder={t('placeholders.slug')} value={d.slug} onChange={(e) => setD({ ...d, slug: e.target.value })} />
      </Field>

      <div className="border-t border-line pt-4 flex gap-2">
        <button onClick={save} disabled={busy} className="btn-primary flex-1 inline-flex items-center justify-center gap-2 disabled:opacity-50">
          <Save className="w-4 h-4" /> {tc('save')}
        </button>
        <button onClick={del} disabled={busy} className="text-muted hover:text-blood transition-colors p-2 disabled:opacity-50" aria-label={tc('delete')}>
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] tracking-cinematic text-muted block">{label}</span>
      {children}
      {hint && <span className="text-[10px] text-muted block opacity-70 mt-1">{hint}</span>}
    </label>
  );
}
