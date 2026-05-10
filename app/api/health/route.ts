import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const out: any = {
    env: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlPrefix: process.env.DATABASE_URL?.slice(0, 30),
      hasDirectUrl: !!process.env.DIRECT_URL,
      hasJwtSecret: !!process.env.JWT_SECRET,
      nodeVersion: process.version,
    },
  };
  try {
    const { prisma } = await import('@/lib/db');
    const count = await prisma.product.count();
    out.db = { ok: true, products: count };
  } catch (e: any) {
    out.db = {
      ok: false,
      error: e.message,
      name: e.name,
      code: e.code,
      stack: e.stack?.split('\n').slice(0, 5).join('\n'),
    };
  }
  return NextResponse.json(out);
}
