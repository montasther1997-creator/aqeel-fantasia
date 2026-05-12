'use client';
import { useEffect } from 'react';

/**
 * Watches all elements with `.reveal-on-scroll` and adds `.in-view`
 * when they enter the viewport. Mounted once globally in the site layout.
 */
export function ScrollRevealInit() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            io.unobserve(e.target); // animate once
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -10% 0px' }
    );

    const collect = () => {
      document.querySelectorAll('.reveal-on-scroll:not(.in-view)').forEach((el) => io.observe(el));
    };

    // initial pass
    collect();

    // re-scan when route/content changes (mutation observer is lightweight)
    const mo = new MutationObserver(() => collect());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
