'use client';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Icon } from '@/components/atelier/icons';
import { useState } from 'react';
import { useCart } from '@/lib/cart-store';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const locale = useLocale() as 'ar' | 'en';
  const isAr = locale === 'ar';
  const router = useRouter();
  const currency = useCart((s) => s.currency);
  const setCurrency = useCart((s) => s.setCurrency);
  const [mode, setMode] = useState<'dark' | 'light'>('dark');
  const [notifs, setNotifs] = useState({ newCollections: true, orderUpdates: true, bespokeReplies: true, journal: false });

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
          <Row label={t('language')} value={isAr ? 'العربية' : 'English'} onClick={() => router.push('/' as any, { locale: isAr ? 'en' : 'ar' } as any)} />
          <Row label={t('mode')} value={mode === 'dark' ? t('dark') : t('light')} onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} />
        </Group>

        <Group label={t('account')} isAr={isAr}>
          <Row label={t('currency')} value={currency === 'IQD' ? (isAr ? 'د.ع · دينار عراقي' : 'IQD · Iraqi Dinar') : 'USD · US Dollar'} onClick={() => setCurrency(currency === 'IQD' ? 'USD' : 'IQD')} />
          <Row label={t('country')} value={isAr ? 'العراق' : 'Iraq'} />
          <Row label={t('shippingAddress')} value={isAr ? 'إدارة العناوين' : 'Manage'} onClick={() => router.push('/profile/addresses' as any)} />
        </Group>

        <Group label={t('notifications')} isAr={isAr}>
          <Toggle label={t('newCollections')} value={notifs.newCollections} onChange={(v) => setNotifs({ ...notifs, newCollections: v })} />
          <Toggle label={t('orderUpdates')} value={notifs.orderUpdates} onChange={(v) => setNotifs({ ...notifs, orderUpdates: v })} />
          <Toggle label={t('bespokeReplies')} value={notifs.bespokeReplies} onChange={(v) => setNotifs({ ...notifs, bespokeReplies: v })} />
          <Toggle label={t('atelierJournal')} value={notifs.journal} onChange={(v) => setNotifs({ ...notifs, journal: v })} />
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
