import { getAdmin, AdminPayload } from './auth';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

/** For server components / pages. */
export async function requireAdmin(locale = 'ar'): Promise<AdminPayload> {
  const admin = await getAdmin();
  if (!admin) redirect(`/${locale}/admin/login`);
  return admin!;
}

type Role = 'admin' | 'superadmin' | 'editor';

/**
 * For API routes. Returns either the admin or a Response (401/403).
 *
 * SECURITY: default scope is ['admin', 'superadmin'] — the `editor` role is
 * intentionally excluded from destructive mutations unless a route opts it in
 * explicitly. To allow editors (content-only routes), pass ['admin', 'superadmin', 'editor'].
 */
export async function apiRequireAdmin(role?: Role | Role[]): Promise<AdminPayload | NextResponse> {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const allowed = role
    ? (Array.isArray(role) ? role : [role])
    : (['admin', 'superadmin'] as Role[]);
  if (!allowed.includes(admin.role as Role)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  return admin;
}

/** Predicate helper. */
export function isAdminResponse(x: any): x is NextResponse {
  return x instanceof NextResponse;
}
