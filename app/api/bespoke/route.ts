import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCustomer } from '@/lib/auth';
import { BespokeSchema, zodError } from '@/lib/validators';
import { rateLimit, getIp } from '@/lib/ratelimit';

export async function POST(req: Request) {
  if (!rateLimit(`bespoke:${getIp(req)}`, 5, 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate-limit' }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = BespokeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  const b = parsed.data;

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
