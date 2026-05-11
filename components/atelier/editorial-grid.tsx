'use client';
import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { Editorial } from './editorial';
import { fmtNumber } from '@/lib/utils';

/**
 * Editorial Mix Grid — Vogue-style asymmetric layout
 * Pattern (rows of 12-col grid):
 * Row 1: 3 small (4-col each)         + 1 quote (12-col)
 * Row 2: 1 big (8-col) + 2 small (each 4-col stacked)
 * Row 3: 4 small (3-col each)
 * Row 4: 2 small (3-col) + 1 big (6-col)
 * Repeats every 8 products
 */
export function EditorialMixGrid({ products }: { products: any[] }) {
  const locale = useLocale() as 'ar' | 'en';
  const isAr = locale === 'ar';

  // Editorial captions interleaved with products
  const captions = [
    { eyeAr: 'كتاب المظاهر · بابل', eyeEn: 'LOOKBOOK · BABYLON', titleAr: 'الساعة السابعة عشرة.', titleEn: 'Hour seventeen.' },
    { eyeAr: 'بغداد · عند الفجر', eyeEn: 'BAGHDAD · AT DAWN', titleAr: 'بدلة، بشاي.', titleEn: 'A suit, with tea.' },
    { eyeAr: 'الأرشيف · ٢٠٢٥', eyeEn: 'ARCHIVE · 2025', titleAr: 'ذاكرة قماش.', titleEn: 'Fabric memory.' },
  ];

  // Chunk products into editorial blocks (8 per cycle)
  const blocks: any[] = [];
  let i = 0;
  let captionIdx = 0;
  while (i < products.length) {
    const slice = products.slice(i, i + 8);
    blocks.push({ products: slice, caption: captions[captionIdx % captions.length] });
    i += 8;
    captionIdx++;
  }

  return (
    <div className="space-y-16 md:space-y-24">
      {blocks.map((block, bi) => (
        <Block key={bi} {...block} isAr={isAr} blockIndex={bi} />
      ))}
    </div>
  );
}

function Block({ products, caption, isAr, blockIndex }: { products: any[]; caption: any; isAr: boolean; blockIndex: number }) {
  const reverse = blockIndex % 2 === 1;
  const get = (i: number) => products[i];

  return (
    <section>
      {/* Row 1: 4 small products */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-12 md:mb-16">
        {products.slice(0, 4).map((p) => <ProductTile key={p.id} p={p} isAr={isAr} size="sm" />)}
      </div>

      {/* Row 2: big + 2 small + editorial caption */}
      {(get(4) || get(5) || get(6)) && (
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 mb-12 md:mb-16 items-start ${reverse ? 'lg:[direction:rtl]' : ''}`}>
          {/* Big product (8 cols) */}
          {get(4) && (
            <div className="lg:col-span-7 [direction:initial]">
              <ProductTile p={get(4)} isAr={isAr} size="xl" />
            </div>
          )}

          {/* Side caption + small */}
          <div className="lg:col-span-5 [direction:initial] space-y-6 md:space-y-10">
            <div className={`${isAr ? 'text-right' : 'text-left'}`}>
              <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-3" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
                {isAr ? caption.eyeAr : caption.eyeEn}
              </div>
              <h3 className="serif text-3xl md:text-5xl font-light leading-tight" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
                {isAr ? caption.titleAr : caption.titleEn}
              </h3>
            </div>
            {get(5) && <ProductTile p={get(5)} isAr={isAr} size="md" horizontal />}
            {get(6) && <ProductTile p={get(6)} isAr={isAr} size="md" horizontal />}
          </div>
        </div>
      )}

      {/* Row 3: full-bleed editorial banner */}
      {get(7) && (
        <div className="mb-12 md:mb-16">
          <Link href={`/product/${get(7).slug}` as any} className="block group" data-sound="hover">
            <div className="relative aspect-[21/9] overflow-hidden bg-bg-elevated">
              <Editorial variant="v5" ratio="auto" src={get(7).images?.[0]?.url} alt={isAr ? get(7).nameAr : get(7).nameEn} className="absolute inset-0 group-hover:scale-105 transition-transform duration-1000" />
              <div className="hero-fade absolute inset-0" />
              <div className={`absolute bottom-8 md:bottom-12 ${isAr ? 'right-8 md:right-12 text-right' : 'left-8 md:left-12 text-left'} text-pearl z-10`}>
                <div className="text-[10px] tracking-[0.3em] uppercase text-bone mb-2" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
                  {isAr ? 'إصدار محدود' : 'LIMITED EDITION'}
                </div>
                <h4 className="serif text-3xl md:text-5xl lg:text-6xl font-light leading-tight" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
                  {isAr ? get(7).nameAr : get(7).nameEn}
                </h4>
                <div className="text-bone text-sm mt-3 num">
                  <span className="num">{fmtNumber(get(7).priceIQD)}</span> {isAr ? 'د.ع' : 'IQD'}
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}
    </section>
  );
}

function ProductTile({ p, isAr, size, horizontal }: { p: any; isAr: boolean; size: 'sm' | 'md' | 'xl'; horizontal?: boolean }) {
  const name = isAr ? p.nameAr : p.nameEn;
  const meta = isAr ? p.taglineAr : p.taglineEn;
  const img = p.images?.[0]?.url;

  const aspect = size === 'xl' ? 'aspect-[4/5]' : size === 'md' ? 'aspect-[5/4]' : 'aspect-[3/4]';

  if (horizontal) {
    return (
      <Link href={`/product/${p.slug}` as any} className="block group flex gap-4 items-center" data-sound="hover">
        <div className="relative w-32 h-40 shrink-0 overflow-hidden bg-bg-elevated">
          <Editorial variant="v3" ratio="auto" src={img} alt={name} className="absolute inset-0 group-hover:scale-110 transition-transform duration-700" />
        </div>
        <div className={`flex-1 min-w-0 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="serif text-base md:text-lg" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{name}</div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-fg-tertiary mt-1 mb-2" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>{meta}</div>
          <div className="text-sm"><span className="num">{fmtNumber(p.priceIQD)}</span> <span className="text-fg-tertiary text-xs">{isAr ? 'د.ع' : 'IQD'}</span></div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/product/${p.slug}` as any} className="block group" data-sound="hover">
      <div className={`relative ${aspect} overflow-hidden bg-bg-elevated`}>
        <Editorial variant={size === 'xl' ? 'v5' : 'v2'} ratio="auto" src={img} alt={name} className="absolute inset-0 group-hover:scale-105 transition-transform duration-1000" />
        {p.isNew && (
          <span className={`absolute top-3 ${isAr ? 'right-3' : 'left-3'} bg-pearl text-onyx text-[9px] tracking-[0.2em] uppercase px-2 py-1`}>
            {isAr ? 'جديد' : 'NEW'}
          </span>
        )}
        {p.isLimited && (
          <span className={`absolute top-3 ${isAr ? 'left-3' : 'right-3'} border border-pearl/40 text-pearl text-[9px] tracking-[0.2em] uppercase px-2 py-1 backdrop-blur-sm`}>
            {isAr ? 'محدود' : 'LIMITED'}
          </span>
        )}
        <span className={`absolute bottom-3 ${isAr ? 'right-3' : 'left-3'} text-[9px] tracking-[0.3em] font-mono text-pearl/50`}>
          {p.sku || '—'}
        </span>
      </div>
      <div className={`mt-3 md:mt-4 flex items-baseline justify-between gap-2 ${isAr ? 'text-right' : 'text-left'}`}>
        <div className="min-w-0 flex-1">
          <div className="serif text-sm md:text-base truncate" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{name}</div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-fg-tertiary mt-1 truncate" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>{meta}</div>
        </div>
        <div className="text-sm shrink-0"><span className="num">{fmtNumber(p.priceIQD)}</span></div>
      </div>
    </Link>
  );
}
