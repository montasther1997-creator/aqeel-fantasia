'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type Slide = {
  id: string;
  imageUrl: string;
  titleAr: string | null;
  titleEn: string | null;
  subtitleAr: string | null;
  subtitleEn: string | null;
  linkUrl: string | null;
};

export function HeroSlider({ slides, locale }: { slides: Slide[]; locale: 'ar' | 'en' }) {
  const [idx, setIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isAr = locale === 'ar';
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    timerRef.current = setTimeout(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [idx, slides.length, isPaused]);

  if (slides.length === 0) return null;

  const go = (n: number) => setIdx((n + slides.length) % slides.length);

  return (
    <section
      className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden bg-bg-elevated group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((s, i) => {
        const active = i === idx;
        const title = isAr ? s.titleAr : s.titleEn;
        const subtitle = isAr ? s.subtitleAr : s.subtitleEn;
        return (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${active ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {s.linkUrl ? (
              <Link href={s.linkUrl as any} className="block w-full h-full">
                <SlideContent slide={s} title={title} subtitle={subtitle} active={active} isAr={isAr} />
              </Link>
            ) : (
              <SlideContent slide={s} title={title} subtitle={subtitle} active={active} isAr={isAr} />
            )}
          </div>
        );
      })}

      {/* Navigation arrows (desktop) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); go(idx - 1); }}
            className="absolute top-1/2 -translate-y-1/2 start-6 w-12 h-12 hidden md:flex items-center justify-center border border-pearl/40 text-pearl backdrop-blur-sm hover:border-accent hover:text-accent transition-colors z-20 opacity-0 group-hover:opacity-100"
            aria-label="previous"
          >
            <span className="block text-2xl leading-none">{isAr ? '›' : '‹'}</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); go(idx + 1); }}
            className="absolute top-1/2 -translate-y-1/2 end-6 w-12 h-12 hidden md:flex items-center justify-center border border-pearl/40 text-pearl backdrop-blur-sm hover:border-accent hover:text-accent transition-colors z-20 opacity-0 group-hover:opacity-100"
            aria-label="next"
          >
            <span className="block text-2xl leading-none">{isAr ? '‹' : '›'}</span>
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                className={`h-1 transition-all ${i === idx ? 'w-8 bg-accent' : 'w-4 bg-pearl/40 hover:bg-pearl/70'}`}
                aria-label={`slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function SlideContent({
  slide, title, subtitle, active, isAr,
}: {
  slide: Slide;
  title: string | null;
  subtitle: string | null;
  active: boolean;
  isAr: boolean;
}) {
  return (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] ease-out"
        style={{
          backgroundImage: `url(${slide.imageUrl})`,
          transform: active ? 'scale(1.04)' : 'scale(1.0)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-onyx/80 via-onyx/30 to-transparent" />
      {(title || subtitle) && (
        <div className={`absolute bottom-16 md:bottom-24 inset-x-0 px-8 md:px-16 z-[5] ${isAr ? 'text-right' : 'text-left'}`}>
          <div className={`transition-all duration-[1000ms] ease-out ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {subtitle && (
              <p className="text-[11px] tracking-[0.3em] uppercase text-pearl/70 mb-4" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="serif text-pearl text-4xl md:text-6xl lg:text-7xl font-light max-w-3xl leading-[1.05]" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
                {title}
              </h2>
            )}
          </div>
        </div>
      )}
    </>
  );
}
