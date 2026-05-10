import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'mp3', 'wav'] as const;
const ALLOWED_MIMES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm',
  'audio/mpeg', 'audio/wav', 'audio/x-wav',
] as const;
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const MAX_FILES_PER_REQUEST = 10;

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    const form = await req.formData();
    const files = form.getAll('files').filter((f) => f instanceof File) as File[];
    if (!files.length) return NextResponse.json({ ok: false, error: 'no-files' }, { status: 400 });
    if (files.length > MAX_FILES_PER_REQUEST) return NextResponse.json({ ok: false, error: 'too-many-files' }, { status: 400 });

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];
    for (const file of files) {
      // SECURITY: validate size
      if (file.size > MAX_FILE_SIZE) return NextResponse.json({ ok: false, error: 'file-too-large' }, { status: 400 });
      if (file.size === 0) continue;

      // SECURITY: validate MIME type
      if (!ALLOWED_MIMES.includes(file.type as any)) {
        return NextResponse.json({ ok: false, error: 'invalid-mime', got: file.type }, { status: 400 });
      }

      // SECURITY: validate extension whitelist
      const rawExt = (file.name.split('.').pop() || '').toLowerCase();
      if (!ALLOWED_EXTS.includes(rawExt as any)) {
        return NextResponse.json({ ok: false, error: 'invalid-extension' }, { status: 400 });
      }

      const buf = Buffer.from(await file.arrayBuffer());
      const fname = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${rawExt}`;
      await writeFile(path.join(uploadDir, fname), buf);
      const url = `/uploads/${fname}`;
      urls.push(url);
      const type = file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image';
      await prisma.mediaAsset.create({ data: { url, type, size: file.size } });
    }
    return NextResponse.json({ ok: true, urls });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: 'upload-failed' }, { status: 500 });
  }
}
