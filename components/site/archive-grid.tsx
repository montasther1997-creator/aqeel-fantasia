'use client';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Play } from 'lucide-react';

export function ArchiveGrid({ items }: { items: any[] }) {
  const locale = useLocale() as 'ar' | 'en';
  return (
    <div className="grid grid-cols-12 gap-3 mt-16 pb-20">
      {items.map((item, i) => {
        const span = i % 7 === 0 ? 'col-span-12 lg:col-span-8' : i % 5 === 0 ? 'col-span-12 lg:col-span-6' : 'col-span-6 lg:col-span-4';
        const aspect = i % 7 === 0 ? 'aspect-[16/9]' : 'aspect-[4/5]';
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7, delay: (i % 6) * 0.06 }}
            className={`${span} relative ${aspect} group overflow-hidden bg-bg-secondary cursor-pointer`}
          >
            <img src={item.cover} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/95 via-transparent to-transparent" />
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] tracking-cinematic uppercase text-electric">{item.type}</p>
                <h3 className="h-display text-2xl">{locale === 'ar' ? item.titleAr : item.titleEn}</h3>
              </div>
              {item.type === 'reel' && <div className="w-10 h-10 rounded-full glass grid place-items-center"><Play className="w-4 h-4" /></div>}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
