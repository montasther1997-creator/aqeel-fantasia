import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { NoteSchema, zodError } from '@/lib/validators';

export async function POST(req: Request) {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;
  const parsed = NoteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  const d = parsed.data;
  try {
    const n = await prisma.atelierNote.create({
      data: {
        number: d.number,
        textAr: d.textAr,
        textEn: d.textEn,
        signature: d.signature || null,
        noteDate: d.noteDate ? new Date(d.noteDate as any) : new Date(),
        productId: d.productId || null,
        image: d.image || null,
      },
    });
    return NextResponse.json({ ok: true, id: n.id });
  } catch (e: any) {
    if (e?.code === 'P2002') return NextResponse.json({ ok: false, error: 'duplicate-number' }, { status: 409 });
    return NextResponse.json({ ok: false, error: 'create-failed' }, { status: 400 });
  }
}
