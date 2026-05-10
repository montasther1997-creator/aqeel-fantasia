import { NextResponse } from 'next/server';
import { getAdmin, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const a = await getAdmin(); if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json();
  const password = await hashPassword(b.password);
  await prisma.adminUser.create({ data: { email: b.email.toLowerCase(), name: b.name, role: b.role || 'admin', password } });
  return NextResponse.json({ ok: true });
}
