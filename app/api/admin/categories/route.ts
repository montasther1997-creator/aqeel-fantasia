import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const a = await getAdmin(); if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json();
  const c = await prisma.category.create({ data: { slug: b.slug, nameAr: b.nameAr, nameEn: b.nameEn } });
  return NextResponse.json({ ok: true, id: c.id });
}
