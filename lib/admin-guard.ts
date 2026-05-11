import { getAdmin, AdminPayload } from './auth';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

/** For server components / pages. */
export async function requireAdmin(locale = 'ar'): Promise<AdminPayload> {
  const admin = await getAdmin();
  if (!admin) redirect(`/${locale}/admin/login`);
  return admin!;
}

/** For API routes. Returns either the admin or a Response (401/403). */
export async function apiRequireAdmin(role?: 'admin' | 'superadmin' | 'editor' | Array<'admin' | 'superadmin' | 'editor'>): Promise<AdminPayload | NextResponse> {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(admin.role as any)) {
      return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
    }
  }
  return admin;
}

/** Predicate helper. */
export function isAdminResponse(x: any): x is NextResponse {
  return x instanceof NextResponse;
}
