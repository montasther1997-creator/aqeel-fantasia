'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';
import { useTranslations } from 'next-intl';
import { Save, Image as ImageIcon, Video, Type, Palette } from 'lucide-react';
import { MediaInput } from '@/components/admin/media-input';

type State = {
  heroVideoUrl: string;
  logoUrl: string;
  faviconUrl: string;
  brandTagline: string;
  brandTaglineAr: string;
  primaryAccent: string;
  heroOverlayOpacity: string;
};

export function AppearanceForm({ initial }: { initial: Record<string, string> }) {
  const t = useTranslations('admin.appearance');
  const tc = useTranslations('admin.common');
  const [, startTransition] = useTransition();
  const router = useRouter();

  const [state, setState] = useState<State>({
    heroVideoUrl: initial['appearance.heroVideoUrl'] || '',
    logoUrl: initial['appearance.logoUrl'] || '',
    faviconUrl: initial['appearance.faviconUrl'] || '',
    brandTagline: initial['appearance.brandTagline'] || '',
    brandTaglineAr: initial['appearance.brandTaglineAr'] || '',
    primaryAccent: initial['appearance.primaryAccent'] || '#C9A961',
    heroOverlayOpacity: initial['appearance.heroOverlayOpacity'] || '0.6',
  });
  const [savingSection, setSavingSection] = useState<string | null>(null);

  const update = <K extends keyof State>(key: K, value: State[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  };

  const saveMany = async (section: string, entries: { key: string; value: string }[]) => {
    setSavingSection(section);
    try {
      await Promise.all(entries.map((e) =>
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: e.key, value: e.value, group: 'appearance' }),
        })
      ));
      toast('success', tc('saved'));
      startTransition(() => router.refresh());
    } catch {
      toast('error', tc('saveFailed'));
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section 1 — Visual Identity (media uploads) */}
      <section className="glass p-6 space-y-5">
        <h3 className="text-xs tracking-cinematic text-muted inline-flex items-center gap-2">
          <ImageIcon className="w-3 h-3" /> {t('sections.visual')}
        </h3>

        <div className="grid lg:grid-cols-2 gap-5">
          <MediaInput
            kind="image"
            label={t('fields.logoUrl')}
            hint={t('fields.logoUrlHint')}
            value={state.logoUrl}
            onChange={(v) => update('logoUrl', v)}
          />
          <MediaInput
            kind="image"
            label={t('fields.faviconUrl')}
            hint={t('fields.faviconUrlHint')}
            value={state.faviconUrl}
            onChange={(v) => update('faviconUrl', v)}
          />
        </div>

        <div className="border-t border-line pt-5">
          <MediaInput
            kind="video"
            label={t('fields.heroVideoUrl')}
            hint={t('fields.heroVideoUrlHint')}
            value={state.heroVideoUrl}
            onChange={(v) => update('heroVideoUrl', v)}
          />
        </div>

        <button
          onClick={() => saveMany('visual', [
            { key: 'appearance.logoUrl', value: state.logoUrl },
            { key: 'appearance.faviconUrl', value: state.faviconUrl },
            { key: 'appearance.heroVideoUrl', value: state.heroVideoUrl },
          ])}
          disabled={savingSection === 'visual'}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {savingSection === 'visual' ? t('saving') : t('saveVisual')}
        </button>
      </section>

      {/* Section 2 — Text & Tagline */}
      <section className="glass p-6 space-y-5">
        <h3 className="text-xs tracking-cinematic text-muted inline-flex items-center gap-2">
          <Type className="w-3 h-3" /> {t('sections.text')}
        </h3>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-[10px] tracking-cinematic text-muted block">{t('fields.brandTaglineAr')}</label>
            <input
              className="input"
              dir="rtl"
              value={state.brandTaglineAr}
              onChange={(e) => update('brandTaglineAr', e.target.value)}
              placeholder={t('placeholders.brandTaglineAr')}
            />
            <p className="text-[10px] text-muted opacity-70">{t('fields.brandTaglineHint')}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] tracking-cinematic text-muted block">{t('fields.brandTagline')}</label>
            <input
              className="input"
              dir="ltr"
              value={state.brandTagline}
              onChange={(e) => update('brandTagline', e.target.value)}
              placeholder={t('placeholders.brandTagline')}
            />
            <p className="text-[10px] text-muted opacity-70">{t('fields.brandTaglineHint')}</p>
          </div>
        </div>

        <button
          onClick={() => saveMany('text', [
            { key: 'appearance.brandTagline', value: state.brandTagline },
            { key: 'appearance.brandTaglineAr', value: state.brandTaglineAr },
          ])}
          disabled={savingSection === 'text'}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {savingSection === 'text' ? t('saving') : t('saveText')}
        </button>
      </section>

      {/* Section 3 — Colors & Effects */}
      <section className="glass p-6 space-y-5">
        <h3 className="text-xs tracking-cinematic text-muted inline-flex items-center gap-2">
          <Palette className="w-3 h-3" /> {t('sections.colors')}
        </h3>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-[10px] tracking-cinematic text-muted block">{t('fields.primaryAccent')}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="w-14 h-10 border border-line bg-bg-secondary cursor-pointer"
                value={state.primaryAccent}
                onChange={(e) => update('primaryAccent', e.target.value)}
              />
              <input
                type="text"
                className="input flex-1 font-mono"
                dir="ltr"
                value={state.primaryAccent}
                onChange={(e) => update('primaryAccent', e.target.value)}
                placeholder="#C9A961"
              />
            </div>
            <p className="text-[10px] text-muted opacity-70">{t('fields.primaryAccentHint')}</p>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] tracking-cinematic text-muted block">
              {t('fields.heroOverlayOpacity')}
              <span className="text-electric ml-2 num">{state.heroOverlayOpacity}</span>
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              className="w-full accent-electric"
              value={state.heroOverlayOpacity}
              onChange={(e) => update('heroOverlayOpacity', e.target.value)}
            />
            <p className="text-[10px] text-muted opacity-70">{t('fields.heroOverlayOpacityHint')}</p>
          </div>
        </div>

        <button
          onClick={() => saveMany('colors', [
            { key: 'appearance.primaryAccent', value: state.primaryAccent },
            { key: 'appearance.heroOverlayOpacity', value: state.heroOverlayOpacity },
          ])}
          disabled={savingSection === 'colors'}
          className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {savingSection === 'colors' ? t('saving') : t('saveColors')}
        </button>
      </section>
    </div>
  );
}
