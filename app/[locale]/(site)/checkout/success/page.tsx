import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { StatusBar } from '@/components/atelier/phone-shell';
import { Editorial } from '@/components/atelier/editorial';
import { Icon } from '@/components/atelier/icons';

export default async function CheckoutSuccess({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ o?: string }> }) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations('checkout');
  const isAr = locale === 'ar';

  return (
    <div className="h-full relative">
      <StatusBar />
      <Editorial variant="v5" ratio="auto" className="absolute inset-0 opacity-25" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center z-10">
        <div className="w-16 h-16 rounded-full border border-accent grid place-items-center mb-8">
          <Icon name="check" size={28} className="text-accent" />
        </div>
        <div className="t-eyebrow mb-4">{isAr ? 'تأكيد' : 'CONFIRMED'}</div>
        <h1 className="serif text-4xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{t('success')}</h1>
        {sp.o && <p className="mt-6 text-fg-tertiary num font-mono text-xs">{t('orderNumber')} · {sp.o}</p>}
        <Link href={'/' as any} className="btn btn-secondary mt-10">{isAr ? 'العودة' : 'Back home'}</Link>
      </div>
    </div>
  );
}
