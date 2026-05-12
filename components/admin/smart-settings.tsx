'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2, Building2, Phone, Share2, Truck, Crown, Settings as SettingsIcon, Sparkles, Palette } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from '@/components/ui/toast';
import { SettingsEditor } from './settings-editor';

type Tab = 'about' | 'branches' | 'social' | 'shipping' | 'loyalty' | 'experience' | 'advanced';

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
    { id: 'experience', label: t('tabs.experience'), icon: <Palette className="w-4 h-4" /> },
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
      {tab === 'experience' && <ExperienceTab map={map} />}
      {tab === 'advanced' && <SettingsEditor items={items} />}
    </div>
  );
}

function ExperienceTab({ map }: { map: Map<string, string> }) {
  const t = useTranslations('admin.smartSettings.experience');
  const tc = useTranslations('admin.common');
  const { save, busy } = useSaver('appearance');
  const [d, setD] = useState({
    introEnabled: map.get('intro.enabled') !== '0',
    introDuration: map.get('intro.durationSeconds') || '4',
    bgEnabled: map.get('appearance.background.enabled') !== '0',
    bgType: map.get('appearance.background.type') || 'motes',
    bgIntensity: map.get('appearance.background.intensity') || '0.5',
    nav3dEnabled: map.get('appearance.topNav3d.enabled') !== '0',
    nav3dIntensity: map.get('appearance.topNav3d.intensity') || '0.5',
    naEnabled: map.get('newArrivals.enabled') !== '0',
    naAr: map.get('newArrivals.heading_ar') || 'جديد الدار',
    naEn: map.get('newArrivals.heading_en') || 'Latest Arrivals',
    naCount: map.get('newArrivals.autoCount') || '8',
  });

  const persist = () => save([
    { key: 'intro.enabled', value: d.introEnabled ? '1' : '0' },
    { key: 'intro.durationSeconds', value: d.introDuration },
    { key: 'appearance.background.enabled', value: d.bgEnabled ? '1' : '0' },
    { key: 'appearance.background.type', value: d.bgType },
    { key: 'appearance.background.intensity', value: d.bgIntensity },
    { key: 'appearance.topNav3d.enabled', value: d.nav3dEnabled ? '1' : '0' },
    { key: 'appearance.topNav3d.intensity', value: d.nav3dIntensity },
    { key: 'newArrivals.enabled', value: d.naEnabled ? '1' : '0' },
    { key: 'newArrivals.heading_ar', value: d.naAr },
    { key: 'newArrivals.heading_en', value: d.naEn },
    { key: 'newArrivals.autoCount', value: d.naCount },
  ]);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="glass p-6 space-y-4">
        <h3 className="text-xs tracking-cinematic text-muted">{t('intro.heading')}</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <ExpToggle label={t('intro.enabledLabel')} value={d.introEnabled} onChange={(v) => setD({ ...d, introEnabled: v })} />
          <Field label={t('intro.durationLabel')} hint={t('intro.durationHint')}>
            <div className="flex items-center gap-2">
              <input type="number" min={2} max={10} step={0.5} className="input num flex-1" value={d.introDuration} onChange={(e) => setD({ ...d, introDuration: e.target.value })} />
              <span className="text-xs text-muted">{t('intro.seconds')}</span>
            </div>
          </Field>
        </div>
      </div>

      {/* Background */}
      <div className="glass p-6 space-y-4">
        <h3 className="text-xs tracking-cinematic text-muted">{t('background.heading')}</h3>
        <p className="text-sm text-muted">{t('background.hint')}</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <ExpToggle label={t('background.enabledLabel')} value={d.bgEnabled} onChange={(v) => setD({ ...d, bgEnabled: v })} />
          <Field label={t('background.typeLabel')}>
            <select className="input" value={d.bgType} onChange={(e) => setD({ ...d, bgType: e.target.value })}>
              <option value="rich">{t('background.types.rich')}</option>
              <option value="fabric">{t('background.types.fabric')}</option>
              <option value="motes">{t('background.types.motes')}</option>
              <option value="lines">{t('background.types.lines')}</option>
              <option value="off">{t('background.types.off')}</option>
            </select>
          </Field>
          <Field label={t('background.intensityLabel')}>
            <div className="space-y-1">
              <input type="range" min={0} max={1} step={0.05} className="w-full accent-electric" value={d.bgIntensity} onChange={(e) => setD({ ...d, bgIntensity: e.target.value })} />
              <p className="text-[10px] text-muted num text-center">{d.bgIntensity}</p>
            </div>
          </Field>
        </div>
      </div>

      {/* Top Nav 3D */}
      <div className="glass p-6 space-y-4">
        <h3 className="text-xs tracking-cinematic text-muted">{t('topNav.heading')}</h3>
        <p className="text-sm text-muted">{t('topNav.hint')}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <ExpToggle label={t('topNav.enabledLabel')} value={d.nav3dEnabled} onChange={(v) => setD({ ...d, nav3dEnabled: v })} />
          <Field label={t('topNav.intensityLabel')}>
            <div className="space-y-1">
              <input type="range" min={0} max={1} step={0.05} className="w-full accent-electric" value={d.nav3dIntensity} onChange={(e) => setD({ ...d, nav3dIntensity: e.target.value })} />
              <p className="text-[10px] text-muted num text-center">{d.nav3dIntensity}</p>
            </div>
          </Field>
        </div>
      </div>

      {/* New Arrivals */}
      <div className="glass p-6 space-y-4">
        <h3 className="text-xs tracking-cinematic text-muted">{t('newArrivals.heading')}</h3>
        <p className="text-sm text-muted">{t('newArrivals.hint')}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <ExpToggle label={t('newArrivals.enabledLabel')} value={d.naEnabled} onChange={(v) => setD({ ...d, naEnabled: v })} />
          <Field label={t('newArrivals.countLabel')} hint={t('newArrivals.countHint')}>
            <input type="number" min={4} max={20} className="input num" value={d.naCount} onChange={(e) => setD({ ...d, naCount: e.target.value })} />
          </Field>
          <Field label={t('newArrivals.headingArLabel')}>
            <input className="input" value={d.naAr} onChange={(e) => setD({ ...d, naAr: e.target.value })} />
          </Field>
          <Field label={t('newArrivals.headingEnLabel')}>
            <input className="input" dir="ltr" value={d.naEn} onChange={(e) => setD({ ...d, naEn: e.target.value })} />
          </Field>
        </div>
      </div>

      <button onClick={persist} disabled={busy} className="btn-primary inline-flex items-center gap-2 disabled:opacity-50">
        <Save className="w-4 h-4" /> {tc('save')}
      </button>
    </div>
  );
}

function ExpToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer p-3 border border-line">
      <span className="text-[11px] tracking-cinematic text-muted">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-accent' : 'bg-border'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-pearl transition-transform ${value ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </label>
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
