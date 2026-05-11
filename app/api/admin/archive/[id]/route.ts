import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { ArchiveSchema, zodError } from '@/lib/validators';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin(['admin', 'superadmin', 'editor']);
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  const parsed = ArchiveSchema.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  await prisma.archiveItem.update({ where: { id }, data: parsed.data as any });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin(['admin', 'superadmin']);
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  await prisma.archiveItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
