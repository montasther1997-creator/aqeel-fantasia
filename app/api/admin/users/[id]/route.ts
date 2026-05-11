import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin(['superadmin']);
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  if (id === admin.id) return NextResponse.json({ ok: false, error: 'cannot-delete-self' }, { status: 400 });
  await prisma.adminUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
