import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { ContentSchema, zodError } from '@/lib/validators';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin(['admin', 'superadmin', 'editor']);
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  const parsed = ContentSchema.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  try {
    await prisma.siteContent.update({ where: { id }, data: parsed.data as any });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'update-failed' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin(['admin', 'superadmin']);
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  await prisma.siteContent.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
