import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { CategorySchema, zodError } from '@/lib/validators';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = CategorySchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  try {
    await prisma.category.update({ where: { id }, data: parsed.data as any });
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
    await prisma.category.delete({ where: { id } });
  } catch (e: any) {
    if (e?.code === 'P2003') return NextResponse.json({ ok: false, error: 'has-products' }, { status: 409 });
    return NextResponse.json({ ok: false, error: 'delete-failed' }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
