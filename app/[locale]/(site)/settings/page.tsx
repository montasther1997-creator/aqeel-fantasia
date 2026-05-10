'use client';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import { StatusBar } from '@/components/atelier/phone-shell';
import { TopBar } from '@/components/atelier/topbar';
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
    <div className="h-full relative">
      <StatusBar />
      <div className="screen-body">
        <TopBar leftIcon="chevronL" hideRight />

        <header className={`px-6 pt-8 pb-8 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="t-eyebrow">{t('eyebrow')}</div>
          <h1 className="serif text-5xl font-light mt-3" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>{t('title')}</h1>
          <p className="serif italic text-fg-secondary text-base mt-3 font-light" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>{t('sub')}</p>
        </header>

        {/* Appearance */}
        <Group label={t('appearance')} isAr={isAr}>
          <Row label={t('language')} value={isAr ? 'العربية' : 'English'} onClick={() => router.push('/' as any, { locale: isAr ? 'en' : 'ar' } as any)} />
          <Row label={t('mode')} value={mode === 'dark' ? t('dark') : t('light')} onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} />
        </Group>

        {/* Account */}
        <Group label={t('account')} isAr={isAr}>
          <Row label={t('currency')} value={currency === 'IQD' ? (isAr ? 'د.ع · دينار عراقي' : 'IQD · Iraqi Dinar') : 'USD · US Dollar'} onClick={() => setCurrency(currency === 'IQD' ? 'USD' : 'IQD')} />
          <Row label={t('country')} value={isAr ? 'العراق' : 'Iraq'} />
          <Row label={t('shippingAddress')} value={isAr ? 'إدارة العناوين' : 'Manage'} onClick={() => router.push('/profile/addresses' as any)} />
        </Group>

        {/* Notifications */}
        <Group label={t('notifications')} isAr={isAr}>
          <Toggle label={t('newCollections')} value={notifs.newCollections} onChange={(v) => setNotifs({ ...notifs, newCollections: v })} />
          <Toggle label={t('orderUpdates')} value={notifs.orderUpdates} onChange={(v) => setNotifs({ ...notifs, orderUpdates: v })} />
          <Toggle label={t('bespokeReplies')} value={notifs.bespokeReplies} onChange={(v) => setNotifs({ ...notifs, bespokeReplies: v })} />
          <Toggle label={t('atelierJournal')} value={notifs.journal} onChange={(v) => setNotifs({ ...notifs, journal: v })} />
        </Group>

        {/* Privacy */}
        <Group label={t('privacy')} isAr={isAr}>
          <Row label={t('dataPersonalisation')} />
          <form action="/api/account/logout" method="post">
            <button type="submit" className="w-full flex items-center justify-between px-6 py-5 text-burgundy">
              <span>{t('signOut')}</span>
              <Icon name={isAr ? 'chevronL' : 'chevronR'} size={16} />
            </button>
          </form>
        </Group>

        <footer className="px-6 py-12 text-center text-[10px] tracking-[0.15em] text-fg-tertiary num">{t('version')}</footer>
      </div>
    </div>
  );
}

function Group({ label, children, isAr }: { label: string; children: React.ReactNode; isAr: boolean }) {
  return (
    <section className="mb-6">
      <div className={`px-6 t-eyebrow mb-2 ${isAr ? 'text-right' : ''}`}>{label}</div>
      <div className="border-y border-border bg-bg-elevated/40">{children}</div>
    </section>
  );
}

function Row({ label, value, onClick }: { label: string; value?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} disabled={!onClick} className="w-full flex items-center justify-between px-6 py-5 border-b border-border last:border-0 hover:bg-bg-elevated transition-colors disabled:cursor-default">
      <span className="text-sm">{label}</span>
      <span className="flex items-center gap-2 text-xs text-fg-tertiary">
        {value}
        {onClick && <Icon name="chevronR" size={14} />}
      </span>
    </button>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-border last:border-0">
      <span className="text-sm">{label}</span>
      <button onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-accent' : 'bg-border'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-pearl transition-transform ${value ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}
