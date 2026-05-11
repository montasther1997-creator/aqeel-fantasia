import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { DiscountAdminSchema, zodError } from '@/lib/validators';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  const parsed = DiscountAdminSchema.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  const d: any = { ...parsed.data };
  if (d.code) d.code = String(d.code).toUpperCase();
  if (d.startsAt) d.startsAt = new Date(d.startsAt);
  if (d.endsAt) d.endsAt = new Date(d.endsAt);
  await prisma.discount.update({ where: { id }, data: d });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin(['admin', 'superadmin']);
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  await prisma.discount.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
