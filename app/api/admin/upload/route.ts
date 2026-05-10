import { NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    const form = await req.formData();
    const files = form.getAll('files') as File[];
    if (!files.length) return NextResponse.json({ ok: false, error: 'no-files' }, { status: 400 });

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];
    for (const file of files) {
      if (!file || typeof file === 'string') continue;
      const buf = Buffer.from(await file.arrayBuffer());
      const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
      const safeExt = /^[a-z0-9]{1,6}$/.test(ext) ? ext : 'bin';
      const fname = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
      await writeFile(path.join(uploadDir, fname), buf);
      const url = `/uploads/${fname}`;
      urls.push(url);
      await prisma.mediaAsset.create({
        data: { url, type: file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image', size: file.size },
      });
    }
    return NextResponse.json({ ok: true, urls });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
