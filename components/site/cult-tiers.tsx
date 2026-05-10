'use client';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Price } from '@/components/ui/price';
import { Check } from 'lucide-react';

export function CultTiers({ tiers }: { tiers: any[] }) {
  const locale = useLocale() as 'ar' | 'en';
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
      {tiers.map((tier, i) => {
        const perks: string[] = JSON.parse(tier.perks || '[]');
        const isBlack = tier.slug === 'black';
        return (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className={`relative p-8 transition-all hover:-translate-y-1 ${isBlack ? 'bg-bg-tertiary border-2' : 'glass'}`}
            style={isBlack ? { borderColor: tier.color, boxShadow: `0 0 40px ${tier.color}20` } : {}}
          >
            <div className="w-3 h-3 rounded-full mb-4" style={{ background: tier.color, boxShadow: `0 0 20px ${tier.color}` }} />
            <h3 className="h-display text-3xl">{locale === 'ar' ? tier.nameAr : tier.nameEn}</h3>
            <p className="text-xs text-muted mt-2 min-h-[2rem]">{locale === 'ar' ? tier.descAr : tier.descEn}</p>
            <div className="my-6">
              <Price iqd={tier.priceIQD} usd={tier.priceUSD} className="font-display text-2xl" />
              <span className="text-xs text-muted ml-1">/year</span>
            </div>
            <ul className="space-y-2 text-sm text-frost/80 mb-8">
              {perks.map((p, j) => (
                <li key={j} className="flex items-start gap-2">
                  <Check className="w-3 h-3 text-electric mt-1 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <button className={isBlack ? 'btn-primary w-full' : 'btn-ghost w-full'}>JOIN</button>
          </motion.div>
        );
      })}
    </div>
  );
}
