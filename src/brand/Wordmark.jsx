import { useBrand } from '@/brand/BrandProvider';

/**
 * Tenant wordmark: logo served from a path in brand.config, plus type.
 * The asset is never imported into this component — swapping tenants swaps a
 * string, not a module graph.
 */
export function Wordmark({ inverse = false, showText = true, size = 26, markOnly = false }) {
  const brand = useBrand();
  /* The collapsed rail is 62px wide — the full lockup would be illegible, so
     it falls back to the badge, which is the recognisable part anyway. */
  const src = markOnly
    ? (inverse ? (brand.logoMarkInverse ?? brand.logoMark ?? brand.logo) : (brand.logoMark ?? brand.logo))
    : (inverse ? (brand.logoInverse ?? brand.logo) : brand.logo);
  const aspect = markOnly
    ? (brand.logoMarkAspectRatio ?? 1)
    : (brand.logoAspectRatio ?? 1);

  return (
    <span className={`wordmark ${inverse ? 'wordmark--inverse' : ''}`.trim()}>
      <img
        src={src}
        alt={brand.wordmark.text ? '' : brand.name}
        height={size}
        width={size * aspect}
        className="wordmark__logo"
        aria-hidden={brand.wordmark.text ? 'true' : undefined}
      />
      {showText && (brand.wordmark.text || brand.wordmark.accent) && (
        <span className="wordmark__text" style={{ fontWeight: brand.wordmark.weight }}>
          {brand.wordmark.text}
          <span className="wordmark__accent">{brand.wordmark.accent}</span>
        </span>
      )}
    </span>
  );
}

export default Wordmark;
