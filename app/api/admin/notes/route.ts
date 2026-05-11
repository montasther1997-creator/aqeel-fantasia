import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const a = await getAdmin(); if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json();
  await prisma.atelierNote.create({
    data: {
      number: Number(b.number),
      textAr: String(b.textAr).slice(0, 2000),
      textEn: String(b.textEn).slice(0, 2000),
      signature: b.signature ? String(b.signature).slice(0, 50) : null,
      noteDate: b.noteDate ? new Date(b.noteDate) : new Date(),
      productId: b.productId || null,
    },
  });
  return NextResponse.json({ ok: true });
}
