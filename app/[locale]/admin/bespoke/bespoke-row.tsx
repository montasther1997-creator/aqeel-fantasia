'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/toast';

const STATUSES = ['new', 'contacted', 'in-progress', 'closed', 'cancelled'] as const;
type Status = typeof STATUSES[number];

export function BespokeRow({ id, initialStatus, summary }: { id: string; initialStatus: string; summary: string }) {
  const [status, setStatus] = useState<Status>((STATUSES as readonly string[]).includes(initialStatus) ? (initialStatus as Status) : 'new');
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const update = async (next: Status) => {
    const prev = status;
    setStatus(next);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/bespoke/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setStatus(prev);
        toast('error', 'Update failed');
      } else {
        toast('success', 'Status updated');
        startTransition(() => router.refresh());
      }
    } catch {
      setStatus(prev);
      toast('error', 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete bespoke request for ${summary}?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/bespoke/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        toast('error', 'Delete failed');
        return;
      }
      toast('success', 'Deleted');
      startTransition(() => router.refresh());
    } catch {
      toast('error', 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => update(e.target.value as Status)}
        disabled={busy}
        className="bg-bg-elevated border border-line px-3 py-1.5 text-xs uppercase tracking-cinematic text-frost disabled:opacity-50"
      >
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <button
        onClick={remove}
        disabled={busy}
        className="text-muted hover:text-blood transition-colors p-1.5 disabled:opacity-50"
        aria-label="delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
