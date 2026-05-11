import { getTranslations } from 'next-intl/server';
import { Icon } from '@/components/atelier/icons';
import { Link } from '@/i18n/routing';
import { getCustomer } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { LoyaltyCard } from '@/components/atelier/loyalty-card';

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
    { label: isAr ? 'صُنع لي' : 'Made for me', href: '/made-for-me', desc: isAr ? '✦' : '✦' },
    { label: isAr ? 'دفتر الدار' : 'Atelier book', href: '/profile/atelier-book', desc: isAr ? 'تفضيلاتي ومقاساتي' : 'My preferences & measurements' },
    { label: t('wishlist'), href: '/saved', desc: me ? `${counts[1]}` : '' },
    { label: t('addresses'), href: '/profile/addresses', desc: me ? `${counts[2]}` : '' },
    { label: t('bespokeInquiries'), href: '/profile/bespoke', desc: me ? `${counts[3]}` : '' },
    { label: t('settings'), href: '/settings', desc: '' },
  ];

  return (
    <div className="pt-20 md:pt-32 pb-20">
      <div className="container-x max-w-3xl">
        <header className={`mb-12 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-3" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {t('eyebrow')}
          </div>
          <h1 className="serif text-5xl md:text-7xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
            {me ? me.name : t('title')}
          </h1>
          {me?.phone && <div className="text-xs text-fg-tertiary mt-3 num" dir="ltr">{me.phone}</div>}
        </header>

        <p className={`text-base md:text-lg text-fg-secondary serif font-light leading-relaxed mb-12 max-w-2xl ${isAr ? 'text-right' : 'text-left'}`} style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : { fontStyle: 'italic' }}>
          {t('manifesto')}
        </p>

        {me && <div className="mb-10"><LoyaltyCard locale={isAr ? 'ar' : 'en'} /></div>}

        <nav className="border-y border-border">
          {rows.map((r) => (
            <Link key={r.href} href={r.href as any} className="flex items-center justify-between px-2 md:px-6 py-6 border-b border-border last:border-0 hover:bg-bg-elevated transition-colors group">
              <div>
                <div className="serif text-lg md:text-xl" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{r.label}</div>
                {r.desc && <div className="text-xs text-fg-tertiary mt-1 num">{r.desc}</div>}
              </div>
              <Icon name={isAr ? 'chevronL' : 'chevronR'} size={18} className="group-hover:text-accent transition-colors" />
            </Link>
          ))}
          {me ? (
            <form action="/api/account/logout" method="post">
              <button type="submit" className="w-full flex items-center justify-between px-2 md:px-6 py-6 text-burgundy hover:bg-bg-elevated transition-colors">
                <span className="serif text-lg md:text-xl" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{t('signOut')}</span>
                <Icon name={isAr ? 'chevronL' : 'chevronR'} size={18} />
              </button>
            </form>
          ) : (
            <Link href={'/auth' as any} className="flex items-center justify-between px-2 md:px-6 py-6 text-accent">
              <span className="serif text-lg md:text-xl" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{isAr ? 'تسجيل الدخول' : 'Sign in'}</span>
              <Icon name={isAr ? 'chevronL' : 'chevronR'} size={18} />
            </Link>
          )}
        </nav>

        <footer className="pt-12 text-center text-[10px] tracking-[0.3em] uppercase text-fg-tertiary num" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
          {t('footer')}
        </footer>
      </div>
    </div>
  );
}
