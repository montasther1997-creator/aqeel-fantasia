import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { AdminUserManager } from '@/components/admin/admin-user-manager';

export default async function UsersAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— SYSTEM</p>
      <h1 className="h-display text-4xl mt-2 mb-6">Admin Users</h1>
      <AdminUserManager initial={users} />
    </div>
  );
}
