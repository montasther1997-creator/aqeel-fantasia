import { NextResponse } from 'next/server';
import { getCustomer } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PreferencesSchema, zodError } from '@/lib/validators';

export async function PATCH(req: Request) {
  const c = await getCustomer();
  if (!c) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = PreferencesSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  const data: any = { ...parsed.data, onboarded: true };
  // Normalize empty strings to null
  for (const k of Object.keys(data)) if (data[k] === '') data[k] = null;
  await prisma.customer.update({ where: { id: c.id }, data });
  return NextResponse.json({ ok: true });
}
