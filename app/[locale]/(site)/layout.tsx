import { SiteNav } from '@/components/site/nav';
import { SiteFooter } from '@/components/site/footer';
import { SoundToggle } from '@/components/site/sound-toggle';
import { IntroLoader } from '@/components/site/intro-loader';
import { ToastHost } from '@/components/ui/toast';
import { PageTransition } from '@/components/site/page-transition';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IntroLoader />
      <SiteNav />
      <main className="min-h-screen relative z-[3]">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter />
      <SoundToggle />
      <ToastHost />
    </>
  );
}
