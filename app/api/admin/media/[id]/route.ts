import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await getAdmin(); if (!a) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const m = await prisma.mediaAsset.findUnique({ where: { id } });
  if (m?.url?.startsWith('/uploads/')) {
    try { await unlink(path.join(process.cwd(), 'public', m.url)); } catch {}
  }
  await prisma.mediaAsset.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
