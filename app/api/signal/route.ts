import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SignalSchema, zodError } from '@/lib/validators';
import { rateLimit, getIp } from '@/lib/ratelimit';

export async function POST(req: Request) {
  if (!rateLimit(`signal:${getIp(req)}`, 5, 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate-limit' }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = SignalSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  const contact = parsed.data.contact;
  const type = contact.includes('@') ? 'email' : 'phone';
  try {
    await prisma.newsletterSub.upsert({
      where: { contact },
      create: { contact, type },
      update: { active: true },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('signal:', e);
    return NextResponse.json({ ok: false, error: 'subscribe-failed' }, { status: 500 });
  }
}
