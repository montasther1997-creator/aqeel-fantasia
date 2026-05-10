import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { genOrderNumber } from '@/lib/utils';
import { getCustomer } from '@/lib/auth';

// SECURITY: server re-fetches authoritative prices, discount, and shipping from DB.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, country, governorate, city, area, street, details, notes, currency, items, discount: clientDiscount } = body;
    if (!Array.isArray(items) || !items.length || !name || !phone || !governorate || !city) {
      return NextResponse.json({ ok: false, error: 'missing-fields' }, { status: 400 });
    }
    if (items.length > 100) return NextResponse.json({ ok: false, error: 'too-many-items' }, { status: 400 });

    const productIds = Array.from(new Set(items.map((it: any) => String(it.productId))));
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
      include: { variants: true, images: { take: 1, orderBy: { order: 'asc' } } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const finalItems = items.map((it: any) => {
      const p = productMap.get(String(it.productId));
      if (!p) throw new Error('invalid-product');
      const variant = it.variantId ? p.variants.find((v) => v.id === it.variantId) : null;
      const qty = Math.max(1, Math.min(50, parseInt(String(it.qty ?? 1), 10) || 1));
      const priceIQD = variant?.priceIQD ?? p.priceIQD;
      const priceUSD = variant?.priceUSD ?? p.priceUSD;
      return {
        productId: p.id,
        variantId: variant?.id || null,
        nameAr: p.nameAr, nameEn: p.nameEn,
        image: p.images[0]?.url || null,
        size: variant?.size || null,
        color: variant?.color || null,
        qty,
        priceIQD, priceUSD,
        totalIQD: priceIQD * qty,
        totalUSD: priceUSD * qty,
      };
    });

    const subIQD = finalItems.reduce((n, x) => n + x.totalIQD, 0);
    const subUSD = finalItems.reduce((n, x) => n + x.totalUSD, 0);
    const cur = currency === 'USD' ? 'USD' : 'IQD';
    const sub = cur === 'IQD' ? subIQD : subUSD;

    // Discount: re-validate server-side
    let disc = 0;
    let discountCode: string | null = null;
    if (clientDiscount?.code) {
      const code = String(clientDiscount.code).toUpperCase().slice(0, 50);
      const d = await prisma.discount.findUnique({ where: { code } });
      if (
        d && d.active
        && (!d.startsAt || new Date() >= d.startsAt)
        && (!d.endsAt || new Date() <= d.endsAt)
        && (!d.maxUses || d.usedCount < d.maxUses)
        && (!d.minSubtotal || sub >= d.minSubtotal)
      ) {
        disc = d.type === 'percent' ? Math.round(sub * (d.value / 100)) : d.value;
        discountCode = d.code;
      }
    }

    // Shipping: server resolves from governorate
    let ship = 0;
    let shipName: string | null = null;
    const zones = await prisma.shippingZone.findMany({ where: { active: true } });
    const zone = zones.find((z) => {
      try { return JSON.parse(z.governorates).includes(governorate); } catch { return false; }
    });
    if (zone) {
      ship = cur === 'IQD' ? zone.priceIQD : zone.priceUSD;
      shipName = zone.nameEn;
    }

    const total = Math.max(0, sub - disc + ship);
    const me = await getCustomer();
    const number = genOrderNumber();

    const order = await prisma.order.create({
      data: {
        number,
        customerId: me?.id,
        guestName: me ? null : String(name).slice(0, 200),
        guestPhone: me ? null : String(phone).slice(0, 50),
        guestEmail: me ? null : (email ? String(email).slice(0, 200) : null),
        currency: cur,
        subtotal: sub,
        shipping: ship,
        discount: disc,
        total,
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: 'cod',
        notes: notes ? String(notes).slice(0, 1000) : null,
        shipAddress: JSON.stringify({
          name: String(name).slice(0, 200),
          phone: String(phone).slice(0, 50),
          email: email ? String(email).slice(0, 200) : null,
          country: String(country || 'Iraq').slice(0, 100),
          governorate: String(governorate).slice(0, 100),
          city: String(city).slice(0, 100),
          area: area ? String(area).slice(0, 100) : null,
          street: street ? String(street).slice(0, 200) : null,
          details: details ? String(details).slice(0, 500) : null,
          shippingZone: shipName,
          discountCode,
        }),
        items: { create: finalItems },
      },
    });

    if (discountCode) {
      await prisma.discount.update({ where: { code: discountCode }, data: { usedCount: { increment: 1 } } }).catch(() => {});
    }
    if (me?.id) {
      await prisma.customer.update({ where: { id: me.id }, data: { totalSpent: { increment: total } } });
    }

    return NextResponse.json({ ok: true, number: order.number, id: order.id });
  } catch (e: any) {
    console.error('order error:', e.message);
    return NextResponse.json({ ok: false, error: 'order-failed' }, { status: 500 });
  }
}
