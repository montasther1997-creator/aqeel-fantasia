'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, Crown, Sparkles, Truck, Percent, Clock } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from '@/components/ui/toast';

type Tier = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  pointsThreshold: number;
  multiplier: number;
  freeShipping: boolean;
  discountPct: number;
  earlyAccess: boolean;
  perks: string;
  color: string | null;
  order: number;
  active: boolean;
};

export function CultManager({ tiers, members }: { tiers: Tier[]; members: any[] }) {
  const router = useRouter();
  const t = useTranslations('admin.cult');
  const tc = useTranslations('admin.common');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [creating, setCreating] = useState(false);

  const addTier = async () => {
    setCreating(true);
    try {
      const slug = `tier-${Date.now()}`;
      const res = await fetch('/api/admin/cult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          nameAr: isAr ? 'مستوى جديد' : 'New Tier',
          nameEn: 'New Tier',
          pointsThreshold: 0,
          multiplier: 1.0,
          freeShipping: false,
          discountPct: 0,
          earlyAccess: false,
          perks: '[]',
          color: '#C9A961',
          order: tiers.length,
          active: true,
        }),
      });
      if (!res.ok) { toast('error', tc('createFailed')); return; }
      toast('success', tc('created'));
      router.refresh();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-muted max-w-xl">{t('intro')}</p>
        <button onClick={addTier} disabled={creating} className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t('addTier')}
        </button>
      </div>

      {tiers.length === 0 ? (
        <div className="glass p-12 text-center text-muted">
          <Crown className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('emptyTiers')}</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {tiers.map((tier) => <TierCard key={tier.id} tier={tier} />)}
        </div>
      )}

      <div className="glass p-6">
        <h3 className="text-xs tracking-cinematic text-muted mb-4">— {t('membersHeading')} ({members.length})</h3>
        {members.length === 0 ? (
          <p className="text-muted text-sm">{t('noMembers')}</p>
        ) : (
          <div className="divide-y divide-line">
            {members.map((m) => (
              <div key={m.id} className="flex justify-between py-3 text-sm">
                <div>
                  <p>{m.customer.name}</p>
                  <p className="text-xs text-muted font-mono">{m.customer.phone}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs tracking-cinematic uppercase text-electric">
                    {isAr ? m.tier.nameAr : m.tier.nameEn}
                  </span>
                  <p className="text-xs text-muted mt-1 num">{m.customer.loyaltyPts ?? 0} {t('points')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TierCard({ tier }: { tier: Tier }) {
  const router = useRouter();
  const t = useTranslations('admin.cult');
  const tc = useTranslations('admin.common');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const [d, setD] = useState({
    slug: tier.slug,
    nameAr: tier.nameAr,
    nameEn: tier.nameEn,
    pointsThreshold: tier.pointsThreshold,
    multiplier: tier.multiplier,
    freeShipping: tier.freeShipping,
    discountPct: tier.discountPct,
    earlyAccess: tier.earlyAccess,
    color: tier.color || '#C9A961',
    active: tier.active,
  });
  const [perksList, setPerksList] = useState<string[]>(() => {
    try { const a = JSON.parse(tier.perks); return Array.isArray(a) ? a : []; }
    catch { return tier.perks ? tier.perks.split(',').map((p) => p.trim()).filter(Boolean) : []; }
  });
  const [newPerk, setNewPerk] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/cult/${tier.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...d, perks: JSON.stringify(perksList) }),
      });
      if (!res.ok) { toast('error', tc('updateFailed')); return; }
      toast('success', tc('saved'));
      router.refresh();
    } catch {
      toast('error', tc('updateFailed'));
    } finally {
      setBusy(false);
    }
  };

  const del = async () => {
    if (!confirm(t('confirmDelete'))) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/cult/${tier.id}`, { method: 'DELETE' });
      if (!res.ok) { toast('error', tc('deleteFailed')); return; }
      toast('success', tc('deleted'));
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const addPerk = () => {
    const v = newPerk.trim();
    if (!v) return;
    setPerksList([...perksList, v]);
    setNewPerk('');
  };

  return (
    <div className="glass p-5 space-y-4" style={{ borderTop: `3px solid ${d.color}` }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4" style={{ color: d.color }} />
          <span className="font-medium" style={{ color: d.color }}>{isAr ? d.nameAr : d.nameEn}</span>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
          <input type="checkbox" checked={d.active} onChange={(e) => setD({ ...d, active: e.target.checked })} />
          <span>{d.active ? tc('active') : tc('inactive')}</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t('fields.nameAr')}>
          <input className="input" value={d.nameAr} onChange={(e) => setD({ ...d, nameAr: e.target.value })} />
        </Field>
        <Field label={t('fields.nameEn')}>
          <input className="input" value={d.nameEn} onChange={(e) => setD({ ...d, nameEn: e.target.value })} />
        </Field>
        <Field label={t('fields.slug')} hint={t('fields.slugHint')}>
          <input className="input font-mono text-xs" value={d.slug} onChange={(e) => setD({ ...d, slug: e.target.value })} />
        </Field>
        <Field label={t('fields.color')}>
          <div className="flex gap-2">
            <input type="color" className="w-12 h-10 bg-bg-secondary border border-line cursor-pointer" value={d.color} onChange={(e) => setD({ ...d, color: e.target.value })} />
            <input className="input flex-1 font-mono text-xs" value={d.color} onChange={(e) => setD({ ...d, color: e.target.value })} />
          </div>
        </Field>
      </div>

      <div className="border-t border-line pt-4">
        <h4 className="text-[10px] tracking-cinematic text-muted mb-3 inline-flex items-center gap-2">
          <Sparkles className="w-3 h-3" /> {t('sections.scoring')}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('fields.pointsThreshold')} hint={t('fields.pointsThresholdHint')}>
            <input type="number" min={0} className="input num" value={d.pointsThreshold} onChange={(e) => setD({ ...d, pointsThreshold: Math.max(0, +e.target.value || 0) })} />
          </Field>
          <Field label={t('fields.multiplier')} hint={t('fields.multiplierHint')}>
            <input type="number" min={0} step={0.05} className="input num" value={d.multiplier} onChange={(e) => setD({ ...d, multiplier: Math.max(0, +e.target.value || 1) })} />
          </Field>
        </div>
      </div>

      <div className="border-t border-line pt-4">
        <h4 className="text-[10px] tracking-cinematic text-muted mb-3">{t('sections.perks')}</h4>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Toggle
            icon={<Truck className="w-3 h-3" />}
            label={t('fields.freeShipping')}
            value={d.freeShipping}
            onChange={(v) => setD({ ...d, freeShipping: v })}
          />
          <Toggle
            icon={<Clock className="w-3 h-3" />}
            label={t('fields.earlyAccess')}
            value={d.earlyAccess}
            onChange={(v) => setD({ ...d, earlyAccess: v })}
          />
          <Field label={t('fields.discountPct')}>
            <div className="flex items-center gap-1">
              <input type="number" min={0} max={100} className="input num" value={d.discountPct} onChange={(e) => setD({ ...d, discountPct: Math.max(0, Math.min(100, +e.target.value || 0)) })} />
              <Percent className="w-3 h-3 text-muted" />
            </div>
          </Field>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] tracking-cinematic text-muted block">{t('fields.customPerks')}</label>
          {perksList.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {perksList.map((p, i) => (
                <span key={i} className="inline-flex items-center gap-2 bg-bg-elevated border border-line px-2 py-1 text-xs">
                  {p}
                  <button onClick={() => setPerksList(perksList.filter((_, j) => j !== i))} className="text-muted hover:text-blood">×</button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              className="input flex-1 text-xs"
              placeholder={t('fields.customPerksPlaceholder')}
              value={newPerk}
              onChange={(e) => setNewPerk(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPerk(); } }}
            />
            <button onClick={addPerk} className="btn-ghost text-xs">{tc('add')}</button>
          </div>
        </div>
      </div>

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

function Toggle({ icon, label, value, onChange }: { icon: React.ReactNode; label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex flex-col items-center justify-center gap-1 px-2 py-2 border transition-colors text-[10px] ${value ? 'border-electric text-electric bg-electric/10' : 'border-line text-muted hover:text-frost'}`}
    >
      {icon}
      <span className="text-center leading-tight">{label}</span>
    </button>
  );
}
