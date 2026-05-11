import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { CollectionSchema, zodError } from '@/lib/validators';

export async function POST(req: Request) {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;
  const parsed = CollectionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  try {
    const c = await prisma.collection.create({ data: parsed.data as any });
    return NextResponse.json({ ok: true, id: c.id });
  } catch (e: any) {
    if (e?.code === 'P2002') return NextResponse.json({ ok: false, error: 'duplicate-slug' }, { status: 409 });
    return NextResponse.json({ ok: false, error: 'create-failed' }, { status: 400 });
  }
}
