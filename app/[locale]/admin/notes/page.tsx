import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { NotesManager } from '@/components/admin/notes-manager';
import { getTranslations } from 'next-intl/server';

export default async function NotesAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const t = await getTranslations('admin.notes');
  const [notes, products] = await Promise.all([
    prisma.atelierNote.findMany({ orderBy: { number: 'desc' } }),
    prisma.product.findMany({ where: { active: true }, select: { id: true, nameEn: true } }),
  ]);
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— {t('eyebrow')}</p>
      <h1 className="h-display text-4xl mt-2 mb-6">{t('title')}</h1>
      <NotesManager initial={notes} products={products} />
    </div>
  );
}
