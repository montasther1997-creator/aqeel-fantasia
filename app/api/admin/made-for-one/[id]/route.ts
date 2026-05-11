import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await getAdmin(); if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params; const b = await req.json();
  await prisma.madeForOne.update({
    where: { id },
    data: {
      customerId: b.customerId || null,
      edition: b.edition || null,
      personalNote: b.personalNote || null,
      status: ['available', 'reserved', 'claimed'].includes(b.status) ? b.status : 'available',
    },
  });
  return NextResponse.json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await getAdmin(); if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  await prisma.madeForOne.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
