import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await getAdmin(); if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params; const b = await req.json();
  await prisma.archiveItem.update({ where: { id }, data: b });
  return NextResponse.json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await getAdmin(); if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  await prisma.archiveItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
