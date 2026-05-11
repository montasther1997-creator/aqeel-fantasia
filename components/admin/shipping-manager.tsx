'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, Truck, Settings, MapPin } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from '@/components/ui/toast';

type Zone = {
  id: string;
  nameAr: string;
  nameEn: string;
  governorates: string;
  priceIQD: number;
  priceUSD: number;
  etaDays: string | null;
  active: boolean;
};

type SettingsBag = {
  freeThresholdIQD: number;
  codFeeIQD: number;
};

export function ShippingManager({ initial, settings }: { initial: Zone[]; settings: SettingsBag }) {
  const router = useRouter();
  const t = useTranslations('admin.shipping');
  const tc = useTranslations('admin.common');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [creating, setCreating] = useState(false);

  const addZone = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameAr: isAr ? 'منطقة جديدة' : 'New zone',
          nameEn: 'New zone',
          governorates: '[]',
          priceIQD: 5000,
          priceUSD: 5,
          etaDays: '2-4',
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
      <div className="flex items-start justify-between flex-wrap gap-3">
        <p className="text-sm text-muted max-w-2xl">{t('intro')}</p>
        <button onClick={addZone} disabled={creating} className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t('addZone')}
        </button>
      </div>

      <GeneralSettings initial={settings} />

      {initial.length === 0 ? (
        <div className="glass p-12 text-center text-muted">
          <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('emptyZones')}</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {initial.map((z) => <ZoneCard key={z.id} z={z} />)}
        </div>
      )}
    </div>
  );
}

function GeneralSettings({ initial }: { initial: SettingsBag }) {
  const router = useRouter();
  const t = useTranslations('admin.shipping');
  const tc = useTranslations('admin.common');
  const [free, setFree] = useState(initial.freeThresholdIQD);
  const [cod, setCod] = useState(initial.codFeeIQD);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await Promise.all([
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'shipping.freeThresholdIQD', value: String(free), group: 'shipping' }),
        }),
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'shipping.codFeeIQD', value: String(cod), group: 'shipping' }),
        }),
      ]);
      toast('success', tc('saved'));
      router.refresh();
    } catch {
      toast('error', tc('saveFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass p-5 space-y-4">
      <h3 className="text-xs tracking-cinematic text-muted inline-flex items-center gap-2">
        <Settings className="w-3 h-3" /> {t('generalSettings')}
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t('fields.freeThreshold')} hint={t('fields.freeThresholdHint')}>
          <div className="flex items-center gap-2">
            <input type="number" min={0} className="input num flex-1" value={free} onChange={(e) => setFree(Math.max(0, +e.target.value || 0))} />
            <span className="text-xs text-muted">د.ع</span>
          </div>
        </Field>
        <Field label={t('fields.codFee')} hint={t('fields.codFeeHint')}>
          <div className="flex items-center gap-2">
            <input type="number" min={0} className="input num flex-1" value={cod} onChange={(e) => setCod(Math.max(0, +e.target.value || 0))} />
            <span className="text-xs text-muted">د.ع</span>
          </div>
        </Field>
      </div>
      <button onClick={save} disabled={busy} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
        <Save className="w-4 h-4" /> {tc('save')}
      </button>
    </div>
  );
}

function ZoneCard({ z }: { z: Zone }) {
  const router = useRouter();
  const t = useTranslations('admin.shipping');
  const tc = useTranslations('admin.common');
  let initialGovs = '';
  try { initialGovs = (JSON.parse(z.governorates) as string[]).join(', '); } catch {}
  const [d, setD] = useState({
    nameAr: z.nameAr,
    nameEn: z.nameEn,
    governorates: initialGovs,
    priceIQD: z.priceIQD,
    priceUSD: z.priceUSD,
    etaDays: z.etaDays || '',
    active: z.active,
  });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const govs = JSON.stringify(d.governorates.split(',').map((g) => g.trim()).filter(Boolean));
      const res = await fetch(`/api/admin/shipping/${z.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...d, governorates: govs }),
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
      const res = await fetch(`/api/admin/shipping/${z.id}`, { method: 'DELETE' });
      if (!res.ok) { toast('error', tc('deleteFailed')); return; }
      toast('success', tc('deleted'));
      router.refresh();
    } finally { setBusy(false); }
  };

  return (
    <div className="glass p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <MapPin className="w-4 h-4 text-electric" />
          <span className="font-medium">{d.nameAr || d.nameEn}</span>
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
      </div>

      <Field label={t('fields.governorates')} hint={t('fields.governoratesHint')}>
        <textarea
          className="input min-h-[60px]"
          value={d.governorates}
          onChange={(e) => setD({ ...d, governorates: e.target.value })}
          placeholder={t('fields.governoratesPlaceholder')}
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label={t('fields.priceIQD')}>
          <input type="number" min={0} className="input num" value={d.priceIQD} onChange={(e) => setD({ ...d, priceIQD: Math.max(0, +e.target.value || 0) })} />
        </Field>
        <Field label={t('fields.priceUSD')}>
          <input type="number" min={0} step={0.5} className="input num" value={d.priceUSD} onChange={(e) => setD({ ...d, priceUSD: Math.max(0, +e.target.value || 0) })} />
        </Field>
        <Field label={t('fields.eta')} hint={t('fields.etaHint')}>
          <input className="input num" value={d.etaDays} onChange={(e) => setD({ ...d, etaDays: e.target.value })} placeholder="2-4" />
        </Field>
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
