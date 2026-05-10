'use client';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Price } from '@/components/ui/price';
import { Heart } from 'lucide-react';

export function WishlistGrid({ items }: { items: any[] }) {
  const router = useRouter();
  const locale = useLocale() as 'ar' | 'en';
  const remove = async (productId: string) => {
    await fetch('/api/account/wishlist', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ productId }) });
    router.refresh();
  };
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((w) => (
        <div key={w.id} className="relative">
          <Link href={`/drops/${w.product.slug}` as any} className="block group">
            <div className="aspect-[3/4] bg-bg-secondary overflow-hidden">
              <img src={w.product.images[0]?.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <h3 className="mt-3 text-sm tracking-cinematic uppercase">{locale === 'ar' ? w.product.nameAr : w.product.nameEn}</h3>
            <Price iqd={w.product.priceIQD} usd={w.product.priceUSD} className="text-sm" />
          </Link>
          <button onClick={() => remove(w.product.id)} className="absolute top-2 right-2 rtl:left-2 rtl:right-auto w-8 h-8 grid place-items-center glass rounded-full hover:text-blood">
            <Heart className="w-4 h-4 fill-current" />
          </button>
        </div>
      ))}
    </div>
  );
}
