import { createContext, useContext, useEffect, useMemo } from 'react';
import brandConfig from '@/brand/brand.config';

const BrandContext = createContext(brandConfig);

/** camelCase -> --kebab, so `primaryDeep` becomes `--c-primary-deep`. */
const toVar = (key) => `--c-${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}`;

/**
 * Writes the tenant palette to CSS custom properties on :root.
 *
 * This is the mechanism that lets every component stay color-free — they
 * reference var(--c-primary), never a hex. tokens.css carries the same values
 * as static fallbacks so nothing flashes unstyled if this is delayed a frame.
 *
 * INJECTED AS A STYLESHEET RULE, NOT INLINE STYLES. An inline custom property
 * on <html> beats every stylesheet rule regardless of specificity, which
 * silently made the dark theme in tokens.css unreachable — the attribute
 * flipped, the variables did not. Emitting a real `:root { … }` rule keeps the
 * tenant palette as the base layer that `:root[data-theme='dark']` can override
 * on specificity, which is how both features coexist.
 */
const STYLE_ID = 'tenant-palette';

export function BrandProvider({ brand = brandConfig, children }) {
  useEffect(() => {
    const declarations = [
      ...Object.entries(brand.colors).map(([key, value]) => `${toVar(key)}: ${value};`),
      ...(brand.chartSeries ?? []).map((value, i) => `--c-series-${i}: ${value};`),
      `--c-series-neutral: ${brand.chartNeutral};`,
      `--c-series-contrast: ${brand.chartContrast};`,
    ].join('\n  ');

    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      /* First in <head> so tokens.css — and its dark block — come after. */
      document.head.prepend(el);
    }
    el.textContent = `:root {\n  ${declarations}\n}`;

    document.documentElement.dataset.tenant = brand.id;
    document.title = `${brand.name} ${brand.productName}`;
  }, [brand]);

  const value = useMemo(() => brand, [brand]);
  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  return useContext(BrandContext);
}

/** Convenience for the many call sites that only need vocabulary. */
export function useTerms() {
  return useContext(BrandContext).terms;
}

export default BrandProvider;
