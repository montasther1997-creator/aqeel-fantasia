import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCustomer } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (!b.name || !b.phone || !b.occasion) return NextResponse.json({ ok: false, error: 'missing-fields' }, { status: 400 });
    const me = await getCustomer();
    const data = {
      customerId: me?.id || null,
      name: String(b.name).slice(0, 200),
      phone: String(b.phone).slice(0, 50),
      email: b.email ? String(b.email).slice(0, 200) : null,
      city: b.city ? String(b.city).slice(0, 100) : null,
      occasion: String(b.occasion).slice(0, 500),
      preferredDate: b.preferredDate ? String(b.preferredDate).slice(0, 100) : null,
      fitPreference: b.fitPreference ? String(b.fitPreference).slice(0, 500) : null,
      fabricPreference: b.fabricPreference ? String(b.fabricPreference).slice(0, 500) : null,
      budget: b.budget ? String(b.budget).slice(0, 100) : null,
      contactMethod: ['whatsapp', 'phone', 'instagram'].includes(b.contactMethod) ? b.contactMethod : 'whatsapp',
      notes: b.notes ? String(b.notes).slice(0, 1000) : null,
      status: 'new',
    };
    const req2 = await prisma.bespokeRequest.create({ data });
    return NextResponse.json({ ok: true, id: req2.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'failed' }, { status: 500 });
  }
}
