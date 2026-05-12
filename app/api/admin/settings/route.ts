import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { zodError } from '@/lib/validators';
import { revalidateForEntity } from '@/lib/revalidate';

// Keys that affect store economics — only superadmin may write these.
const SUPERADMIN_PREFIXES = ['loyalty.', 'shipping.', 'payments.'];

// Allowlist of editable groups. Anything outside this set is rejected.
const ALLOWED_GROUPS = new Set([
  'about', 'branches', 'social', 'shipping', 'loyalty',
  'payments', 'appearance', 'general', 'misc',
  // CMS-style groups used by content editor reside in SiteContent, not here.
]);

// Allowlist of editable key prefixes. Each prefix is a flat namespace
// for friendly settings — branches are keyed like branch.<n>.<field>.
const ALLOWED_KEY_PATTERNS: RegExp[] = [
  /^about\.(founder_(ar|en)|story_(ar|en)|foundedYear|foundedCity_(ar|en))$/,
  /^branch\.\d{1,3}\.(address_ar|address_en|phone|hours|name_ar|name_en)$/,
  /^social\.(instagram|whatsapp|tiktok|email|twitter|facebook|youtube)$/,
  /^shipping\.(freeThresholdIQD|codFeeIQD)$/,
  /^loyalty\.(iqdPerPoint|pointsPerUSD)$/,
  /^payments\.[a-z]+\.enabled$/,
  /^appearance\.(heroVideoUrl|logoUrl|faviconUrl|brandTagline(Ar)?|primaryAccent|heroOverlayOpacity)$/,
  /^appearance\.background\.(enabled|type|intensity)$/,
  /^appearance\.topNav3d\.(enabled|intensity)$/,
  /^intro\.(enabled|durationSeconds)$/,
  /^newArrivals\.(enabled|heading_ar|heading_en|autoCount)$/,
];

const SettingPostSchema = z.object({
  key: z.string().trim().min(1).max(100),
  value: z.string().max(5000),
  group: z.string().trim().min(1).max(50).optional().nullable(),
});

function keyIsAllowed(key: string): boolean {
  return ALLOWED_KEY_PATTERNS.some((rx) => rx.test(key));
}

function needsSuperadmin(key: string): boolean {
  return SUPERADMIN_PREFIXES.some((p) => key.startsWith(p));
}

export async function POST(req: Request) {
  // Default: any admin or superadmin (not editor)
  let admin = await apiRequireAdmin(['admin', 'superadmin']);
  if (isAdminResponse(admin)) return admin;

  const body = await req.json().catch(() => null);
  const parsed = SettingPostSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(zodError(parsed), { status: 400 });

  const { key, value, group } = parsed.data;

  if (!keyIsAllowed(key)) {
    return NextResponse.json({ ok: false, error: 'key-not-allowed' }, { status: 400 });
  }
  if (group && !ALLOWED_GROUPS.has(group)) {
    return NextResponse.json({ ok: false, error: 'group-not-allowed' }, { status: 400 });
  }

  // Business-critical keys (economics) require superadmin
  if (needsSuperadmin(key) && admin.role !== 'superadmin') {
    return NextResponse.json({ ok: false, error: 'requires-superadmin' }, { status: 403 });
  }

  await prisma.setting.upsert({
    where: { key },
    create: { key, value, group: group || null },
    update: { value, group: group || null },
  });
  revalidateForEntity('setting');
  return NextResponse.json({ ok: true });
}
