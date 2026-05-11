import { NextResponse } from 'next/server';
import { getCustomer } from '@/lib/auth';
import { prisma } from '@/lib/db';

const ALLOWED = [
  'height', 'weight', 'shoulderWidth', 'chestSize', 'waistSize', 'inseam',
  'preferredSize', 'preferredColors', 'preferredStyles', 'preferredFabrics',
] as const;

export async function PATCH(req: Request) {
  const c = await getCustomer();
  if (!c) return NextResponse.json({ ok: false }, { status: 401 });
  const b = await req.json();
  const data: Record<string, any> = { onboarded: true };
  for (const k of ALLOWED) {
    if (k in b) {
      const v = b[k];
      if (['height', 'weight', 'shoulderWidth', 'chestSize', 'waistSize', 'inseam'].includes(k)) {
        data[k] = v == null || v === '' ? null : Number(v);
      } else {
        data[k] = v == null ? null : String(v).slice(0, 500);
      }
    }
  }
  await prisma.customer.update({ where: { id: c.id }, data });
  return NextResponse.json({ ok: true });
}
