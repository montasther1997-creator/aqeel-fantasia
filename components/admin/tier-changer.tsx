'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Save, History } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from '@/components/ui/toast';

type Tier = { id: string; slug: string; nameAr: string; nameEn: string; color: string | null };
type HistoryEntry = {
  id: string;
  tierId: string | null;
  previousTier: string | null;
  reason: string;
  pointsAtChange: number;
  createdAt: string;
  tier: { nameAr: string; nameEn: string } | null;
};

export function TierChanger({
  customerId,
  currentTierId,
  tiers,
  history,
}: {
  customerId: string;
  currentTierId: string | null;
  tiers: Tier[];
  history: HistoryEntry[];
}) {
  const router = useRouter();
  const t = useTranslations('admin.tierChanger');
  const tc = useTranslations('admin.common');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [selected, setSelected] = useState<string>(currentTierId || '');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const apply = async () => {
    if (selected === (currentTierId || '')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}/tier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId: selected || null, reason: reason.trim() || 'manual' }),
      });
      if (!res.ok) { toast('error', tc('updateFailed')); return; }
      toast('success', t('updated'));
      setReason('');
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs tracking-cinematic text-muted inline-flex items-center gap-2">
          <Crown className="w-3 h-3" /> {t('title')}
        </h3>
        <button
          type="button"
          onClick={() => setShowHistory((s) => !s)}
          className="text-[10px] tracking-cinematic text-muted hover:text-frost inline-flex items-center gap-1"
        >
          <History className="w-3 h-3" />
          {showHistory ? t('hideHistory') : t('showHistory')}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] tracking-cinematic text-muted block mb-1">{t('newTier')}</label>
          <select className="input" value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">— {t('none')} —</option>
            {tiers.map((tr) => (
              <option key={tr.id} value={tr.id}>{isAr ? tr.nameAr : tr.nameEn}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] tracking-cinematic text-muted block mb-1">{t('reason')}</label>
          <input
            className="input"
            placeholder={t('reasonPlaceholder')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={apply}
        disabled={busy || selected === (currentTierId || '')}
        className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
      >
        <Save className="w-4 h-4" /> {t('apply')}
      </button>

      {showHistory && (
        <div className="border-t border-line pt-4">
          <h4 className="text-[10px] tracking-cinematic text-muted mb-3">{t('historyHeading')}</h4>
          {history.length === 0 ? (
            <p className="text-muted text-sm">{t('noHistory')}</p>
          ) : (
            <div className="divide-y divide-line">
              {history.map((h) => (
                <div key={h.id} className="py-2 flex justify-between items-start text-sm gap-3">
                  <div className="min-w-0">
                    <p className="text-xs">
                      <span className="text-muted">{h.previousTier || '—'}</span>
                      <span className="mx-2">→</span>
                      <span className="text-electric">
                        {h.tier ? (isAr ? h.tier.nameAr : h.tier.nameEn) : t('none')}
                      </span>
                    </p>
                    <p className="text-[10px] text-muted mt-1">{h.reason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted font-mono">{new Date(h.createdAt).toLocaleString()}</p>
                    <p className="text-[10px] text-muted num">{h.pointsAtChange} {t('points')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
