import { getTranslations } from 'next-intl/server';
import { Manifesto } from '@/components/site/manifesto';
import { MarqueeBand } from '@/components/site/marquee-band';

export default async function IdentityPage() {
  const t = await getTranslations('identity');
  return (
    <div className="pt-32">
      <section className="container-x py-20">
        <p className="text-xs tracking-cinematic text-muted">— CHAPTER 01</p>
        <h1 className="h-display text-7xl sm:text-9xl mt-4 text-balance">{t('title')}</h1>
      </section>
      <Manifesto />
      <MarqueeBand items={['BORN IN THE DARK', 'NO PERMISSION', 'POWER, NOT ESCAPE', 'AQEEL FANTASIA']} />
      <section className="container-x py-32 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs tracking-cinematic text-muted mb-4">— DOCTRINE</p>
          <p className="text-2xl sm:text-3xl leading-relaxed text-frost/90">
            {t('philosophy')}
          </p>
        </div>
        <div className="aspect-[4/5] bg-bg-secondary overflow-hidden">
          <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80" className="w-full h-full object-cover" alt="" />
        </div>
      </section>
    </div>
  );
}
