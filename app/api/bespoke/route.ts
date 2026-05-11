import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCustomer } from '@/lib/auth';
import { BespokeSchema, zodError } from '@/lib/validators';
import { rateLimit, getIp } from '@/lib/ratelimit';

export async function POST(req: Request) {
  // Per-IP throttle (5/min) and per-phone cooldown (3 in last 24h) to harden
  // the public form against spam without requiring a captcha service.
  if (!rateLimit(`bespoke:${getIp(req)}`, 5, 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate-limit' }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = BespokeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  const b = parsed.data;

  // Per-phone daily cap — 3 submissions per 24h from the same phone.
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentForPhone = await prisma.bespokeRequest.count({
    where: { phone: b.phone, createdAt: { gte: dayAgo } },
  });
  if (recentForPhone >= 3) {
    return NextResponse.json({ ok: false, error: 'phone-cooldown' }, { status: 429 });
  }

  const me = await getCustomer();
  try {
    const r = await prisma.bespokeRequest.create({
      data: {
        customerId: me?.id || null,
        name: b.name,
        phone: b.phone,
        email: b.email || null,
        city: b.city || null,
        occasion: b.occasion,
        preferredDate: b.preferredDate || null,
        fitPreference: b.fitPreference || null,
        fabricPreference: b.fabricPreference || null,
        budget: b.budget || null,
        contactMethod: b.contactMethod,
        notes: b.notes || null,
        status: 'new',
      },
    });
    return NextResponse.json({ ok: true, id: r.id });
  } catch (e) {
    console.error('bespoke error:', e);
    return NextResponse.json({ ok: false, error: 'failed' }, { status: 500 });
  }
}
