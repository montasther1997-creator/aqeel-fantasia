import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await getAdmin(); if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  await prisma.discount.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
