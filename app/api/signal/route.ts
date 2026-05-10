import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { contact } = await req.json();
    if (!contact) return NextResponse.json({ ok: false }, { status: 400 });
    const type = contact.includes('@') ? 'email' : 'phone';
    await prisma.newsletterSub.upsert({
      where: { contact }, create: { contact, type }, update: { active: true },
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
