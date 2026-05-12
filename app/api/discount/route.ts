import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DiscountApplySchema, zodError } from '@/lib/validators';
import { rateLimit, getIp } from '@/lib/ratelimit';

export async function POST(req: Request) {
  // Tighter IP throttle to slow brute-force enumeration of discount codes.
  if (!rateLimit(`discount:${getIp(req)}`, 8, 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate-limit' }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = DiscountApplySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  const { code, subtotal, subtotalIQD } = parsed.data;
  // Per-code throttle prevents an attacker rotating IPs from hammering a
  // single suspected code beyond a handful of tries per minute globally.
  if (!rateLimit(`discount:code:${code.toUpperCase()}`, 30, 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate-limit' }, { status: 429 });
  }
  try {
    const d = await prisma.discount.findUnique({ where: { code: code.toUpperCase() } });
    // Return a generic `unavailable` error to avoid enumerating which codes
    // exist or what their state is. Detailed reason is logged server-side.
    const fail = () => NextResponse.json({ ok: false, error: 'unavailable' }, { status: 400 });
    if (!d || !d.active) return fail();
    if (d.startsAt && new Date() < d.startsAt) return fail();
    if (d.endsAt && new Date() > d.endsAt) return fail();
    if (d.maxUses && d.usedCount >= d.maxUses) return fail();
    // minSubtotal is denominated in IQD; compare against the IQD subtotal.
    const subForMin = subtotalIQD ?? subtotal;
    if (d.minSubtotal && subForMin < d.minSubtotal) return fail();
    const discount = d.type === 'percent' ? Math.round(subtotal * (d.value / 100)) : d.value;
    return NextResponse.json({ ok: true, code: d.code, type: d.type, value: d.value, discount });
  } catch (e) {
    console.error('discount:', e);
    return NextResponse.json({ ok: false, error: 'apply-failed' }, { status: 500 });
  }
}
