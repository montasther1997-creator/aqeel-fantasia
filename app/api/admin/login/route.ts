import { NextResponse } from 'next/server';
import { loginAdmin } from '@/lib/auth';
import { AdminLoginSchema, zodError } from '@/lib/validators';
import { rateLimit, getIp } from '@/lib/ratelimit';

export async function POST(req: Request) {
  if (!rateLimit(`admin-login:${getIp(req)}`, 10, 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate-limit' }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = AdminLoginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });

  if (!rateLimit(`admin-login:email:${parsed.data.email}`, 5, 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate-limit' }, { status: 429 });
  }

  const a = await loginAdmin(parsed.data.email, parsed.data.password);
  if (!a) return NextResponse.json({ ok: false, error: 'invalid-credentials' }, { status: 401 });
  return NextResponse.json({ ok: true });
}
