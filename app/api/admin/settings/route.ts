import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  const a = await apiRequireAdmin(['admin', 'superadmin']);
  if (isAdminResponse(a)) return a;
  const b = await req.json();
  if (!b.key || typeof b.key !== 'string' || b.key.length > 100) {
    return NextResponse.json({ ok: false, error: 'invalid-key' }, { status: 400 });
  }
  await prisma.setting.upsert({
    where: { key: b.key },
    create: { key: b.key, value: String(b.value || '').slice(0, 5000), group: b.group ? String(b.group).slice(0, 50) : null },
    update: { value: String(b.value || '').slice(0, 5000), group: b.group ? String(b.group).slice(0, 50) : null },
  });
  return NextResponse.json({ ok: true });
}
