'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Globe2, Power } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { useTranslations } from 'next-intl';

const LANGS = [
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇮🇶', dir: 'RTL' },
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧', dir: 'LTR' },
];

export function LanguagesManager({ initial }: { initial: { defaultLang: string; arActive: boolean; enActive: boolean } }) {
  const router = useRouter();
  const t = useTranslations('admin.languages');
  const [defaultLang, setDefaultLang] = useState(initial.defaultLang);
  const [active, setActive] = useState<Record<string, boolean>>({ ar: initial.arActive, en: initial.enActive });
  const [busy, setBusy] = useState<string | null>(null);

  const setDefault = async (code: string) => {
    setBusy(code);
    const res = await fetch('/api/admin/settings', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ key: 'languages.default', value: code, group: 'languages' }),
    });
    setBusy(null);
    if (res.ok) {
      setDefaultLang(code);
      toast('success', t('setAsDefault', { code: code.toUpperCase() }));
      router.refresh();
    } else {
      toast('error', t('failedToUpdate'));
    }
  };

  const toggleActive = async (code: string) => {
    if (code === defaultLang && active[code]) {
      toast('error', t('cannotDisableDefault'));
      return;
    }
    setBusy(code);
    const newActive = !active[code];
    const res = await fetch('/api/admin/settings', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ key: `languages.${code}.active`, value: String(newActive), group: 'languages' }),
    });
    setBusy(null);
    if (res.ok) {
      setActive({ ...active, [code]: newActive });
      toast('success', newActive ? t('languageEnabled', { code: code.toUpperCase() }) : t('languageDisabled', { code: code.toUpperCase() }));
      router.refresh();
    } else {
      toast('error', t('failedToUpdate'));
    }
  };

  return (
    <div className="glass p-6">
      <h3 className="text-xs tracking-cinematic text-muted mb-4 flex items-center gap-2">
        <Globe2 className="w-3 h-3" /> {t('availableLanguages')}
      </h3>
      <div className="space-y-3">
        {LANGS.map((l) => {
          const isDefault = defaultLang === l.code;
          const isActive = active[l.code];
          return (
            <div key={l.code} className={`p-4 border transition-all ${isDefault ? 'border-electric/40 bg-electric/5' : 'border-line'}`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{l.flag}</span>
                  <div>
                    <p className="font-display tracking-cinematic text-lg">{l.native}</p>
                    <p className="text-xs text-muted">{l.name} · {l.dir} · /{l.code}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isDefault ? (
                    <span className="inline-flex items-center gap-1 text-[10px] tracking-cinematic text-electric border border-electric/40 px-3 py-1.5">
                      <Star className="w-3 h-3 fill-electric" /> {t('default')}
                    </span>
                  ) : (
                    <button
                      disabled={busy === l.code}
                      onClick={() => setDefault(l.code)}
                      className="text-[10px] tracking-cinematic text-muted hover:text-electric border border-line hover:border-electric px-3 py-1.5 transition-colors"
                    >
                      <Star className="w-3 h-3 inline mr-1" /> {t('setDefault')}
                    </button>
                  )}

                  <button
                    disabled={busy === l.code}
                    onClick={() => toggleActive(l.code)}
                    className={`text-[10px] tracking-cinematic px-3 py-1.5 border transition-colors ${
                      isActive
                        ? 'border-electric/40 text-electric hover:border-blood hover:text-blood'
                        : 'border-line text-muted hover:border-frost hover:text-frost'
                    }`}
                  >
                    <Power className="w-3 h-3 inline mr-1" /> {isActive ? t('active') : t('disabled')}
                  </button>

                  <a
                    href={`/${l.code}`}
                    target="_blank"
                    rel="noopener"
                    className="text-[10px] tracking-cinematic text-muted hover:text-frost border border-line hover:border-frost px-3 py-1.5 transition-colors"
                  >
                    {t('preview')}
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-muted">
        {t('languagesHint')}
      </p>
    </div>
  );
}
