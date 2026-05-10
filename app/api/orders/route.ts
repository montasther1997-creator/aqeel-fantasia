import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { genOrderNumber } from '@/lib/utils';
import { getCustomer } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, country, governorate, city, area, street, details, notes, currency, items, discount, shipping } = body;
    if (!items?.length || !name || !phone || !governorate || !city) {
      return NextResponse.json({ ok: false, error: 'missing-fields' }, { status: 400 });
    }
    const me = await getCustomer();
    const number = genOrderNumber();

    const subIQD = items.reduce((n: number, x: any) => n + x.priceIQD * x.qty, 0);
    const subUSD = items.reduce((n: number, x: any) => n + x.priceUSD * x.qty, 0);
    const sub = currency === 'IQD' ? subIQD : subUSD;
    const disc = discount?.discount || 0;
    const ship = shipping ? (currency === 'IQD' ? shipping.priceIQD : shipping.priceUSD) : 0;
    const total = Math.max(0, sub - disc + ship);

    const order = await prisma.order.create({
      data: {
        number,
        customerId: me?.id,
        guestName: me ? null : name,
        guestPhone: me ? null : phone,
        guestEmail: me ? null : (email || null),
        currency: currency || 'IQD',
        subtotal: sub,
        shipping: ship,
        discount: disc,
        total,
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: 'cod',
        notes: notes || null,
        shipAddress: JSON.stringify({ name, phone, email, country, governorate, city, area, street, details, shippingZone: shipping?.name, discountCode: discount?.code }),
        items: {
          create: items.map((it: any) => ({
            productId: it.productId,
            variantId: it.variantId || null,
            nameAr: it.nameAr, nameEn: it.nameEn,
            image: it.image || null, size: it.size || null, color: it.color || null,
            qty: it.qty,
            priceIQD: it.priceIQD, priceUSD: it.priceUSD,
            totalIQD: it.priceIQD * it.qty, totalUSD: it.priceUSD * it.qty,
          })),
        },
      },
    });

    if (discount?.code) {
      await prisma.discount.update({ where: { code: discount.code }, data: { usedCount: { increment: 1 } } }).catch(() => {});
    }

    if (me?.id) {
      await prisma.customer.update({
        where: { id: me.id },
        data: { totalSpent: { increment: total } },
      });
    }

    return NextResponse.json({ ok: true, number: order.number, id: order.id });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
