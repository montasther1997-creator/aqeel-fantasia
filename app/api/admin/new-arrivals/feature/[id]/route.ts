import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { zodError } from '@/lib/validators';
import { revalidateForEntity } from '@/lib/revalidate';

const PatchSchema = z.object({ order: z.coerce.number().int().min(0).max(1000) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  const parsed = PatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  await prisma.featuredProduct.update({ where: { id }, data: { order: parsed.data.order } });
  revalidateForEntity('new-arrival');
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  await prisma.featuredProduct.delete({ where: { id } });
  revalidateForEntity('new-arrival');
  return NextResponse.json({ ok: true });
}
