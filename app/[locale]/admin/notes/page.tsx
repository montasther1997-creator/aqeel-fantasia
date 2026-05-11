import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { NotesManager } from '@/components/admin/notes-manager';

export default async function NotesAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const [notes, products] = await Promise.all([
    prisma.atelierNote.findMany({ orderBy: { number: 'desc' } }),
    prisma.product.findMany({ where: { active: true }, select: { id: true, nameEn: true } }),
  ]);
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— EDITORIAL</p>
      <h1 className="h-display text-4xl mt-2 mb-6">Atelier Notes</h1>
      <NotesManager initial={notes} products={products} />
    </div>
  );
}
