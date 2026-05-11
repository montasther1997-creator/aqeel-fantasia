import { getCustomer } from '@/lib/auth';
import { redirect } from '@/i18n/routing';
import { prisma } from '@/lib/db';
import { AddressBook } from '@/components/atelier/address-book';

export default async function AddressesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const me = await getCustomer();
  if (!me) redirect({ href: '/auth', locale });

  const addresses = await prisma.address.findMany({
    where: { customerId: me!.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return (
    <div className="pt-20 md:pt-32 pb-20">
      <div className="container-x max-w-4xl">
        <header className={`mb-12 ${isAr ? 'text-right' : 'text-left'}`}>
          <div className="text-[10px] tracking-[0.3em] uppercase text-fg-tertiary mb-3" style={isAr ? { letterSpacing: 0, textTransform: 'none' } : {}}>
            {isAr ? 'العناوين' : 'ADDRESSES'}
          </div>
          <h1 className="serif text-5xl md:text-7xl font-light" style={isAr ? { fontFamily: 'var(--serif-ar)' } : { letterSpacing: '-0.02em' }}>
            {isAr ? 'عناويني.' : 'My addresses.'}
          </h1>
        </header>

        <AddressBook initial={addresses} />
      </div>
    </div>
  );
}
