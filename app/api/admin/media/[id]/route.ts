import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { deleteFromStorage } from '@/lib/storage';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await apiRequireAdmin();
  if (isAdminResponse(a)) return a;
  const { id } = await params;
  const m = await prisma.mediaAsset.findUnique({ where: { id } });
  if (m?.url?.includes('/storage/v1/object/')) {
    await deleteFromStorage(m.url);
  }
  await prisma.mediaAsset.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
