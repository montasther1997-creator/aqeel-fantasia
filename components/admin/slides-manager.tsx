'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from '@/components/ui/toast';
import { MediaInput } from '@/components/admin/media-input';

type Slide = {
  id: string;
  imageUrl: string;
  titleAr: string | null;
  titleEn: string | null;
  subtitleAr: string | null;
  subtitleEn: string | null;
  linkUrl: string | null;
  order: number;
  active: boolean;
};

export function SlidesManager({ initial }: { initial: Slide[] }) {
  const router = useRouter();
  const t = useTranslations('admin.slides');
  const tc = useTranslations('admin.common');
  const [creating, setCreating] = useState(false);

  const addSlide = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/admin/slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://via.placeholder.com/1920x1080.png',
          titleAr: '',
          titleEn: '',
          order: initial.length,
          active: false,
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
        <button onClick={addSlide} disabled={creating} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
          <Plus className="w-4 h-4" /> {t('addSlide')}
        </button>
      </div>

      {initial.length === 0 ? (
        <div className="ed-card text-center text-muted py-16">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('empty')}</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {initial.map((s, i) => (
            <SlideCard
              key={s.id}
              slide={s}
              canMoveUp={i > 0}
              canMoveDown={i < initial.length - 1}
              prevOrder={i > 0 ? initial[i - 1].order : null}
              nextOrder={i < initial.length - 1 ? initial[i + 1].order : null}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SlideCard({
  slide,
  canMoveUp,
  canMoveDown,
  prevOrder,
  nextOrder,
}: {
  slide: Slide;
  canMoveUp: boolean;
  canMoveDown: boolean;
  prevOrder: number | null;
  nextOrder: number | null;
}) {
  const router = useRouter();
  const t = useTranslations('admin.slides');
  const tc = useTranslations('admin.common');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [d, setD] = useState({
    imageUrl: slide.imageUrl,
    titleAr: slide.titleAr || '',
    titleEn: slide.titleEn || '',
    subtitleAr: slide.subtitleAr || '',
    subtitleEn: slide.subtitleEn || '',
    linkUrl: slide.linkUrl || '',
    active: slide.active,
  });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!d.imageUrl) { toast('error', t('imageRequired')); return; }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/slides/${slide.id}`, {
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
      const res = await fetch(`/api/admin/slides/${slide.id}`, { method: 'DELETE' });
      if (!res.ok) { toast('error', tc('deleteFailed')); return; }
      toast('success', tc('deleted'));
      router.refresh();
    } finally { setBusy(false); }
  };

  const moveBy = async (newOrder: number) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/slides/${slide.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder }),
      });
      if (res.ok) router.refresh();
    } finally { setBusy(false); }
  };

  return (
    <div className="ed-card space-y-4">
      <div className="flex items-center justify-between">
        <span className="ed-eye">— {t('slideHeading')} <span className="num">#{slide.order}</span></span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => canMoveUp && prevOrder !== null && moveBy(prevOrder - 1)}
            disabled={!canMoveUp || busy}
            className="text-muted hover:text-frost p-1 disabled:opacity-30"
            aria-label={t('moveUp')}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => canMoveDown && nextOrder !== null && moveBy(nextOrder + 1)}
            disabled={!canMoveDown || busy}
            className="text-muted hover:text-frost p-1 disabled:opacity-30"
            aria-label={t('moveDown')}
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <label className="flex items-center gap-2 text-xs text-muted cursor-pointer ms-2">
            <input type="checkbox" checked={d.active} onChange={(e) => setD({ ...d, active: e.target.checked })} />
            <span>{d.active ? tc('active') : tc('inactive')}</span>
          </label>
        </div>
      </div>

      <MediaInput
        kind="image"
        label={t('fields.image')}
        hint={t('fields.imageHint')}
        value={d.imageUrl}
        onChange={(v) => setD({ ...d, imageUrl: v })}
      />

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label={t('fields.titleAr')}>
          <input className="input" placeholder={t('placeholders.titleAr')} value={d.titleAr} onChange={(e) => setD({ ...d, titleAr: e.target.value })} />
        </Field>
        <Field label={t('fields.titleEn')}>
          <input className="input" dir="ltr" placeholder={t('placeholders.titleEn')} value={d.titleEn} onChange={(e) => setD({ ...d, titleEn: e.target.value })} />
        </Field>
        <Field label={t('fields.subtitleAr')}>
          <input className="input" placeholder={t('placeholders.subtitleAr')} value={d.subtitleAr} onChange={(e) => setD({ ...d, subtitleAr: e.target.value })} />
        </Field>
        <Field label={t('fields.subtitleEn')}>
          <input className="input" dir="ltr" placeholder={t('placeholders.subtitleEn')} value={d.subtitleEn} onChange={(e) => setD({ ...d, subtitleEn: e.target.value })} />
        </Field>
      </div>

      <Field label={t('fields.linkUrl')} hint={t('fields.linkUrlHint')}>
        <input className="input" dir="ltr" placeholder={t('placeholders.linkUrl')} value={d.linkUrl} onChange={(e) => setD({ ...d, linkUrl: e.target.value })} />
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
