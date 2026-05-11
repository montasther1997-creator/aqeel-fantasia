import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

/**
 * Minimal public health: only "ok" + 1-bit DB reachability.
 * Detailed diagnostics (env presence, prisma error codes, stack) require
 * superadmin auth so attackers can't enumerate infrastructure.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const detail = url.searchParams.get('detail') === '1';

  if (!detail) {
    try {
      const { prisma } = await import('@/lib/db');
      await prisma.$queryRaw`SELECT 1`;
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ ok: false }, { status: 503 });
    }
  }

  const admin = await apiRequireAdmin(['superadmin']);
  if (isAdminResponse(admin)) return admin;

  const out: any = {
    env: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasDirectUrl: !!process.env.DIRECT_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
      nodeVersion: process.version,
    },
  };
  try {
    const { prisma } = await import('@/lib/db');
    const count = await prisma.product.count();
    out.db = { ok: true, products: count };
  } catch (e: any) {
    out.db = { ok: false, error: e.message, code: e.code };
  }
  return NextResponse.json(out);
}
