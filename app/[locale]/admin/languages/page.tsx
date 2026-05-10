import { requireAdmin } from '@/lib/admin-guard';

export default async function Languages({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— SYSTEM</p>
      <h1 className="h-display text-4xl mt-2 mb-6">Languages</h1>
      <div className="glass p-6 space-y-3">
        <div className="flex items-center justify-between p-3 border border-line">
          <span>🇸🇦 Arabic (AR)</span>
          <span className="text-electric text-xs">DEFAULT</span>
        </div>
        <div className="flex items-center justify-between p-3 border border-line">
          <span>🇬🇧 English (EN)</span>
          <span className="text-electric text-xs">ACTIVE</span>
        </div>
      </div>
      <p className="mt-4 text-muted text-sm">Translation strings are managed in <code className="text-electric">/messages/ar.json</code> and <code className="text-electric">/messages/en.json</code>. Site content is editable via Content Editor.</p>
    </div>
  );
}
