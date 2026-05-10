import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/ui/logo';
import { Instagram, Youtube } from 'lucide-react';

export function SiteFooter() {
  const t = useTranslations();
  return (
    <footer className="relative border-t border-line mt-32">
      <div className="container-x py-16 grid grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="col-span-2">
          <Logo />
          <p className="mt-6 text-muted text-sm max-w-xs">{t('footer.tagline')}</p>
          <div className="mt-6 flex items-center gap-4 text-muted">
            <a href="#" className="hover:text-frost"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="hover:text-frost"><Youtube className="w-4 h-4" /></a>
          </div>
        </div>
        <div>
          <h4 className="text-xs tracking-cinematic uppercase text-frost mb-4">{t('nav.drops')}</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href={'/drops' as any}>{t('drops.viewAll')}</Link></li>
            <li><Link href={'/cult' as any}>{t('nav.cult')}</Link></li>
            <li><Link href={'/archive' as any}>{t('nav.archive')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs tracking-cinematic uppercase text-frost mb-4">{t('nav.account')}</h4>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href={'/account/login' as any}>{t('nav.login')}</Link></li>
            <li><Link href={'/account/register' as any}>{t('nav.register')}</Link></li>
            <li><Link href={'/account/orders' as any}>{t('account.orders')}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-6 text-center text-xs text-muted tracking-cinematic">
        © {new Date().getFullYear()} AQEEL FANTASIA — {t('footer.rights')}
      </div>
    </footer>
  );
}
