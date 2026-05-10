'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  productId: string;
  variantId?: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  image?: string;
  size?: string;
  color?: string;
  qty: number;
  priceIQD: number;
  priceUSD: number;
};

export type Discount = { code: string; type: 'percent' | 'fixed'; value: number; discount: number } | null;
export type Shipping = { name: string; priceIQD: number; priceUSD: number; etaDays?: string } | null;

type CartState = {
  items: CartItem[];
  currency: 'IQD' | 'USD';
  discount: Discount;
  shipping: Shipping;
  setCurrency: (c: 'IQD' | 'USD') => void;
  setDiscount: (d: Discount) => void;
  setShipping: (s: Shipping) => void;
  add: (item: CartItem) => void;
  remove: (productId: string, variantId?: string) => void;
  setQty: (productId: string, qty: number, variantId?: string) => void;
  clear: () => void;
  count: () => number;
  subtotalIQD: () => number;
  subtotalUSD: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      currency: 'IQD',
      discount: null,
      shipping: null,
      setCurrency: (c) => set({ currency: c }),
      setDiscount: (d) => set({ discount: d }),
      setShipping: (s) => set({ shipping: s }),
      add: (item) =>
        set((s) => {
          const idx = s.items.findIndex(
            (x) => x.productId === item.productId && x.variantId === item.variantId
          );
          if (idx >= 0) {
            const copy = [...s.items];
            copy[idx] = { ...copy[idx], qty: copy[idx].qty + item.qty };
            return { items: copy };
          }
          return { items: [...s.items, item] };
        }),
      remove: (productId, variantId) =>
        set((s) => ({
          items: s.items.filter(
            (x) => !(x.productId === productId && x.variantId === variantId)
          ),
        })),
      setQty: (productId, qty, variantId) =>
        set((s) => ({
          items: s.items.map((x) =>
            x.productId === productId && x.variantId === variantId ? { ...x, qty: Math.max(1, qty) } : x
          ),
        })),
      clear: () => set({ items: [], discount: null, shipping: null }),
      count: () => get().items.reduce((n, x) => n + x.qty, 0),
      subtotalIQD: () => get().items.reduce((n, x) => n + x.priceIQD * x.qty, 0),
      subtotalUSD: () => get().items.reduce((n, x) => n + x.priceUSD * x.qty, 0),
    }),
    { name: 'fantasia-cart' }
  )
);
