import { NextResponse } from 'next/server';
import { loginCustomer } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();
    if (!phone || !password) return NextResponse.json({ ok: false, error: 'missing-fields' }, { status: 400 });
    const c = await loginCustomer(phone, password);
    if (!c) return NextResponse.json({ ok: false, error: 'invalid-credentials' }, { status: 401 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
