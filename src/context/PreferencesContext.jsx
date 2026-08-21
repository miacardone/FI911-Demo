import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readPref, writePref } from '@/utils/storage';

/**
 * USER PREFERENCES — theme and density.
 *
 * Theme is applied by stamping `data-theme="dark"` on <html>. Every colour in
 * this console is already a CSS custom property, so a dark palette is a second
 * block of variable values in tokens.css and NOT a single component change —
 * that is the whole payoff of the no-hard-coded-colour rule.
 *
 * "System" is a real third option rather than a synonym for light: it follows
 * `prefers-color-scheme` live, so a machine that flips to dark at sunset takes
 * the console with it. That is why the resolved theme is tracked separately
 * from the stored choice.
 */

const THEME_KEY = 'fi911.theme';
const DENSITY_KEY = 'fi911.density';

export const THEMES = [
  { id: 'light', label: 'Light', icon: 'eye' },
  { id: 'dark', label: 'Dark', icon: 'dotSolid' },
  { id: 'system', label: 'System', icon: 'cog' },
];

const PreferencesContext = createContext(null);

const prefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

export function PreferencesProvider({ children }) {
  const [theme, setThemeState] = useState(() => readPref(THEME_KEY) ?? 'light');
  const [density, setDensityState] = useState(() => readPref(DENSITY_KEY) ?? 'comfortable');
  const [systemDark, setSystemDark] = useState(prefersDark);

  /* Track the OS setting so "System" stays live rather than being sampled once. */
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return undefined;
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  }, [resolved]);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    writePref(THEME_KEY, next);
  }, []);

  const setDensity = useCallback((next) => {
    setDensityState(next);
    writePref(DENSITY_KEY, next);
  }, []);

  const value = useMemo(
    () => ({ theme, resolved, setTheme, density, setDensity }),
    [theme, resolved, setTheme, density, setDensity],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  return useContext(PreferencesContext) ?? {
    theme: 'light', resolved: 'light', setTheme: () => {}, density: 'comfortable', setDensity: () => {},
  };
}

export default PreferencesProvider;
