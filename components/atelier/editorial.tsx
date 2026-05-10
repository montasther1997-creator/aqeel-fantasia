/**
 * Editorial placeholder — uses CSS gradient variants to evoke matte fashion imagery.
 * Pass an image src to show actual photo instead.
 */
export function Editorial({
  variant = 'v1',
  ratio = '4/5',
  glyph,
  small,
  fade,
  src,
  alt,
  children,
  className = '',
}: {
  variant?: string;
  ratio?: string;
  glyph?: string;
  small?: string;
  fade?: boolean;
  src?: string;
  alt?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`ph-image ${variant} ${className}`} style={{ aspectRatio: ratio === 'auto' ? undefined : ratio, width: '100%' }}>
      {src && <img src={src} alt={alt || ''} className="absolute inset-0 w-full h-full object-cover" />}
      {children}
      {fade && <div className="hero-fade" />}
      {glyph && (
        <div className="glyph">
          <span>{glyph}</span>
          {small && <span className="small">{small}</span>}
        </div>
      )}
    </div>
  );
}
