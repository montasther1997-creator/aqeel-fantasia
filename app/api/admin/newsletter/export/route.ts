import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

function csvEscape(v: string) {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return '"' + v.replace(/"/g, '""') + '"';
  }
  return v;
}

export async function GET() {
  const admin = await apiRequireAdmin();
  if (isAdminResponse(admin)) return admin;
  const subs = await prisma.newsletterSub.findMany({ orderBy: { createdAt: 'desc' } });
  const rows = [
    ['contact', 'type', 'active', 'createdAt'].join(','),
    ...subs.map((s) => [
      csvEscape(s.contact),
      csvEscape(s.type),
      s.active ? 'true' : 'false',
      s.createdAt.toISOString(),
    ].join(',')),
  ];
  return new Response(rows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="newsletter-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
