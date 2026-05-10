import { cn } from '@/lib/utils';

export function Logo({ className, mark = false }: { className?: string; mark?: boolean }) {
  if (mark) {
    return (
      <svg viewBox="0 0 40 40" className={cn('w-8 h-8', className)} fill="none">
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1" />
        <path d="M12 26 L20 10 L28 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 22 L25 22" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <div className={cn('font-display tracking-cinematic text-frost', className)}>
      <span className="block text-[10px] tracking-wider2 text-muted">AQEEL</span>
      <span className="block text-xl leading-none">FANTASIA</span>
    </div>
  );
}
