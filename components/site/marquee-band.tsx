export function MarqueeBand({ items }: { items: string[] }) {
  const all = [...items, ...items, ...items, ...items];
  return (
    <div className="border-y border-line py-7 overflow-hidden bg-bg-secondary/40 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-transparent to-bg-primary z-10 pointer-events-none" />
      <div className="marquee">
        <div className="marquee-track">
          {all.map((item, i) => (
            <span key={i} className="font-display text-2xl sm:text-3xl tracking-cinematic uppercase whitespace-nowrap inline-flex items-center gap-8">
              <span className={i % 3 === 0 ? 'text-electric' : i % 3 === 1 ? 'text-frost' : 'text-gradient-chrome'}>{item}</span>
              <span className="text-blood">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
