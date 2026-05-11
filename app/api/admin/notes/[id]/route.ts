import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { NoteSchema, zodError } from '@/lib/validators';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin(['admin', 'superadmin', 'editor']);
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  const parsed = NoteSchema.partial().safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  const d: any = { ...parsed.data };
  if (d.noteDate) d.noteDate = new Date(d.noteDate);
  if (d.productId === '') d.productId = null;
  await prisma.atelierNote.update({ where: { id }, data: d });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin(['admin', 'superadmin']);
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  await prisma.atelierNote.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
