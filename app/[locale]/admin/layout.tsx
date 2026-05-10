import { getAdmin } from '@/lib/auth';
import { AdminShell } from '@/components/admin/shell';

export default async function AdminLayout({
  children, params,
}: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const admin = await getAdmin();
  return admin
    ? <AdminShell locale={locale} admin={admin}>{children}</AdminShell>
    : <>{children}</>;
}
