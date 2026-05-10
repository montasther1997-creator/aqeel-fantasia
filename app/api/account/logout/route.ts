import { NextResponse } from 'next/server';
import { logoutCustomer } from '@/lib/auth';

export async function POST() {
  await logoutCustomer();
  return NextResponse.redirect(new URL('/ar', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
}
