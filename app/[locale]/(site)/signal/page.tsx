import { SignalBand } from '@/components/site/signal-band';
import { getTranslations } from 'next-intl/server';

export default async function SignalPage() {
  const t = await getTranslations('signal');
  return (
    <div className="pt-32 container-x pb-20">
      <p className="text-xs tracking-cinematic text-electric font-mono">[ FREQ_01 // ACTIVE ]</p>
      <h1 className="h-display text-7xl sm:text-9xl mt-4">{t('title')}</h1>
      <p className="mt-6 text-muted text-lg max-w-xl">{t('subtitle')}</p>
      <SignalBand />
      <div className="font-mono text-xs text-muted leading-loose space-y-2 mt-12 border border-line p-6">
        <p>&gt; transmission protocol: secure</p>
        <p>&gt; encryption: enabled</p>
        <p>&gt; receiver: AQEEL FANTASIA</p>
        <p>&gt; signal strength: maximum</p>
        <p>&gt; status: <span className="text-electric animate-pulse">listening...</span></p>
      </div>
    </div>
  );
}
