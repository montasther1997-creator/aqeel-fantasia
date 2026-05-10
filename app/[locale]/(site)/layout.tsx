import { PhoneShell } from '@/components/atelier/phone-shell';
import { ToastHost } from '@/components/ui/toast';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PhoneShell mode="dark" accent="champagne">
        {children}
      </PhoneShell>
      <ToastHost />
    </>
  );
}
