import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const a = await getAdmin(); if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json();
  await prisma.archiveItem.create({ data: { titleEn: b.titleEn, titleAr: b.titleAr, type: b.type, cover: b.cover, descEn: b.descEn || null, descAr: b.descAr || null, media: b.media || null } });
  return NextResponse.json({ ok: true });
}
