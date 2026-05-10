import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { SettingsEditor } from '@/components/admin/settings-editor';

export default async function SettingsAdmin({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireAdmin(locale);
  const items = await prisma.setting.findMany({ orderBy: [{ group: 'asc' }, { key: 'asc' }] });
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— SYSTEM</p>
      <h1 className="h-display text-4xl mt-2 mb-6">Settings</h1>
      <SettingsEditor items={items} />
    </div>
  );
}
