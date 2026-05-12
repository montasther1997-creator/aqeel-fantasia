// Whitelisted vocabulary mirrors `messages/{ar,en}.json` → admin.orderActions.statusOpts.
// Anything outside this set falls back to a generic label so the UI doesn't
// surface raw key strings (e.g. "weird_status_from_old_migration").

export const ORDER_STATUSES = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  'unpaid', 'paid', 'refunded', 'failed',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export function normalizeOrderStatus(s: string): OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(s) ? (s as OrderStatus) : 'pending';
}

export function normalizePaymentStatus(s: string): PaymentStatus {
  return (PAYMENT_STATUSES as readonly string[]).includes(s) ? (s as PaymentStatus) : 'unpaid';
}
