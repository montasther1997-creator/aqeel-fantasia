import { NextResponse } from 'next/server';
import { getAdmin, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const a = await getAdmin();
  if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  if (a.role !== 'superadmin') return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  const b = await req.json();
  if (!b.email || !b.password || !b.name) return NextResponse.json({ ok: false, error: 'missing-fields' }, { status: 400 });
  const role = ['admin', 'superadmin', 'editor'].includes(b.role) ? b.role : 'admin';
  const password = await hashPassword(b.password);
  await prisma.adminUser.create({ data: { email: String(b.email).toLowerCase().slice(0, 200), name: String(b.name).slice(0, 200), role, password } });
  return NextResponse.json({ ok: true });
}
