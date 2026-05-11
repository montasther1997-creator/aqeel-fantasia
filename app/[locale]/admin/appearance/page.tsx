import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';
import { AppearanceForm } from './appearance-form';

export default async function Appearance({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const settings = await prisma.setting.findMany({ where: { group: 'appearance' } });
  const initial: Record<string, string> = {};
  for (const s of settings) initial[s.key] = s.value;

  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— CONTENT</p>
      <h1 className="h-display text-4xl mt-2 mb-2">Appearance</h1>
      <p className="text-muted text-sm mb-6">Brand identity — video, logo, colors, tagline.</p>

      <AppearanceForm initial={initial} />

      <div className="glass p-6 mt-8 grid lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xs tracking-cinematic text-muted mb-3">— BRAND PALETTE (REFERENCE)</h3>
          <div className="space-y-2">
            {[['Onyx', '#0A0A0A'], ['Pearl', '#F6F4EF'], ['Champagne', '#C9A961'], ['Ash', '#1A1A1A'], ['Burgundy', '#7B1F2A']].map(([n, c]) => (
              <div key={n} className="flex items-center gap-3">
                <div className="w-8 h-8 border border-line" style={{ background: c }} />
                <span className="text-sm">{n}</span>
                <code className="text-xs text-muted ml-auto">{c}</code>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-xs tracking-cinematic text-muted mb-3">— TYPOGRAPHY</h3>
          <p className="font-display text-3xl">DISPLAY · FRAUNCES</p>
          <p className="font-body text-base text-muted mt-2">Body · Inter</p>
          <p className="font-arabic text-base text-muted mt-2">عربي · IBM Plex Arabic / Amiri</p>
        </div>
      </div>
    </div>
  );
}
