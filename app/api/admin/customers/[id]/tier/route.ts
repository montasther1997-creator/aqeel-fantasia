import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { manualSetTier } from '@/lib/loyalty';
import { ManualTierSchema, zodError } from '@/lib/validators';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await apiRequireAdmin(['admin', 'superadmin']);
  if (isAdminResponse(admin)) return admin;
  const { id } = await params;
  const parsed = ManualTierSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });

  const result = await manualSetTier({
    customerId: id,
    tierId: parsed.data.tierId,
    adminId: admin.id,
    reason: parsed.data.reason,
  });
  if (!result.ok) return NextResponse.json({ ok: false, error: 'customer-not-found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
