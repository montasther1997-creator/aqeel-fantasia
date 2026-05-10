import { NextResponse } from 'next/server';
import { loginAdmin } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const a = await loginAdmin(email, password);
    if (!a) return NextResponse.json({ ok: false, error: 'invalid-credentials' }, { status: 401 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
