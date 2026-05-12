import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { HeroSlideSchema, zodError } from '@/lib/validators';
import { revalidateForEntity } from '@/lib/revalidate';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  const parsed = HeroSlideSchema.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  await prisma.heroSlide.update({ where: { id }, data: parsed.data as any });
  revalidateForEntity('slide');
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  await prisma.heroSlide.delete({ where: { id } });
  revalidateForEntity('slide');
  return NextResponse.json({ ok: true });
}
