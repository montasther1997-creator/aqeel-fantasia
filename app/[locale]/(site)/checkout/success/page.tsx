import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Icon } from '@/components/atelier/icons';

export default async function CheckoutSuccess({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ o?: string }> }) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations('checkout');
  const isAr = locale === 'ar';

  return (
    <div className="pt-20 md:pt-32 pb-32 min-h-[80vh] flex items-center">
      <div className="container-x max-w-xl text-center">
        <div className="w-20 h-20 rounded-full border border-accent grid place-items-center mb-10 mx-auto">
          <Icon name="check" size={32} className="text-accent" />
        </div>
        <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-4">{isAr ? 'تأكيد' : 'CONFIRMED'}</div>
        <h1 className="serif text-5xl md:text-6xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{t('success')}</h1>
        {sp.o && <p className="mt-6 text-fg-tertiary num font-mono text-xs">{t('orderNumber')} · {sp.o}</p>}
        <Link href={'/' as any} className="btn btn-secondary mt-12 inline-flex">{isAr ? 'العودة إلى الرئيسية' : 'Back to home'}</Link>
      </div>
    </div>
  );
}
