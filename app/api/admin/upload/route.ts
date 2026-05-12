import { NextResponse } from 'next/server';
import { apiRequireAdmin, isAdminResponse } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { uploadToStorage } from '@/lib/storage';
import { rateLimit, getIp } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'mp3', 'wav'];
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'audio/x-wav'];
const MAX_IMAGE_SIZE = 25 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_AUDIO_SIZE = 25 * 1024 * 1024;
const MAX_FILES = 10;

export async function POST(req: Request) {
  // Even admin uploads need rate-limit: prevents a compromised admin token
  // from saturating storage bandwidth or running up storage costs.
  if (!rateLimit(`upload:${getIp(req)}`, 20, 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate-limit' }, { status: 429 });
  }
  const admin = await apiRequireAdmin(['admin', 'superadmin', 'editor']);
  if (isAdminResponse(admin)) return admin;

  try {
    const form = await req.formData();
    const files = form.getAll('files').filter((f) => f instanceof File) as File[];
    if (!files.length) return NextResponse.json({ ok: false, error: 'no-files' }, { status: 400 });
    if (files.length > MAX_FILES) return NextResponse.json({ ok: false, error: 'too-many-files' }, { status: 400 });

    const urls: string[] = [];
    for (const file of files) {
      if (file.size === 0) continue;
      if (!ALLOWED_MIMES.includes(file.type)) return NextResponse.json({ ok: false, error: 'invalid-mime' }, { status: 400 });
      const sizeLimit = file.type.startsWith('video') ? MAX_VIDEO_SIZE : file.type.startsWith('audio') ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > sizeLimit) return NextResponse.json({ ok: false, error: 'file-too-large' }, { status: 400 });
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      if (!ALLOWED_EXTS.includes(ext)) return NextResponse.json({ ok: false, error: 'invalid-extension' }, { status: 400 });

      const url = await uploadToStorage(file, file.type.startsWith('video') ? 'videos' : file.type.startsWith('audio') ? 'audio' : 'images');
      urls.push(url);
      const type = file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image';
      await prisma.mediaAsset.create({ data: { url, type, size: file.size } });
    }
    return NextResponse.json({ ok: true, urls });
  } catch (e: any) {
    console.error('upload:', e.message);
    return NextResponse.json({ ok: false, error: 'upload-failed' }, { status: 500 });
  }
}
