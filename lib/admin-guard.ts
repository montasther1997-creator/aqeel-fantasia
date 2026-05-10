import { getAdmin } from './auth';
import { redirect } from 'next/navigation';

export async function requireAdmin(locale = 'ar') {
  const admin = await getAdmin();
  if (!admin) redirect(`/${locale}/admin/login`);
  return admin!;
}
