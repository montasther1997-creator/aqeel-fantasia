'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2, Building2, Phone, Share2, Truck, Crown, Settings as SettingsIcon, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from '@/components/ui/toast';
import { SettingsEditor } from './settings-editor';

type Tab = 'about' | 'branches' | 'social' | 'shipping' | 'loyalty' | 'advanced';

export function SmartSettings({ items }: { items: any[] }) {
  const [tab, setTab] = useState<Tab>('about');
  const t = useTranslations('admin.smartSettings');
  const map = new Map(items.map((s) => [s.key, s.value]));

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'about', label: t('tabs.about'), icon: <Building2 className="w-4 h-4" /> },
    { id: 'branches', label: t('tabs.branches'), icon: <Phone className="w-4 h-4" /> },
    { id: 'social', label: t('tabs.social'), icon: <Share2 className="w-4 h-4" /> },
    { id: 'shipping', label: t('tabs.shipping'), icon: <Truck className="w-4 h-4" /> },
    { id: 'loyalty', label: t('tabs.loyalty'), icon: <Crown className="w-4 h-4" /> },
    { id: 'advanced', label: t('tabs.advanced'), icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-line flex flex-wrap gap-1 overflow-x-auto">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`px-4 py-2.5 text-xs tracking-cinematic uppercase border-b-2 transition-colors inline-flex items-center gap-2 whitespace-nowrap ${
              tab === tb.id ? 'border-electric text-frost' : 'border-transparent text-muted hover:text-frost'
            }`}
          >
            {tb.icon} {tb.label}
          </button>
        ))}
      </div>

      {tab === 'about' && <AboutTab map={map} />}
      {tab === 'branches' && <BranchesTab map={map} />}
      {tab === 'social' && <SocialTab map={map} />}
      {tab === 'shipping' && <ShippingTab map={map} />}
      {tab === 'loyalty' && <LoyaltyTab map={map} />}
      {tab === 'advanced' && <SettingsEditor items={items} />}
    </div>
  );
}

function useSaver(group: string) {
  const router = useRouter();
  const tc = useTranslations('admin.common');
  const [busy, setBusy] = useState(false);

  const save = async (entries: { key: string; value: string }[]) => {
    setBusy(true);
    try {
      await Promise.all(entries.map((e) =>
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: e.key, value: e.value, group }),
        })
      ));
      toast('success', tc('saved'));
      router.refresh();
    } catch {
      toast('error', tc('saveFailed'));
    } finally {
      setBusy(false);
    }
  };

  return { save, busy };
}

function AboutTab({ map }: { map: Map<string, string> }) {
  const t = useTranslations('admin.smartSettings.about');
  const tc = useTranslations('admin.common');
  const { save, busy } = useSaver('about');
  const [d, setD] = useState({
    founder_ar: map.get('about.founder_ar') || '',
    founder_en: map.get('about.founder_en') || '',
    story_ar: map.get('about.story_ar') || '',
    story_en: map.get('about.story_en') || '',
    foundedYear: map.get('about.foundedYear') || '',
    foundedCity: map.get('about.foundedCity_ar') || '',
  });

  return (
    <div className="glass p-6 space-y-5">
      <h3 className="text-xs tracking-cinematic text-muted">{t('heading')}</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t('founderAr')}>
          <input className="input" placeholder={t('placeholders.founderAr')} value={d.founder_ar} onChange={(e) => setD({ ...d, founder_ar: e.target.value })} />
        </Field>
        <Field label={t('founderEn')}>
          <input className="input" placeholder={t('placeholders.founderEn')} value={d.founder_en} onChange={(e) => setD({ ...d, founder_en: e.target.value })} />
        </Field>
      </div>
      <Field label={t('storyAr')}>
        <textarea className="input min-h-[100px]" placeholder={t('placeholders.storyAr')} value={d.story_ar} onChange={(e) => setD({ ...d, story_ar: e.target.value })} />
      </Field>
      <Field label={t('storyEn')}>
        <textarea className="input min-h-[100px]" placeholder={t('placeholders.storyEn')} value={d.story_en} onChange={(e) => setD({ ...d, story_en: e.target.value })} />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t('foundedYear')}>
          <input className="input num" value={d.foundedYear} onChange={(e) => setD({ ...d, foundedYear: e.target.value })} placeholder={t('placeholders.foundedYear')} />
        </Field>
        <Field label={t('foundedCity')}>
          <input className="input" value={d.foundedCity} onChange={(e) => setD({ ...d, foundedCity: e.target.value })} placeholder={t('foundedCityPlaceholder')} />
        </Field>
      </div>
      <button
        onClick={() => save([
          { key: 'about.founder_ar', value: d.founder_ar },
          { key: 'about.founder_en', value: d.founder_en },
          { key: 'about.story_ar', value: d.story_ar },
          { key: 'about.story_en', value: d.story_en },
          { key: 'about.foundedYear', value: d.foundedYear },
          { key: 'about.foundedCity_ar', value: d.foundedCity },
        ])}
        disabled={busy}
        className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
      >
        <Save className="w-4 h-4" /> {tc('save')}
      </button>
    </div>
  );
}

type Branch = { addressAr: string; addressEn: string; phone: string; hours: string };

function readBranches(map: Map<string, string>): Branch[] {
  const indices = new Set<number>();
  for (const k of map.keys()) {
    const m = k.match(/^branch\.(\d+)\./);
    if (m) indices.add(+m[1]);
  }
  const sorted = Array.from(indices).sort((a, b) => a - b);
  return sorted.map((i) => ({
    addressAr: map.get(`branch.${i}.address_ar`) || '',
    addressEn: map.get(`branch.${i}.address_en`) || '',
    phone: map.get(`branch.${i}.phone`) || '',
    hours: map.get(`branch.${i}.hours`) || '',
  }));
}

function BranchesTab({ map }: { map: Map<string, string> }) {
  const t = useTranslations('admin.smartSettings.branches');
  const tc = useTranslations('admin.common');
  const { save, busy } = useSaver('branches');
  const [branches, setBranches] = useState<Branch[]>(() => {
    const r = readBranches(map);
    return r.length > 0 ? r : [{ addressAr: '', addressEn: '', phone: '', hours: '' }];
  });

  const update = (i: number, patch: Partial<Branch>) => {
    setBranches(branches.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  };

  const remove = (i: number) => {
    if (!confirm(t('confirmRemove'))) return;
    setBranches(branches.filter((_, idx) => idx !== i));
  };

  const persist = () => {
    const entries: { key: string; value: string }[] = [];
    branches.forEach((b, i) => {
      const idx = i + 1;
      entries.push({ key: `branch.${idx}.address_ar`, value: b.addressAr });
      entries.push({ key: `branch.${idx}.address_en`, value: b.addressEn });
      entries.push({ key: `branch.${idx}.phone`, value: b.phone });
      entries.push({ key: `branch.${idx}.hours`, value: b.hours });
    });
    save(entries);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs tracking-cinematic text-muted">{t('heading')}</h3>
        <button onClick={() => setBranches([...branches, { addressAr: '', addressEn: '', phone: '', hours: '' }])} className="btn-ghost inline-flex items-center gap-2 text-xs">
          <Plus className="w-4 h-4" /> {t('addBranch')}
        </button>
      </div>

      {branches.map((b, i) => (
        <div key={i} className="glass p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted">{t('branchN', { n: i + 1 })}</p>
            {branches.length > 1 && (
              <button onClick={() => remove(i)} className="text-muted hover:text-blood">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label={t('addressAr')}>
              <input className="input" placeholder={t('placeholders.addressAr')} value={b.addressAr} onChange={(e) => update(i, { addressAr: e.target.value })} />
            </Field>
            <Field label={t('addressEn')}>
              <input className="input" placeholder={t('placeholders.addressEn')} value={b.addressEn} onChange={(e) => update(i, { addressEn: e.target.value })} />
            </Field>
            <Field label={t('phone')}>
              <input className="input num font-mono" value={b.phone} onChange={(e) => update(i, { phone: e.target.value })} placeholder={t('placeholders.phone')} dir="ltr" />
            </Field>
            <Field label={t('hours')}>
              <input className="input" value={b.hours} onChange={(e) => update(i, { hours: e.target.value })} placeholder={t('hoursPlaceholder')} />
            </Field>
          </div>
        </div>
      ))}

      <button onClick={persist} disabled={busy} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
        <Save className="w-4 h-4" /> {tc('save')}
      </button>
    </div>
  );
}

function SocialTab({ map }: { map: Map<string, string> }) {
  const t = useTranslations('admin.smartSettings.social');
  const tc = useTranslations('admin.common');
  const { save, busy } = useSaver('social');
  const [d, setD] = useState({
    instagram: map.get('social.instagram') || '',
    whatsapp: map.get('social.whatsapp') || '',
    tiktok: map.get('social.tiktok') || '',
    email: map.get('social.email') || '',
    twitter: map.get('social.twitter') || '',
  });

  return (
    <div className="glass p-6 space-y-4">
      <h3 className="text-xs tracking-cinematic text-muted">{t('heading')}</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t('instagram')} hint={t('instagramHint')}>
          <input className="input font-mono" dir="ltr" value={d.instagram} onChange={(e) => setD({ ...d, instagram: e.target.value })} placeholder="@shopfantasia1" />
        </Field>
        <Field label={t('whatsapp')} hint={t('whatsappHint')}>
          <input className="input font-mono" dir="ltr" value={d.whatsapp} onChange={(e) => setD({ ...d, whatsapp: e.target.value })} placeholder="+9647700000000" />
        </Field>
        <Field label={t('tiktok')}>
          <input className="input font-mono" dir="ltr" value={d.tiktok} onChange={(e) => setD({ ...d, tiktok: e.target.value })} placeholder="@..." />
        </Field>
        <Field label={t('email')}>
          <input className="input font-mono" dir="ltr" value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} placeholder="contact@aqeelfantasia.com" />
        </Field>
        <Field label={t('twitter')}>
          <input className="input font-mono" dir="ltr" value={d.twitter} onChange={(e) => setD({ ...d, twitter: e.target.value })} placeholder="@..." />
        </Field>
      </div>
      <button onClick={() => save([
        { key: 'social.instagram', value: d.instagram },
        { key: 'social.whatsapp', value: d.whatsapp },
        { key: 'social.tiktok', value: d.tiktok },
        { key: 'social.email', value: d.email },
        { key: 'social.twitter', value: d.twitter },
      ])} disabled={busy} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
        <Save className="w-4 h-4" /> {tc('save')}
      </button>
    </div>
  );
}

function ShippingTab({ map }: { map: Map<string, string> }) {
  const t = useTranslations('admin.smartSettings.shipping');
  const tc = useTranslations('admin.common');
  const { save, busy } = useSaver('shipping');
  const [free, setFree] = useState(map.get('shipping.freeThresholdIQD') || '0');
  const [cod, setCod] = useState(map.get('shipping.codFeeIQD') || '0');

  return (
    <div className="glass p-6 space-y-4">
      <h3 className="text-xs tracking-cinematic text-muted">{t('heading')}</h3>
      <p className="text-sm text-muted">{t('hint')}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t('freeThreshold')} hint={t('freeThresholdHint')}>
          <div className="flex items-center gap-2">
            <input type="number" min={0} placeholder={t('placeholders.freeThreshold')} className="input num flex-1" value={free} onChange={(e) => setFree(e.target.value)} />
            <span className="text-xs text-muted">د.ع</span>
          </div>
        </Field>
        <Field label={t('codFee')} hint={t('codFeeHint')}>
          <div className="flex items-center gap-2">
            <input type="number" min={0} placeholder={t('placeholders.codFee')} className="input num flex-1" value={cod} onChange={(e) => setCod(e.target.value)} />
            <span className="text-xs text-muted">د.ع</span>
          </div>
        </Field>
      </div>
      <button onClick={() => save([
        { key: 'shipping.freeThresholdIQD', value: free },
        { key: 'shipping.codFeeIQD', value: cod },
      ])} disabled={busy} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
        <Save className="w-4 h-4" /> {tc('save')}
      </button>
    </div>
  );
}

function LoyaltyTab({ map }: { map: Map<string, string> }) {
  const t = useTranslations('admin.smartSettings.loyalty');
  const tc = useTranslations('admin.common');
  const { save, busy } = useSaver('loyalty');
  const [iqdPer, setIqdPer] = useState(map.get('loyalty.iqdPerPoint') || '1000');
  const [usdPer, setUsdPer] = useState(map.get('loyalty.pointsPerUSD') || '1');

  return (
    <div className="glass p-6 space-y-4">
      <h3 className="text-xs tracking-cinematic text-muted inline-flex items-center gap-2">
        <Sparkles className="w-3 h-3" /> {t('heading')}
      </h3>
      <p className="text-sm text-muted">{t('hint')}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={t('iqdPerPoint')} hint={t('iqdPerPointHint')}>
          <div className="flex items-center gap-2">
            <input type="number" min={1} placeholder={t('placeholders.iqdPerPoint')} className="input num flex-1" value={iqdPer} onChange={(e) => setIqdPer(e.target.value)} />
            <span className="text-xs text-muted">د.ع = 1</span>
          </div>
        </Field>
        <Field label={t('pointsPerUSD')} hint={t('pointsPerUSDHint')}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">1 USD =</span>
            <input type="number" min={0} step={0.1} placeholder={t('placeholders.pointsPerUSD')} className="input num flex-1" value={usdPer} onChange={(e) => setUsdPer(e.target.value)} />
          </div>
        </Field>
      </div>
      <p className="text-xs text-muted">{t('tierHint')}</p>
      <button onClick={() => save([
        { key: 'loyalty.iqdPerPoint', value: iqdPer },
        { key: 'loyalty.pointsPerUSD', value: usdPer },
      ])} disabled={busy} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
        <Save className="w-4 h-4" /> {tc('save')}
      </button>
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
