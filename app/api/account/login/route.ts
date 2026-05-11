import { NextResponse } from 'next/server';
import { loginCustomer } from '@/lib/auth';
import { LoginSchema, zodError } from '@/lib/validators';
import { rateLimit, getIp } from '@/lib/ratelimit';

export async function POST(req: Request) {
  if (!rateLimit(`login:${getIp(req)}`, 10, 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate-limit' }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });

  if (!rateLimit(`login:phone:${parsed.data.phone}`, 5, 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate-limit' }, { status: 429 });
  }

  const c = await loginCustomer(parsed.data.phone, parsed.data.password);
  if (!c) return NextResponse.json({ ok: false, error: 'invalid-credentials' }, { status: 401 });
  return NextResponse.json({ ok: true });
}
