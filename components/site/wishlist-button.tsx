'use client';
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

export function WishlistButton({ productId, className = '' }: { productId: string; className?: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    fetch('/api/account/wishlist').then((r) => r.json()).then((d) => {
      if (d.ok) setOn(d.items.some((x: any) => x.productId === productId));
    });
  }, [productId]);

  const toggle = async () => {
    const next = !on;
    setOn(next);
    await fetch('/api/account/wishlist', {
      method: next ? 'POST' : 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
  };

  return (
    <button onClick={toggle} className={`w-12 h-12 grid place-items-center border border-line hover:border-frost transition-colors ${className}`}>
      <Heart className={`w-4 h-4 ${on ? 'fill-blood text-blood' : ''}`} />
    </button>
  );
}
