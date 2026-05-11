import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AdminUserSchema, zodError } from '@/lib/validators';

export async function POST(req: Request) {
  const admin = await apiRequireAdmin(['superadmin']);
  if (isAdminResponse(admin)) return admin;
  const parsed = AdminUserSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });
  const { email, password, name, role } = parsed.data;
  try {
    const password_hash = await hashPassword(password);
    const a = await prisma.adminUser.create({
      data: { email: email.toLowerCase(), name, role: role || 'admin', password: password_hash },
    });
    return NextResponse.json({ ok: true, id: a.id });
  } catch (e: any) {
    if (e?.code === 'P2002') return NextResponse.json({ ok: false, error: 'duplicate-email' }, { status: 409 });
    return NextResponse.json({ ok: false, error: 'create-failed' }, { status: 400 });
  }
}
