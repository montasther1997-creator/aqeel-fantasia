import { getCustomer } from '@/lib/auth';
import { redirect } from '@/i18n/routing';
import { prisma } from '@/lib/db';
import { Link } from '@/i18n/routing';

export default async function MyBespokesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const me = await getCustomer();
  if (!me) redirect({ href: '/auth', locale });

  const requests = await prisma.bespokeRequest.findMany({
    where: { customerId: me!.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="pt-20 md:pt-32 pb-20">
      <div className="container-x max-w-4xl">
        <header className={`mb-12 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-3" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {isAr ? 'استفسارات التفصيل' : 'BESPOKE INQUIRIES'}
          </div>
          <h1 className="serif text-5xl md:text-7xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
            {isAr ? 'استفساراتك.' : 'Your inquiries.'}
          </h1>
        </header>

        {requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="serif italic text-fg-secondary text-lg mb-8" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>
              {isAr ? 'لا توجد استفسارات حتى الآن.' : 'No inquiries yet.'}
            </p>
            <Link href={'/bespoke' as any} className="btn btn-champagne inline-flex">
              {isAr ? 'ابدأ استفسار التفصيل' : 'Begin a bespoke inquiry'}
            </Link>
          </div>
        ) : (
          <div className="space-y-px bg-border">
            {requests.map((r) => (
              <article key={r.id} className="bg-bg p-6 md:p-8">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="serif text-xl md:text-2xl" style={isAr ? { fontFamily: 'var(--serif-ar)' } : {}}>{r.occasion}</div>
                    <div className="text-xs text-fg-tertiary mt-1 num">{new Date(r.createdAt).toLocaleString(isAr ? 'ar-IQ' : 'en-US')}</div>
                  </div>
                  <span className="text-[10px] tracking-[0.2em] uppercase border border-accent/40 text-accent px-2 py-1" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
                    {r.status}
                  </span>
                </div>
                {r.preferredDate && <p className="text-sm text-fg-secondary"><span className="text-fg-tertiary text-xs">{isAr ? 'الموعد المُفَضَّل: ' : 'Preferred date: '}</span>{r.preferredDate}</p>}
                {r.fitPreference && <p className="text-sm text-fg-secondary mt-2"><span className="text-fg-tertiary text-xs">{isAr ? 'القَصّة: ' : 'Fit: '}</span>{r.fitPreference}</p>}
                {r.fabricPreference && <p className="text-sm text-fg-secondary mt-2"><span className="text-fg-tertiary text-xs">{isAr ? 'القماش: ' : 'Fabric: '}</span>{r.fabricPreference}</p>}
                {r.notes && <p className="text-sm text-fg-secondary mt-3 serif italic" style={isAr ? { fontFamily: 'var(--serif-ar)', fontStyle: 'normal' } : {}}>«{r.notes}»</p>}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
