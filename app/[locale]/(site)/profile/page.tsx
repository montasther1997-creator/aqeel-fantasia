import { getTranslations } from 'next-intl/server';
import { StatusBar } from '@/components/atelier/phone-shell';
import { TopBar } from '@/components/atelier/topbar';
import { BottomNav } from '@/components/atelier/bottomnav';
import { Icon } from '@/components/atelier/icons';
import { Link } from '@/i18n/routing';
import { getCustomer } from '@/lib/auth';
import { prisma } from '@/lib/db';

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('profile');
  const isAr = locale === 'ar';

  const me = await getCustomer();
  const counts = me ? await prisma.$transaction([
    prisma.order.count({ where: { customerId: me.id } }),
    prisma.wishlistItem.count({ where: { customerId: me.id } }),
    prisma.address.count({ where: { customerId: me.id } }),
    prisma.bespokeRequest.count({ where: { customerId: me.id } }),
  ]) : [0, 0, 0, 0];

  const rows = [
    { label: t('orders'), href: '/profile/orders', desc: me ? `${counts[0]}` : '' },
    { label: t('wishlist'), href: '/saved', desc: me ? `${counts[1]}` : '' },
    { label: t('addresses'), href: '/profile/addresses', desc: me ? `${counts[2]}` : '' },
    { label: t('bespokeInquiries'), href: '/profile/bespoke', desc: me ? `${counts[3]}` : '' },
    { label: t('settings'), href: '/settings', desc: '' },
  ];

  return (
    <div className="h-full relative">
      <StatusBar />
      <div className="screen-body has-bottomnav">
        <TopBar />

        <header className={`px-6 pt-8 pb-6 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="t-eyebrow">{t('eyebrow')}</div>
          <h1 className="serif text-5xl font-light mt-3" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
            {me ? me.name : t('title')}
          </h1>
          {me?.phone && <div className="text-xs text-fg-tertiary mt-2 num" dir="ltr">{me.phone}</div>}
        </header>

        <p className={`px-6 pb-10 text-sm text-fg-secondary serif font-light leading-relaxed ${isAr ? 'text-right' : 'text-left'}`} style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : { fontStyle: 'italic' }}>
          {t('manifesto')}
        </p>

        <nav className="border-y border-border">
          {rows.map((r) => (
            <Link key={r.href} href={r.href as any} className="flex items-center justify-between px-6 py-5 border-b border-border last:border-0 hover:bg-bg-elevated transition-colors">
              <div>
                <div className={`text-sm ${isAr ? 'text-right' : ''}`}>{r.label}</div>
                {r.desc && <div className="text-xs text-fg-tertiary mt-1 num">{r.desc}</div>}
              </div>
              <Icon name={isAr ? 'chevronL' : 'chevronR'} size={16} />
            </Link>
          ))}
          {me ? (
            <form action="/api/account/logout" method="post">
              <button type="submit" className="w-full flex items-center justify-between px-6 py-5 text-burgundy">
                <span>{t('signOut')}</span>
                <Icon name={isAr ? 'chevronL' : 'chevronR'} size={16} />
              </button>
            </form>
          ) : (
            <Link href={'/auth' as any} className="flex items-center justify-between px-6 py-5 text-accent">
              <span>{t('signIn' as any) || 'تسجيل الدخول'}</span>
              <Icon name={isAr ? 'chevronL' : 'chevronR'} size={16} />
            </Link>
          )}
        </nav>

        <footer className="px-6 py-12 text-center text-[10px] tracking-[0.2em] text-fg-tertiary uppercase" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
          {t('footer')}
        </footer>
      </div>
      <BottomNav />
    </div>
  );
}
