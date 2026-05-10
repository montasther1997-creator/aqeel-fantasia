import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await getAdmin();
  if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  if (a.role !== 'superadmin') return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  const { id } = await params;
  if (id === a.id) return NextResponse.json({ ok: false, error: 'cannot-delete-self' }, { status: 400 });
  await prisma.adminUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
