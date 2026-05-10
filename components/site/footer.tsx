import { Link } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { Logo } from '@/components/ui/logo';
import { Instagram, MapPin } from 'lucide-react';

export function SiteFooter() {
  const t = useTranslations();
  const locale = useLocale() as 'ar' | 'en';
  return (
    <footer className="relative border-t border-line mt-32 bg-bg-secondary/30">
      <div className="container-x py-20 grid grid-cols-2 lg:grid-cols-12 gap-10">
        <div className="col-span-2 lg:col-span-4">
          <Logo />
          <p className="mt-3 text-sm text-frost/80 font-display tracking-cinematic">
            {locale === 'ar' ? 'شركة عقيل فنتازيا' : 'AQEEL FANTASIA Co.'}
          </p>
          <p className="mt-1 text-xs text-muted">
            {locale === 'ar' ? 'للألبسة الرجالية الفاخرة' : 'Premium Men\'s Apparel'}
          </p>
          <a
            href="https://instagram.com/shopfantasia1"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm tracking-cinematic text-muted hover:text-electric transition-colors"
          >
            <Instagram className="w-4 h-4" />
            @shopfantasia1
          </a>
        </div>

        <div className="col-span-2 lg:col-span-3">
          <h4 className="text-[10px] tracking-cinematic uppercase text-electric mb-4 font-mono">— {locale === 'ar' ? 'الفروع' : 'BRANCHES'}</h4>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-display tracking-cinematic text-frost">
                {locale === 'ar' ? 'بابل' : 'BABYLON'}
              </p>
              <p className="text-muted text-xs flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {locale === 'ar' ? 'شارع 40' : 'Street 40'}
              </p>
            </div>
            <div>
              <p className="font-display tracking-cinematic text-frost">
                {locale === 'ar' ? 'بغداد' : 'BAGHDAD'}
              </p>
              <p className="text-muted text-xs flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {locale === 'ar' ? 'حي القادسية' : 'Al-Qadisiya District'}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h4 className="text-[10px] tracking-cinematic uppercase text-electric mb-4 font-mono">— {t('nav.drops')}</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href={'/drops' as any} className="hover:text-frost transition-colors">{t('drops.viewAll')}</Link></li>
            <li><Link href={'/cult' as any} className="hover:text-frost transition-colors">{t('nav.cult')}</Link></li>
            <li><Link href={'/archive' as any} className="hover:text-frost transition-colors">{t('nav.archive')}</Link></li>
            <li><Link href={'/identity' as any} className="hover:text-frost transition-colors">{t('nav.identity')}</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h4 className="text-[10px] tracking-cinematic uppercase text-electric mb-4 font-mono">— {t('nav.account')}</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href={'/account/login' as any} className="hover:text-frost transition-colors">{t('nav.login')}</Link></li>
            <li><Link href={'/account/register' as any} className="hover:text-frost transition-colors">{t('nav.register')}</Link></li>
            <li><Link href={'/account/orders' as any} className="hover:text-frost transition-colors">{t('account.orders')}</Link></li>
            <li><Link href={'/account/wishlist' as any} className="hover:text-frost transition-colors">{t('account.wishlist')}</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line py-6 px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-muted tracking-cinematic font-mono">
        <span>© {new Date().getFullYear()} AQEEL FANTASIA · ALL RIGHTS RESERVED</span>
        <span>BUILT IN IRAQ · CRAFTED FOR THE WORLD</span>
      </div>
    </footer>
  );
}
