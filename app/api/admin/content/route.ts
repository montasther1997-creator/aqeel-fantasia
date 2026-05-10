import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const a = await getAdmin(); if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json();
  await prisma.siteContent.upsert({
    where: { key: b.key },
    create: { key: b.key, valueEn: b.valueEn || '', valueAr: b.valueAr || '', group: b.group || null, type: b.type || 'text' },
    update: { valueEn: b.valueEn, valueAr: b.valueAr, group: b.group, type: b.type },
  });
  return NextResponse.json({ ok: true });
}
