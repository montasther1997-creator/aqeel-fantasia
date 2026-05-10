import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Check } from 'lucide-react';

export default async function Success({ searchParams }: { searchParams: Promise<{ o?: string }> }) {
  const t = await getTranslations('checkout');
  const sp = await searchParams;
  return (
    <div className="pt-32 pb-32 container-x text-center min-h-[70vh] flex flex-col items-center justify-center">
      <div className="w-20 h-20 rounded-full glass-strong grid place-items-center mb-8">
        <Check className="w-8 h-8 text-electric" />
      </div>
      <h1 className="h-display text-5xl sm:text-6xl">{t('success')}</h1>
      {sp.o && <p className="mt-4 text-muted font-mono">{t('orderNumber')}: {sp.o}</p>}
      <Link href={'/drops' as any} className="btn-ghost mt-10">←</Link>
    </div>
  );
}
