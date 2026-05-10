import { SiteNav } from '@/components/site/nav';
import { SiteFooter } from '@/components/site/footer';
import { SoundToggle } from '@/components/site/sound-toggle';
import { CustomCursor } from '@/components/site/custom-cursor';
import { IntroLoader } from '@/components/site/intro-loader';
import { ToastHost } from '@/components/ui/toast';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IntroLoader />
      <CustomCursor />
      <SiteNav />
      <main className="min-h-screen relative z-[3]">{children}</main>
      <SiteFooter />
      <SoundToggle />
      <ToastHost />
    </>
  );
}
