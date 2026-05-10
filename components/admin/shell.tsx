'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard, Package, ShoppingBag, Users, FolderTree, Layers,
  FileText, Image, Palette, Mail, Tag, Truck, CreditCard, Settings, Activity, LogOut, Crown, Globe2,
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export function AdminShell({ children, locale, admin }: { children: React.ReactNode; locale: string; admin: any }) {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const base = `/${locale}/admin`;
  const isAr = locale === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const NAV = [
    { group: t('groups.overview'), items: [
      { href: '', label: t('nav.dashboard'), icon: LayoutDashboard },
      { href: '/reports', label: t('nav.reports'), icon: Activity },
    ]},
    { group: t('groups.catalog'), items: [
      { href: '/products', label: t('nav.products'), icon: Package },
      { href: '/categories', label: t('nav.categories'), icon: FolderTree },
      { href: '/collections', label: t('nav.collections'), icon: Layers },
    ]},
    { group: t('groups.sales'), items: [
      { href: '/orders', label: t('nav.orders'), icon: ShoppingBag },
      { href: '/customers', label: t('nav.customers'), icon: Users },
      { href: '/discounts', label: t('nav.discounts'), icon: Tag },
    ]},
    { group: t('groups.community'), items: [
      { href: '/cult', label: t('nav.cult'), icon: Crown },
      { href: '/newsletter', label: t('nav.newsletter'), icon: Mail },
    ]},
    { group: t('groups.content'), items: [
      { href: '/content', label: t('nav.siteContent'), icon: FileText },
      { href: '/archive', label: t('nav.archive'), icon: Image },
      { href: '/media', label: t('nav.media'), icon: Image },
      { href: '/appearance', label: t('nav.appearance'), icon: Palette },
    ]},
    { group: t('groups.store'), items: [
      { href: '/shipping', label: t('nav.shipping'), icon: Truck },
      { href: '/payments', label: t('nav.payments'), icon: CreditCard },
    ]},
    { group: t('groups.system'), items: [
      { href: '/users', label: t('nav.users'), icon: Users },
      { href: '/activity', label: t('nav.activity'), icon: Activity },
      { href: '/languages', label: t('nav.languages'), icon: Globe2 },
      { href: '/settings', label: t('nav.settings'), icon: Settings },
    ]},
  ];

  return (
    <div className="min-h-screen flex bg-bg-primary text-frost" dir={dir}>
      <aside className={`w-64 shrink-0 hidden lg:flex flex-col bg-bg-secondary/60 backdrop-blur-xl ${isAr ? 'border-l' : 'border-r'} border-line h-screen sticky top-0 z-30 overflow-y-auto`}>
        <div className="p-6 border-b border-line">
          <Logo />
          <p className="text-[9px] tracking-cinematic text-electric mt-1">{t('controlRoom').toUpperCase()}</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {NAV.map((g) => (
            <div key={g.group} className="mb-4">
              <p className="text-[9px] tracking-cinematic text-muted px-3 mb-2">{g.group}</p>
              {g.items.map((item) => {
                const Icon = item.icon;
                const href = `${base}${item.href}`;
                const active = pathname === href || (item.href && pathname.startsWith(href));
                return (
                  <Link key={href} href={href} prefetch={false}
                    className={`relative flex items-center gap-3 px-3 py-2 text-sm transition-all cursor-pointer rounded-sm ${
                      active
                        ? `bg-frost/10 text-frost ${isAr ? 'border-r-2' : 'border-l-2'} border-electric`
                        : 'text-muted hover:text-frost hover:bg-white/[0.06]'
                    }`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-line">
          <p className="text-xs text-frost">{admin.name}</p>
          <p className="text-[10px] text-muted">{admin.email}</p>
          <form action="/api/admin/logout" method="post" className="mt-3">
            <button className="text-xs text-muted hover:text-frost flex items-center gap-2"><LogOut className="w-3 h-3" /> {t('logout')}</button>
          </form>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <main className="p-6 lg:p-10 max-w-[1400px]">{children}</main>
      </div>
    </div>
  );
}
