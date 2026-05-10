import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const a = await getAdmin(); if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json();
  await prisma.setting.upsert({
    where: { key: b.key },
    create: { key: b.key, value: b.value || '', group: b.group || null },
    update: { value: b.value, group: b.group },
  });
  return NextResponse.json({ ok: true });
}
