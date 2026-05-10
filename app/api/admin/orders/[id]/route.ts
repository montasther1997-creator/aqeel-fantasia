import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const b = await req.json();
  await prisma.order.update({
    where: { id },
    data: { status: b.status, paymentStatus: b.paymentStatus, trackingCode: b.trackingCode || null },
  });
  await prisma.activityLog.create({ data: { adminId: admin.id, action: 'update', entity: 'order', entityId: id, details: b.status } });
  return NextResponse.json({ ok: true });
}
