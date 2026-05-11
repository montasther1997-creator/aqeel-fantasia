import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { ContentSchema, zodError } from '@/lib/validators';

export async function POST(req: Request) {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;
  const parsed = ContentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  try {
    const c = await prisma.siteContent.upsert({
      where: { key: parsed.data.key },
      create: parsed.data as any,
      update: parsed.data as any,
    });
    return NextResponse.json({ ok: true, id: c.id });
  } catch {
    return NextResponse.json({ ok: false, error: 'save-failed' }, { status: 400 });
  }
}
