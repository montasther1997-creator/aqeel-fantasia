import { Crest } from '@/components/atelier/crest';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { AtelierEntry } from '@/components/atelier/atelier-entry';
import { prisma } from '@/lib/db';

async function loadIntroSettings() {
  try {
    const rows = await prisma.setting.findMany({
      where: { key: { in: ['intro.enabled', 'intro.durationSeconds'] } },
    });
    const map = new Map(rows.map((r) => [r.key, r.value]));
    return {
      enabled: map.get('intro.enabled') !== '0',
      duration: Number(map.get('intro.durationSeconds')) || 4,
    };
  } catch {
    return { enabled: true, duration: 4 };
  }
}

export default async function WelcomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('welcome');
  const isAr = locale === 'ar';
  const intro = await loadIntroSettings();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Intro overlay — only shown on the welcome page, not on every navigation */}
      <AtelierEntry enabled={intro.enabled} durationSeconds={intro.duration} />
      {/* Background image */}
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=2400&q=85" alt="" className="w-full h-full object-cover" style={{ filter: 'grayscale(0.4) contrast(1.1) brightness(0.45)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,10,10,0.4) 0%, transparent 30%, transparent 50%, rgba(10,10,10,0.95) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(10,10,10,0.6) 80%)' }} />
      </div>

      {/* Top bar */}
      <div className="relative z-10 px-6 md:px-12 lg:px-16 py-6 md:py-8 flex items-center justify-between">
        <div className="text-pearl"><Crest size={36} className="md:w-12 md:h-12" /></div>
        <Link href={'/' as any} locale={isAr ? 'en' : 'ar'} className="border border-pearl/30 text-pearl px-4 py-2 text-[10px] tracking-[0.2em] uppercase hover:border-pearl transition-colors" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
          {isAr ? 'English' : 'العربية'}
        </Link>
      </div>

      {/* Center hero content */}
      <div className="relative z-10 max-w-[1500px] mx-auto px-6 md:px-12 lg:px-16 min-h-[calc(100vh-200px)] flex flex-col justify-center md:justify-end md:pb-32 lg:pb-40">
        <div className={`max-w-3xl ${isAr ? 'mr-auto md:mr-0' : ''}`}>
          <div className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-bone mb-6 md:mb-8" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {t('eyebrow')}
          </div>
          <h1 className="serif font-light text-pearl leading-[0.92]" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.03em' }}>
            <span className="block text-7xl sm:text-8xl md:text-9xl lg:text-[10rem]">{t('headline1')}</span>
            <em className="block text-7xl sm:text-8xl md:text-9xl lg:text-[10rem]" style={{ color: 'var(--accent)', fontStyle: isAr ? 'normal' : 'italic', fontWeight: 400 }}>
              {t('headline2')}
            </em>
          </h1>
          <p className="text-bone text-base md:text-lg mt-8 md:mt-10 opacity-80 max-w-md">{t('sub')}</p>

          <div className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Link href={'/home' as any} className="btn btn-pearl">
              {t('enter')}
            </Link>
            <Link href={'/auth' as any} className="text-[11px] tracking-[0.2em] uppercase text-pearl/70 hover:text-pearl underline underline-offset-4" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
              {isAr ? 'تسجيل الدخول' : 'Sign in'}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom credit */}
      <div className="absolute bottom-6 inset-x-0 z-10 px-6 md:px-12 flex items-center justify-between text-[10px] tracking-[0.3em] uppercase text-pearl/40 font-mono">
        <span>EST. 2024 · BAGHDAD</span>
        <span className="hidden sm:inline">ATELIER DIGITAL</span>
      </div>
    </div>
  );
}
