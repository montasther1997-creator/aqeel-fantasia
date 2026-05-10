import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();
    if (!code) return NextResponse.json({ ok: false, error: 'no-code' }, { status: 400 });
    const d = await prisma.discount.findUnique({ where: { code: String(code).toUpperCase() } });
    if (!d || !d.active) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 404 });
    if (d.startsAt && new Date() < d.startsAt) return NextResponse.json({ ok: false, error: 'not-started' });
    if (d.endsAt && new Date() > d.endsAt) return NextResponse.json({ ok: false, error: 'expired' });
    if (d.maxUses && d.usedCount >= d.maxUses) return NextResponse.json({ ok: false, error: 'max-uses' });
    if (d.minSubtotal && subtotal < d.minSubtotal) return NextResponse.json({ ok: false, error: 'min-not-met', min: d.minSubtotal });
    const discount = d.type === 'percent' ? Math.round(subtotal * (d.value / 100)) : d.value;
    return NextResponse.json({ ok: true, code: d.code, type: d.type, value: d.value, discount });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
