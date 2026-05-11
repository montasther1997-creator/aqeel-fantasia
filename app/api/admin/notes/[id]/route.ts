import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await getAdmin(); if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params; const b = await req.json();
  await prisma.atelierNote.update({
    where: { id },
    data: {
      number: Number(b.number),
      textAr: String(b.textAr).slice(0, 2000),
      textEn: String(b.textEn).slice(0, 2000),
      signature: b.signature ? String(b.signature).slice(0, 50) : null,
      noteDate: b.noteDate ? new Date(b.noteDate) : undefined,
      productId: b.productId || null,
      active: Boolean(b.active),
    },
  });
  return NextResponse.json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await getAdmin(); if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  await prisma.atelierNote.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
