import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DiscountApplySchema, zodError } from '@/lib/validators';
import { rateLimit, getIp } from '@/lib/ratelimit';

export async function POST(req: Request) {
  if (!rateLimit(`discount:${getIp(req)}`, 20, 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate-limit' }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = DiscountApplySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  const { code, subtotal } = parsed.data;
  try {
    const d = await prisma.discount.findUnique({ where: { code: code.toUpperCase() } });
    if (!d || !d.active) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 404 });
    if (d.startsAt && new Date() < d.startsAt) return NextResponse.json({ ok: false, error: 'not-started' });
    if (d.endsAt && new Date() > d.endsAt) return NextResponse.json({ ok: false, error: 'expired' });
    if (d.maxUses && d.usedCount >= d.maxUses) return NextResponse.json({ ok: false, error: 'max-uses' });
    if (d.minSubtotal && subtotal < d.minSubtotal) return NextResponse.json({ ok: false, error: 'min-not-met', min: d.minSubtotal });
    const discount = d.type === 'percent' ? Math.round(subtotal * (d.value / 100)) : d.value;
    return NextResponse.json({ ok: true, code: d.code, type: d.type, value: d.value, discount });
  } catch (e) {
    console.error('discount:', e);
    return NextResponse.json({ ok: false, error: 'apply-failed' }, { status: 500 });
  }
}
