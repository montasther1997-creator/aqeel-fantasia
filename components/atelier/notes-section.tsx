'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Icon } from './icons';

export function NotesSection({ notes }: { notes: any[] }) {
  const locale = useLocale() as 'ar' | 'en';
  const isAr = locale === 'ar';
  const [idx, setIdx] = useState(0);

  if (!notes.length) return null;

  const note = notes[idx];
  const text = isAr ? note.textAr : note.textEn;
  const next = () => setIdx((idx + 1) % notes.length);
  const prev = () => setIdx((idx - 1 + notes.length) % notes.length);

  return (
    <section className="container-x py-20 md:py-32">
      <div className={`max-w-4xl mx-auto text-center`}>
        <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-3" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
          {isAr ? 'ملاحظات الدار' : 'Atelier Notes'}
        </div>
        <h2 className="serif text-3xl md:text-5xl font-light mb-12 md:mb-16" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
          {isAr ? 'بقلم عقيل' : 'By Aqeel'}
        </h2>

        {/* Note card with paper texture */}
        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.article
              key={note.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative px-8 md:px-16 py-12 md:py-20 border border-border bg-bg-elevated/40 backdrop-blur-sm"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
              }}
            >
              {/* Note number */}
              <div className="absolute top-6 left-6 rtl:right-6 rtl:left-auto text-[10px] tracking-[0.3em] text-fg-tertiary num font-mono">
                NOTE · N° {String(note.number).padStart(2, '0')}
              </div>

              {/* Decorative corner ornaments */}
              <span className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-accent">✦</span>

              {/* Quote */}
              <p className="serif italic text-2xl md:text-3xl lg:text-4xl text-fg leading-[1.5] font-light max-w-2xl mx-auto" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>
                «{text}»
              </p>

              {/* Signature line + date */}
              <div className="mt-12 flex items-center justify-center gap-6">
                <div className="h-px w-12 bg-fg-tertiary" />
                <div className="serif italic text-accent text-lg" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>
                  {note.signature || 'ع. / A.'}
                </div>
                <div className="h-px w-12 bg-fg-tertiary" />
              </div>
              <div className="mt-3 text-xs text-fg-tertiary num">
                {new Date(note.noteDate).toLocaleDateString(isAr ? 'ar-IQ' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </motion.article>
          </AnimatePresence>

          {/* Navigation */}
          {notes.length > 1 && (
            <div className="mt-8 flex items-center justify-center gap-6">
              <button onClick={prev} className="w-10 h-10 grid place-items-center text-fg-tertiary hover:text-accent transition-colors" data-sound="click">
                <Icon name={isAr ? 'chevronR' : 'chevronL'} size={18} />
              </button>
              <div className="flex gap-2">
                {notes.map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)} className={`h-px transition-all ${i === idx ? 'w-8 bg-accent' : 'w-4 bg-border'}`} aria-label={`Note ${i + 1}`} />
                ))}
              </div>
              <button onClick={next} className="w-10 h-10 grid place-items-center text-fg-tertiary hover:text-accent transition-colors" data-sound="click">
                <Icon name={isAr ? 'chevronL' : 'chevronR'} size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
