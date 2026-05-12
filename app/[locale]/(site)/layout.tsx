import { PhoneShell } from '@/components/atelier/phone-shell';
import { DesktopNav } from '@/components/atelier/desktop-nav';
import { DesktopFooter } from '@/components/atelier/desktop-footer';
import { BottomNav } from '@/components/atelier/bottomnav';
import { ToastHost } from '@/components/ui/toast';
import { SoundToggle } from '@/components/atelier/sound-toggle';
import { AmbientBackground } from '@/components/atelier/ambient-background';
import { ScrollRevealInit } from '@/components/atelier/scroll-reveal-init';
import { prisma } from '@/lib/db';

async function loadExperienceSettings() {
  try {
    // Intro keys load on the welcome page itself; layout only reads ambient + nav.
    const rows = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            'appearance.background.enabled',
            'appearance.background.type',
            'appearance.background.intensity',
            'appearance.topNav3d.enabled',
            'appearance.topNav3d.intensity',
          ],
        },
      },
    });
    const map = new Map(rows.map((r) => [r.key, r.value]));
    return {
      bgEnabled: map.get('appearance.background.enabled') !== '0',
      bgType: ((map.get('appearance.background.type') as any) || 'rich') as 'motes' | 'fabric' | 'lines' | 'rich' | 'off',
      bgIntensity: Number(map.get('appearance.background.intensity')) || 0.5,
      nav3dEnabled: map.get('appearance.topNav3d.enabled') !== '0',
      nav3dIntensity: Number(map.get('appearance.topNav3d.intensity')) || 0.5,
    };
  } catch {
    return {
      bgEnabled: true,
      bgType: 'rich' as const,
      bgIntensity: 0.7,
      nav3dEnabled: true,
      nav3dIntensity: 0.5,
    };
  }
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await loadExperienceSettings();

  return (
    <PhoneShell mode="dark" accent="champagne">
      <AmbientBackground
        initial={{ enabled: s.bgEnabled, type: s.bgType, intensity: s.bgIntensity }}
      />
      <ScrollRevealInit />
      <DesktopNav enable3d={s.nav3dEnabled} intensity={s.nav3dIntensity} />
      <main className="min-h-screen pb-[80px] md:pb-0 relative z-10">{children}</main>
      <DesktopFooter />
      <BottomNav />
      <SoundToggle />
      <ToastHost />
    </PhoneShell>
  );
}
