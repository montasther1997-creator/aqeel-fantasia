import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { HeroSlideSchema, zodError } from '@/lib/validators';

export async function GET() {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;
  const slides = await prisma.heroSlide.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] });
  return NextResponse.json({ ok: true, slides });
}

export async function POST(req: Request) {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;
  const parsed = HeroSlideSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  const s = await prisma.heroSlide.create({ data: parsed.data as any });
  return NextResponse.json({ ok: true, id: s.id });
}
