'use client';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/atelier/icons';
import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cart-store';
import { toast } from '@/components/ui/toast';

type Notifs = { newCollections: boolean; orderUpdates: boolean; bespokeReplies: boolean; journal: boolean };
const DEFAULT_NOTIFS: Notifs = { newCollections: true, orderUpdates: true, bespokeReplies: true, journal: false };

export default function SettingsPage() {
  const t = useTranslations('settings');
  const locale = useLocale() as 'ar' | 'en';
  const isAr = locale === 'ar';
  const router = useRouter();
  const pathname = usePathname();
  const currency = useCart((s) => s.currency);
  const setCurrency = useCart((s) => s.setCurrency);
  const [mode, setMode] = useState<'dark' | 'light'>('dark');
  const [notifs, setNotifs] = useState<Notifs>(DEFAULT_NOTIFS);

  useEffect(() => {
    const savedMode = (localStorage.getItem('fantasia-theme') as 'dark' | 'light' | null) || 'dark';
    setMode(savedMode);
    document.documentElement.dataset.mode = savedMode;
    try {
      const savedNotifs = localStorage.getItem('fantasia-notifs');
      if (savedNotifs) setNotifs({ ...DEFAULT_NOTIFS, ...JSON.parse(savedNotifs) });
    } catch {
      // localStorage unavailable or malformed JSON — keep defaults.
    }
  }, []);

  const toggleMode = () => {
    const next = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    document.documentElement.dataset.mode = next;
    localStorage.setItem('fantasia-theme', next);
  };

  const updateNotifs = (patch: Partial<Notifs>) => {
    const next = { ...notifs, ...patch };
    setNotifs(next);
    localStorage.setItem('fantasia-notifs', JSON.stringify(next));
    toast('success', isAr ? 'حُفِظ' : 'Saved');
  };

  const switchLanguage = () => {
    const target = isAr ? 'en' : 'ar';
    const stripped = (pathname || '/').replace(/^\/(ar|en)(?=\/|$)/, '') || '/';
    router.replace(stripped as any, { locale: target } as any);
  };

  return (
    <div className="pt-20 md:pt-32 pb-20">
      <div className="container-x max-w-3xl">
        <header className={`mb-12 md:mb-16 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-3" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {t('eyebrow')}
          </div>
          <h1 className="serif text-5xl md:text-7xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>{t('title')}</h1>
          <p className="serif italic text-base md:text-lg text-fg-secondary mt-4 font-light" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>{t('sub')}</p>
        </header>

        <Group label={t('appearance')} isAr={isAr}>
          <Row label={t('language')} value={isAr ? 'العربية' : 'English'} onClick={switchLanguage} />
          <Row label={t('mode')} value={mode === 'dark' ? t('dark') : t('light')} onClick={toggleMode} />
        </Group>

        <Group label={t('account')} isAr={isAr}>
          <Row label={t('currency')} value={currency === 'IQD' ? (isAr ? 'د.ع · دينار عراقي' : 'IQD · Iraqi Dinar') : 'USD · US Dollar'} onClick={() => setCurrency(currency === 'IQD' ? 'USD' : 'IQD')} />
          <Row label={t('country')} value={isAr ? 'العراق' : 'Iraq'} />
          <Row label={t('shippingAddress')} value={isAr ? 'إدارة العناوين' : 'Manage'} onClick={() => router.push('/profile/addresses' as any)} />
        </Group>

        <Group label={t('notifications')} isAr={isAr}>
          <Toggle label={t('newCollections')} value={notifs.newCollections} onChange={(v) => updateNotifs({ newCollections: v })} />
          <Toggle label={t('orderUpdates')} value={notifs.orderUpdates} onChange={(v) => updateNotifs({ orderUpdates: v })} />
          <Toggle label={t('bespokeReplies')} value={notifs.bespokeReplies} onChange={(v) => updateNotifs({ bespokeReplies: v })} />
          <Toggle label={t('atelierJournal')} value={notifs.journal} onChange={(v) => updateNotifs({ journal: v })} />
        </Group>

        <Group label={t('privacy')} isAr={isAr}>
          <Row label={t('dataPersonalisation')} />
          <form action="/api/account/logout" method="post">
            <button type="submit" className="w-full flex items-center justify-between px-2 md:px-6 py-5 text-burgundy">
              <span className="text-sm md:text-base">{t('signOut')}</span>
              <Icon name={isAr ? 'chevronL' : 'chevronR'} size={16} />
            </button>
          </form>
        </Group>

        <footer className="pt-12 text-center text-[10px] tracking-[0.2em] text-fg-tertiary num">{t('version')}</footer>
      </div>
    </div>
  );
}

function Group({ label, children, isAr }: { label: string; children: React.ReactNode; isAr: boolean }) {
  return (
    <section className="mb-10">
      <div className={`text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-3 ${isAr ? 'text-right' : ''}`} style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
        {label}
      </div>
      <div className="border-y border-border bg-bg-elevated/30">{children}</div>
    </section>
  );
}

function Row({ label, value, onClick }: { label: string; value?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} disabled={!onClick} className="w-full flex items-center justify-between px-2 md:px-6 py-5 border-b border-border last:border-0 hover:bg-bg-elevated transition-colors disabled:cursor-default text-start">
      <span className="text-sm md:text-base">{label}</span>
      <span className="flex items-center gap-2 text-xs md:text-sm text-fg-tertiary">
        {value}
        {onClick && <Icon name="chevronR" size={14} />}
      </span>
    </button>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between px-2 md:px-6 py-5 border-b border-border last:border-0">
      <span className="text-sm md:text-base">{label}</span>
      <button onClick={() => onChange(!value)} className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-accent' : 'bg-border'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-pearl transition-transform ${value ? 'left-[26px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}
