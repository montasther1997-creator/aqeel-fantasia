import { NextResponse } from 'next/server';
import { registerCustomer } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { phone, password, name, email } = await req.json();
    if (!phone || !password || !name) return NextResponse.json({ ok: false, error: 'missing-fields' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ ok: false, error: 'password-too-short' }, { status: 400 });
    await registerCustomer({ phone, password, name, email: email || undefined });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
