import { requireAdmin } from '@/lib/admin-guard';
import { prisma } from '@/lib/db';

export default async function Appearance({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  const settings = await prisma.setting.findMany({ where: { group: 'appearance' } });
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— CONTENT</p>
      <h1 className="h-display text-4xl mt-2 mb-6">Appearance</h1>
      <p className="text-muted text-sm mb-6">Manage hero video, logo, colors and visual identity from <a href={`/${locale}/admin/settings`} className="text-electric">Settings</a> (group: appearance) or <a href={`/${locale}/admin/content`} className="text-electric">Content</a>.</p>
      <div className="glass p-6 grid lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xs tracking-cinematic text-muted mb-3">— BRAND COLORS</h3>
          <div className="space-y-2">
            {[['Primary BG', '#0A0A0A'], ['Secondary BG', '#111111'], ['Frost', '#F4F4F6'], ['Chrome', '#C0C0C8'], ['Blood', '#8B0000'], ['Electric', '#0066FF']].map(([n, c]) => (
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
          <p className="font-display text-3xl">DISPLAY · BEBAS NEUE</p>
          <p className="font-body text-base text-muted mt-2">Body · Inter</p>
          <p className="font-arabic text-base text-muted mt-2">عربي · IBM Plex Arabic</p>
        </div>
      </div>
    </div>
  );
}
