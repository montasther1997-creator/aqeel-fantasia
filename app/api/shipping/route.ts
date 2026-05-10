import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { governorate } = await req.json();
    if (!governorate) return NextResponse.json({ ok: false }, { status: 400 });
    const zones = await prisma.shippingZone.findMany({ where: { active: true } });
    const zone = zones.find((z) => {
      try {
        const govs: string[] = JSON.parse(z.governorates);
        return govs.includes(governorate);
      } catch { return false; }
    });
    if (!zone) return NextResponse.json({ ok: true, priceIQD: 10000, priceUSD: 8, etaDays: '3-5', name: 'Default' });
    return NextResponse.json({ ok: true, priceIQD: zone.priceIQD, priceUSD: zone.priceUSD, etaDays: zone.etaDays, name: zone.nameEn });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
