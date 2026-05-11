import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { genOrderNumber } from '@/lib/utils';
import { getCustomer } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { rateLimit } from '@/lib/ratelimit';

/**
 * Order creation — fully atomic.
 * - All prices re-fetched server-side
 * - Stock decremented atomically (fails if insufficient)
 * - Discount usedCount incremented atomically (fails if exhausted)
 * - Customer totalSpent in same transaction
 */
export async function POST(req: Request) {
  // Rate limit: 10 orders/min per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (!rateLimit(`orders:${ip}`, 10, 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate-limit' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { name, phone, email, country, governorate, city, area, street, details, notes, currency, items, discount: clientDiscount } = body;

    if (!Array.isArray(items) || !items.length || !name || !phone || !governorate || !city) {
      return NextResponse.json({ ok: false, error: 'missing-fields' }, { status: 400 });
    }
    if (items.length > 100) {
      return NextResponse.json({ ok: false, error: 'too-many-items' }, { status: 400 });
    }

    const productIds = Array.from(new Set(items.map((it: any) => String(it.productId))));
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
      include: { variants: true, images: { take: 1, orderBy: { order: 'asc' } } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Compute final items + check stock availability (pre-transaction)
    const finalItems: any[] = [];
    const stockUpdates: { productId: string; variantId: string | null; qty: number }[] = [];

    for (const it of items) {
      const p = productMap.get(String(it.productId));
      if (!p) throw new Error('invalid-product');
      const variant = it.variantId ? p.variants.find((v) => v.id === it.variantId) : null;
      const qty = Math.max(1, Math.min(50, parseInt(String(it.qty ?? 1), 10) || 1));
      const priceIQD = variant?.priceIQD ?? p.priceIQD;
      const priceUSD = variant?.priceUSD ?? p.priceUSD;
      finalItems.push({
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
      });
      stockUpdates.push({ productId: p.id, variantId: variant?.id || null, qty });
    }

    const subIQD = finalItems.reduce((n, x) => n + x.totalIQD, 0);
    const subUSD = finalItems.reduce((n, x) => n + x.totalUSD, 0);
    const cur = currency === 'USD' ? 'USD' : 'IQD';
    const sub = cur === 'IQD' ? subIQD : subUSD;

    // Resolve shipping (read-only)
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

    const me = await getCustomer();
    const number = genOrderNumber();

    // Execute everything in ONE transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Atomic stock decrement (fails if any product has insufficient stock)
      for (const { productId, variantId, qty } of stockUpdates) {
        if (variantId) {
          const updated = await tx.productVariant.updateMany({
            where: { id: variantId, stock: { gte: qty } },
            data: { stock: { decrement: qty } },
          });
          if (updated.count === 0) {
            throw new Error(`out-of-stock:variant:${variantId}`);
          }
        } else {
          const updated = await tx.product.updateMany({
            where: { id: productId, trackStock: true, stock: { gte: qty } },
            data: { stock: { decrement: qty } },
          });
          // If trackStock is false, updateMany affects 0 — OK; only error if trackStock true + insufficient
          if (updated.count === 0) {
            const p = await tx.product.findUnique({ where: { id: productId } });
            if (p?.trackStock) throw new Error(`out-of-stock:product:${productId}`);
          }
        }
      }

      // 2. Atomic discount validation + increment
      let disc = 0;
      let discountCode: string | null = null;
      if (clientDiscount?.code) {
        const code = String(clientDiscount.code).toUpperCase().slice(0, 50);
        const d = await tx.discount.findUnique({ where: { code } });
        if (
          d && d.active
          && (!d.startsAt || new Date() >= d.startsAt)
          && (!d.endsAt || new Date() <= d.endsAt)
          && (!d.minSubtotal || sub >= d.minSubtotal)
        ) {
          // Atomic increment with maxUses check
          const incremented = await tx.discount.updateMany({
            where: {
              code,
              active: true,
              OR: [{ maxUses: null }, { usedCount: { lt: d.maxUses || 999999999 } }],
            },
            data: { usedCount: { increment: 1 } },
          });
          if (incremented.count > 0) {
            disc = d.type === 'percent' ? Math.round(sub * (d.value / 100)) : d.value;
            discountCode = d.code;
          }
        }
      }

      const total = Math.max(0, sub - disc + ship);

      // 3. Create order with items
      const created = await tx.order.create({
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

      // 4. Update customer totalSpent
      if (me?.id) {
        await tx.customer.update({
          where: { id: me.id },
          data: { totalSpent: { increment: total } },
        });
      }

      return created;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });

    return NextResponse.json({ ok: true, number: order.number, id: order.id });
  } catch (e: any) {
    console.error('order error:', e.message);
    if (e.message?.startsWith('out-of-stock')) {
      return NextResponse.json({ ok: false, error: 'out-of-stock' }, { status: 409 });
    }
    if (e.message === 'invalid-product') {
      return NextResponse.json({ ok: false, error: 'invalid-product' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: 'order-failed' }, { status: 500 });
  }
}
