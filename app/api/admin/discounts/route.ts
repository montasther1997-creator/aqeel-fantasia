import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { DiscountAdminSchema, zodError } from '@/lib/validators';

export async function POST(req: Request) {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;
  const parsed = DiscountAdminSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  const d: any = { ...parsed.data, code: parsed.data.code.toUpperCase() };
  if (d.startsAt) d.startsAt = new Date(d.startsAt);
  if (d.endsAt) d.endsAt = new Date(d.endsAt);
  try {
    const x = await prisma.discount.create({ data: d });
    return NextResponse.json({ ok: true, id: x.id });
  } catch (e: any) {
    if (e?.code === 'P2002') return NextResponse.json({ ok: false, error: 'duplicate-code' }, { status: 409 });
    return NextResponse.json({ ok: false, error: 'create-failed' }, { status: 400 });
  }
}
