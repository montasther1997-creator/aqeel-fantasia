import { PhoneShell } from '@/components/atelier/phone-shell';
import { DesktopNav } from '@/components/atelier/desktop-nav';
import { DesktopFooter } from '@/components/atelier/desktop-footer';
import { BottomNav } from '@/components/atelier/bottomnav';
import { ToastHost } from '@/components/ui/toast';
import { AtelierEntry } from '@/components/atelier/atelier-entry';
import { SoundToggle } from '@/components/atelier/sound-toggle';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <PhoneShell mode="dark" accent="champagne">
      <AtelierEntry />
      <DesktopNav />
      <main className="min-h-screen pb-[80px] md:pb-0">{children}</main>
      <DesktopFooter />
      <BottomNav />
      <SoundToggle />
      <ToastHost />
    </PhoneShell>
  );
}
