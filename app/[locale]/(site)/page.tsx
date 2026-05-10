import { StatusBar } from '@/components/atelier/phone-shell';
import { Editorial } from '@/components/atelier/editorial';
import { Crest } from '@/components/atelier/crest';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

export default async function WelcomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('welcome');
  const isAr = locale === 'ar';

  return (
    <div className="h-full relative overflow-hidden">
      <StatusBar />
      <div className="absolute inset-0">
        <Editorial variant="v5" ratio="auto" className="absolute inset-0" fade>
          <div className="absolute top-[54px] left-0 right-0 px-6 py-4 flex items-center justify-between z-10">
            <div className="text-pearl"><Crest size={36} /></div>
            <Link href={'/' as any} locale={isAr ? 'en' : 'ar'} className="border border-pearl/30 text-pearl px-3 py-1.5 text-[10px] tracking-[0.16em] uppercase">
              {isAr ? 'English' : 'العربية'}
            </Link>
          </div>

          <div className="absolute inset-0 flex items-end justify-end p-8 pt-32 pb-48 z-[2]">
            <div className={`serif italic text-pearl/[0.18] text-5xl leading-none font-light ${isAr ? 'text-left' : 'text-right'}`} style={isAr ? { fontStyle: 'normal', fontFamily: 'var(--serif-ar)' } : {}}>
              {isAr ? <>عقيل<br />فنتازيا</> : <>Aqeel<br />Fantasia</>}
            </div>
          </div>

          <div className={`absolute bottom-12 left-0 right-0 px-8 z-[4] text-pearl ${isAr ? 'text-right' : 'text-left'}`}>
            <div className="t-eyebrow text-bone">{t('eyebrow')}</div>
            <h1 className="serif text-5xl sm:text-6xl leading-[0.95] font-light mt-4" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.03em' }}>
              {t('headline1')}<br />
              <em className={`${isAr ? '' : 'italic'} font-normal`} style={{ color: 'var(--accent)', fontStyle: isAr ? 'normal' : 'italic' }}>{t('headline2')}</em>
            </h1>
            <p className="text-bone text-sm mt-6 opacity-80">{t('sub')}</p>

            <Link href={'/home' as any} className="btn btn-pearl w-full mt-8">
              {t('enter')}
            </Link>
          </div>
        </Editorial>
      </div>
    </div>
  );
}
