import { prisma } from './db';

/**
 * Personal Stylist — simple heuristic recommendations
 * Signals (in order of importance):
 * 1. Customer's purchase history (categories, price range)
 * 2. Customer's wishlist
 * 3. Preferred size match
 * 4. Featured products fallback
 *
 * Returns up to N recommended products.
 */
export async function getStylistRecommendations(customerId: string, limit = 6): Promise<any[]> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      orders: { include: { items: { include: { product: true } } }, take: 20, orderBy: { createdAt: 'desc' } },
      wishlist: { include: { product: true }, take: 20 },
    },
  });
  if (!customer) return [];

  // Collect signals
  const purchasedIds = new Set<string>();
  const categoryScores = new Map<string, number>();
  const priceRange: number[] = [];

  for (const order of customer.orders) {
    for (const it of order.items) {
      purchasedIds.add(it.productId);
      priceRange.push(it.priceIQD);
      if (it.product.categoryId) {
        categoryScores.set(it.product.categoryId, (categoryScores.get(it.product.categoryId) || 0) + 3);
      }
    }
  }

  for (const w of customer.wishlist) {
    if (w.product.categoryId) {
      categoryScores.set(w.product.categoryId, (categoryScores.get(w.product.categoryId) || 0) + 1);
    }
  }

  // Compute price band
  const avgPrice = priceRange.length ? priceRange.reduce((a, b) => a + b, 0) / priceRange.length : 0;
  const minPrice = avgPrice * 0.5;
  const maxPrice = avgPrice * 2;

  // Pull candidates excluding purchased
  const topCategories = Array.from(categoryScores.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => id);

  const candidates = await prisma.product.findMany({
    where: {
      active: true,
      id: { notIn: Array.from(purchasedIds) },
      ...(topCategories.length ? { categoryId: { in: topCategories } } : {}),
    },
    include: { images: { take: 1, orderBy: { order: 'asc' } } },
    take: 24,
    orderBy: [{ featured: 'desc' }, { order: 'asc' }],
  });

  // Score and sort
  const scored = candidates.map((p) => {
    let score = (p.featured ? 5 : 0) + (p.isNew ? 2 : 0);
    if (p.categoryId) score += categoryScores.get(p.categoryId) || 0;
    if (avgPrice > 0 && p.priceIQD >= minPrice && p.priceIQD <= maxPrice) score += 4;
    if (customer.preferredSize && (p as any).variants?.some?.((v: any) => v.size === customer.preferredSize)) score += 3;
    return { p, score };
  });
  scored.sort((a, b) => b.score - a.score);

  let recommendations = scored.slice(0, limit).map((x) => x.p);

  // Fallback: if too few, fill with featured
  if (recommendations.length < limit) {
    const have = new Set(recommendations.map((r) => r.id));
    const filler = await prisma.product.findMany({
      where: { active: true, featured: true, id: { notIn: Array.from(have).concat(Array.from(purchasedIds)) } },
      include: { images: { take: 1 } },
      take: limit - recommendations.length,
    });
    recommendations = recommendations.concat(filler);
  }

  return recommendations;
}
