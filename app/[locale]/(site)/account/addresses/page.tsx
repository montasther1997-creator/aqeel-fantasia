import { getCustomer } from '@/lib/auth';
import { redirect } from '@/i18n/routing';
import { prisma } from '@/lib/db';
import { AddressBook } from '@/components/site/address-book';

export default async function AddressesPage() {
  const c = await getCustomer();
  if (!c) redirect({ href: '/account/login', locale: 'ar' });
  const addresses = await prisma.address.findMany({ where: { customerId: c!.id }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });
  return (
    <div className="pt-32 pb-20 container-x">
      <h1 className="h-display text-5xl mb-10">ADDRESSES</h1>
      <AddressBook initial={addresses} />
    </div>
  );
}
