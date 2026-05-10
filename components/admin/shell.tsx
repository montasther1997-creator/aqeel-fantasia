'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Package, ShoppingBag, Users, FolderTree, Layers,
  FileText, Image, Palette, Mail, Tag, Truck, CreditCard, Settings, Activity, LogOut, Crown, Globe2,
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';

const NAV = [
  { group: 'OVERVIEW', items: [
    { href: '', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/reports', label: 'Reports', icon: Activity },
  ]},
  { group: 'CATALOG', items: [
    { href: '/products', label: 'Products', icon: Package },
    { href: '/categories', label: 'Categories', icon: FolderTree },
    { href: '/collections', label: 'Collections', icon: Layers },
  ]},
  { group: 'SALES', items: [
    { href: '/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/customers', label: 'Customers', icon: Users },
    { href: '/discounts', label: 'Discounts', icon: Tag },
  ]},
  { group: 'COMMUNITY', items: [
    { href: '/cult', label: 'Cult Members', icon: Crown },
    { href: '/newsletter', label: 'Newsletter', icon: Mail },
  ]},
  { group: 'CONTENT', items: [
    { href: '/content', label: 'Site Content', icon: FileText },
    { href: '/archive', label: 'Archive', icon: Image },
    { href: '/media', label: 'Media Library', icon: Image },
    { href: '/appearance', label: 'Appearance', icon: Palette },
  ]},
  { group: 'STORE', items: [
    { href: '/shipping', label: 'Shipping', icon: Truck },
    { href: '/payments', label: 'Payments', icon: CreditCard },
  ]},
  { group: 'SYSTEM', items: [
    { href: '/users', label: 'Admins', icon: Users },
    { href: '/activity', label: 'Activity Log', icon: Activity },
    { href: '/languages', label: 'Languages', icon: Globe2 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]},
];

export function AdminShell({ children, locale, admin }: { children: React.ReactNode; locale: string; admin: any }) {
  const pathname = usePathname();
  const base = `/${locale}/admin`;
  return (
    <div className="min-h-screen flex bg-bg-primary text-frost" dir="ltr" style={{ direction: 'ltr' }}>
      <aside className="w-64 border-r border-line shrink-0 hidden lg:flex flex-col bg-bg-secondary/40 sticky top-0 h-screen">
        <div className="p-6 border-b border-line">
          <Logo />
          <p className="text-[9px] tracking-cinematic text-electric mt-1">CONTROL ROOM</p>
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
                  <Link key={href} href={href}
                    className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                      active ? 'bg-frost/10 text-frost border-l-2 border-electric' : 'text-muted hover:text-frost hover:bg-white/5'
                    }`}>
                    <Icon className="w-4 h-4" /> {item.label}
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
            <button className="text-xs text-muted hover:text-frost flex items-center gap-2"><LogOut className="w-3 h-3" /> Logout</button>
          </form>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <main className="p-6 lg:p-10 max-w-[1400px]">{children}</main>
      </div>
    </div>
  );
}
