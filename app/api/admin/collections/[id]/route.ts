import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { CollectionSchema, zodError } from '@/lib/validators';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  const parsed = CollectionSchema.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  try {
    await prisma.collection.update({ where: { id }, data: parsed.data as any });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === 'P2002') return NextResponse.json({ ok: false, error: 'duplicate-slug' }, { status: 409 });
    return NextResponse.json({ ok: false, error: 'update-failed' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin(['admin', 'superadmin']);
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  try {
    await prisma.collection.delete({ where: { id } });
  } catch {
    return NextResponse.json({ ok: false, error: 'delete-failed' }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
