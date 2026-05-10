import { NextResponse } from 'next/server';
import { logoutAdmin } from '@/lib/auth';

export async function POST() {
  await logoutAdmin();
  return NextResponse.redirect(new URL('/ar/admin/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}
