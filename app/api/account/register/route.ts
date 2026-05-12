import { NextResponse } from 'next/server';
import { registerCustomer } from '@/lib/auth';
import { RegisterSchema, zodError } from '@/lib/validators';
import { rateLimit, getIp } from '@/lib/ratelimit';

export async function POST(req: Request) {
  if (!rateLimit(`register:${getIp(req)}`, 5, 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate-limit' }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });

  try {
    await registerCustomer({
      phone: parsed.data.phone,
      password: parsed.data.password,
      name: parsed.data.name,
      email: parsed.data.email || undefined,
    });
    return NextResponse.json({ ok: true });
  } catch {
    // Generic error to avoid customer enumeration via phone/email existence.
    return NextResponse.json({ ok: false, error: 'register-failed' }, { status: 400 });
  }
}
