import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { MadeForOneSchema, zodError } from '@/lib/validators';

export async function POST(req: Request) {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;
  const parsed = MadeForOneSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  const d = parsed.data;
  try {
    const m = await prisma.madeForOne.create({
      data: {
        productId: d.productId,
        customerId: d.customerId || null,
        edition: d.edition || null,
        personalNote: d.personalNote || null,
        status: d.customerId ? 'reserved' : 'available',
      },
    });
    return NextResponse.json({ ok: true, id: m.id });
  } catch (e: any) {
    if (e?.code === 'P2002') return NextResponse.json({ ok: false, error: 'product-already-reserved' }, { status: 409 });
    return NextResponse.json({ ok: false, error: 'create-failed' }, { status: 400 });
  }
}
