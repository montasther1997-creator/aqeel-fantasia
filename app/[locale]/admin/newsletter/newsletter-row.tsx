'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { useTranslations } from 'next-intl';

export function NewsletterRow({ id, initialActive }: { id: string; initialActive: boolean }) {
  const t = useTranslations('admin');
  const tn = useTranslations('admin.newsletter');
  const [active, setActive] = useState(initialActive);
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const toggle = async () => {
    const next = !active;
    setActive(next);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/newsletter/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: next }),
      });
      if (!res.ok) { setActive(!next); toast('error', t('common.updateFailed')); return; }
      toast('success', next ? t('common.activated') : t('common.deactivated'));
      startTransition(() => router.refresh());
    } catch {
      setActive(!next);
      toast('error', t('common.updateFailed'));
    } finally { setBusy(false); }
  };

  const remove = async () => {
    if (!confirm(tn('confirmDelete'))) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/newsletter/${id}`, { method: 'DELETE' });
      if (!res.ok) { toast('error', t('common.deleteFailed')); return; }
      toast('success', t('common.deleted'));
      startTransition(() => router.refresh());
    } catch {
      toast('error', t('common.deleteFailed'));
    } finally { setBusy(false); }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggle}
        disabled={busy}
        className={`text-[10px] uppercase tracking-cinematic px-2 py-1 border transition-colors disabled:opacity-50 ${active ? 'border-electric text-electric' : 'border-line text-muted hover:text-frost'}`}
      >
        {active ? tn('active') : tn('inactive')}
      </button>
      <button onClick={remove} disabled={busy} className="text-muted hover:text-blood transition-colors p-1 disabled:opacity-50" aria-label={t('common.delete')}>
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
