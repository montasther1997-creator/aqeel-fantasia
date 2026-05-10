'use client';
import { Link, usePathname } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Crest } from './crest';

export function DesktopFooter() {
  const locale = useLocale();
  const t = useTranslations('nav');
  const path = usePathname();
  const isAr = locale === 'ar';

  // Hide on welcome/auth
  const hideOnRoutes = ['/', '/auth'];
  if (hideOnRoutes.includes(path)) return null;

  return (
    <footer className="hidden md:block mt-32 border-t border-border bg-bg-elevated/30">
      <div className="max-w-[1500px] mx-auto px-12 py-20 grid grid-cols-12 gap-10">
        {/* Brand */}
        <div className="col-span-4">
          <Crest size={48} className="text-fg" />
          <div className="mt-4">
            <div className="text-[9px] tracking-[0.3em] text-fg-tertiary">{isAr ? 'دار' : 'MAISON'}</div>
            <div className="serif text-2xl mt-1" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>
              {isAr ? 'عقيل فنتازيا' : 'Aqeel Fantasia'}
            </div>
          </div>
          <p className="mt-4 text-sm text-fg-secondary max-w-xs serif italic font-light" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>
            {isAr ? 'دار أزياء رجالية. تأسست في بغداد، 2024.' : 'A house of menswear. Established in Baghdad, 2024.'}
          </p>
        </div>

        {/* Atelier */}
        <div className="col-span-2">
          <h4 className="text-[10px] tracking-[0.25em] text-fg-tertiary uppercase mb-5" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {isAr ? 'الأتيليه' : 'ATELIER'}
          </h4>
          <ul className="space-y-3 text-sm">
            <li><Link href={'/collections' as any} className="text-fg-secondary hover:text-fg">{t('collections')}</Link></li>
            <li><Link href={'/bespoke' as any} className="text-fg-secondary hover:text-fg">{isAr ? 'مفصّل' : 'Bespoke'}</Link></li>
            <li><Link href={'/search' as any} className="text-fg-secondary hover:text-fg">{t('search')}</Link></li>
          </ul>
        </div>

        {/* Account */}
        <div className="col-span-2">
          <h4 className="text-[10px] tracking-[0.25em] text-fg-tertiary uppercase mb-5" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {isAr ? 'الحساب' : 'ACCOUNT'}
          </h4>
          <ul className="space-y-3 text-sm">
            <li><Link href={'/profile' as any} className="text-fg-secondary hover:text-fg">{t('profile')}</Link></li>
            <li><Link href={'/profile/orders' as any} className="text-fg-secondary hover:text-fg">{isAr ? 'طلباتي' : 'My Orders'}</Link></li>
            <li><Link href={'/saved' as any} className="text-fg-secondary hover:text-fg">{t('saved')}</Link></li>
            <li><Link href={'/settings' as any} className="text-fg-secondary hover:text-fg">{isAr ? 'الإعدادات' : 'Settings'}</Link></li>
          </ul>
        </div>

        {/* Branches */}
        <div className="col-span-4">
          <h4 className="text-[10px] tracking-[0.25em] text-fg-tertiary uppercase mb-5" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {isAr ? 'الفروع' : 'BRANCHES'}
          </h4>
          <div className="grid grid-cols-2 gap-5 text-sm">
            <div>
              <div className="serif text-base" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{isAr ? 'بابل' : 'Babylon'}</div>
              <div className="text-fg-tertiary text-xs mt-1">{isAr ? 'شارع 40' : 'Street 40'}</div>
            </div>
            <div>
              <div className="serif text-base" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{isAr ? 'بغداد' : 'Baghdad'}</div>
              <div className="text-fg-tertiary text-xs mt-1">{isAr ? 'حي القادسية' : 'Al-Qadisiya'}</div>
            </div>
          </div>
          <a href="https://instagram.com/shopfantasia1" target="_blank" rel="noopener noreferrer" className="inline-block mt-6 text-xs text-fg-tertiary hover:text-accent transition-colors">
            @shopfantasia1
          </a>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-[1500px] mx-auto px-12 py-6 flex items-center justify-between text-[10px] tracking-[0.2em] text-fg-tertiary uppercase" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
          <span className="num">© 2026 AQEEL FANTASIA</span>
          <span className="hidden lg:inline">{isAr ? 'صُنع بعناية · بغداد' : 'CRAFTED IN BAGHDAD'}</span>
        </div>
      </div>
    </footer>
  );
}
