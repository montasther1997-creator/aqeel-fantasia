import { requireAdmin } from '@/lib/admin-guard';

export default async function Payments({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; await requireAdmin(locale);
  return (
    <div>
      <p className="text-xs tracking-cinematic text-muted">— STORE</p>
      <h1 className="h-display text-4xl mt-2 mb-6">Payments</h1>
      <div className="glass p-6 space-y-4">
        <Method name="Cash on Delivery (COD)" enabled />
        <Method name="Credit / Debit Card" />
        <Method name="Bank Transfer" />
        <Method name="ZainCash" />
      </div>
    </div>
  );
}

function Method({ name, enabled = false }: { name: string; enabled?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 border border-line">
      <span>{name}</span>
      <span className={`text-xs tracking-cinematic uppercase ${enabled ? 'text-electric' : 'text-muted'}`}>{enabled ? 'ENABLED' : 'COMING SOON'}</span>
    </div>
  );
}
